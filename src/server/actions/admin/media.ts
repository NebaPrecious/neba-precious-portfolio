"use server";

import { eq, or } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { getCloudinaryConfig, localUploadsAllowed } from "@/server/env";
import {
  UPLOAD_RULES,
  cloudinaryDeliveryUrls,
  cloudinaryResourceType,
  deleteLocalUpload,
  destroyCloudinaryAsset,
  signCloudinary,
  verifyCloudinaryResponse,
  type MediaKindValue,
} from "@/server/media";
import { listMediaWithUsage } from "@/server/dal/admin";
import { toMedia } from "@/server/dal/mappers";
import { TAGS } from "@/server/dal/public";
import type { Media } from "@/lib/types";

const kindSchema = z.enum(["image", "video", "document"]);

function revalidateAll() {
  for (const tag of Object.values(TAGS)) updateTag(tag);
}

export type UploadTicket =
  | {
      mode: "cloudinary";
      endpoint: string;
      fields: Record<string, string>;
    }
  | { mode: "local"; endpoint: string }
  | { mode: "error"; error: string };

/** Step 1: validate the intended upload and hand back where/how to send it. */
export async function createUploadTicket(input: {
  kind: MediaKindValue;
  mime: string;
  bytes: number;
}): Promise<UploadTicket> {
  await requireAdmin();
  const parsed = z
    .object({ kind: kindSchema, mime: z.string().max(100), bytes: z.number().int().positive() })
    .safeParse(input);
  if (!parsed.success) return { mode: "error", error: "Invalid upload request." };

  const { kind, mime, bytes } = parsed.data;
  const rules = UPLOAD_RULES[kind];
  if (!rules.mimes.includes(mime)) return { mode: "error", error: `Unsupported file type. Use ${rules.label}.` };
  if (bytes > rules.maxBytes) return { mode: "error", error: `File is too large. Use ${rules.label}.` };

  const config = getCloudinaryConfig();
  if (config) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${config.folder}/${kind}s`;
    const params = { folder, timestamp };
    return {
      mode: "cloudinary",
      endpoint: `https://api.cloudinary.com/v1_1/${config.cloudName}/${cloudinaryResourceType(kind)}/upload`,
      fields: {
        folder,
        timestamp: String(timestamp),
        api_key: config.apiKey,
        signature: signCloudinary(params, config.apiSecret),
      },
    };
  }

  if (localUploadsAllowed()) {
    return { mode: "local", endpoint: "/api/admin/upload" };
  }

  return {
    mode: "error",
    error: "Media storage is not configured. Add the Cloudinary environment variables (see README → Media).",
  };
}

const cloudinaryResultSchema = z.object({
  public_id: z.string().min(1).max(512),
  version: z.union([z.number(), z.string()]),
  signature: z.string().min(10).max(128),
  secure_url: z.url(),
  resource_type: z.enum(["image", "video", "raw"]),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  duration: z.number().optional(),
  format: z.string().max(20).optional(),
  original_filename: z.string().max(255).optional(),
});

/** Step 2 (Cloudinary): verify Cloudinary's signed response, then record it. */
export async function registerCloudinaryUpload(input: {
  kind: MediaKindValue;
  result: unknown;
  alt?: string;
}): Promise<{ media: Media } | { error: string }> {
  await requireAdmin();
  const config = getCloudinaryConfig();
  const kind = kindSchema.safeParse(input.kind);
  const parsed = cloudinaryResultSchema.safeParse(input.result);
  if (!config || !kind.success || !parsed.success) return { error: "Upload could not be verified." };

  const r = parsed.data;
  if (!verifyCloudinaryResponse(r.public_id, r.version, r.signature, config)) {
    return { error: "Upload signature mismatch." };
  }
  if (!r.secure_url.startsWith(`https://res.cloudinary.com/${config.cloudName}/`)) {
    return { error: "Unexpected media host." };
  }
  if (r.bytes > UPLOAD_RULES[kind.data].maxBytes) {
    await destroyCloudinaryAsset(r.public_id, kind.data);
    return { error: "File exceeded the size limit and was removed." };
  }

  const urls = cloudinaryDeliveryUrls(r.secure_url, kind.data);
  const [row] = await getDb()
    .insert(schema.mediaAssets)
    .values({
      kind: kind.data,
      provider: "cloudinary",
      publicId: r.public_id,
      url: urls.url,
      posterUrl: urls.posterUrl,
      width: r.width ?? null,
      height: r.height ?? null,
      durationSeconds: r.duration ?? null,
      bytes: r.bytes,
      format: r.format ?? null,
      originalFilename: r.original_filename ?? null,
      alt: (input.alt ?? "").slice(0, 300),
    })
    .returning();

  return { media: toMedia(row)! };
}

/** For the media picker. */
export async function listMediaForPicker(kind: MediaKindValue) {
  await requireAdmin();
  const parsed = kindSchema.parse(kind);
  return listMediaWithUsage(parsed);
}

export async function updateMediaAlt(id: string, alt: string): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), alt: z.string().trim().max(300) }).safeParse({ id, alt });
  if (!parsed.success) return { error: "Alt text must be under 300 characters." };
  await getDb().update(schema.mediaAssets).set({ alt: parsed.data.alt }).where(eq(schema.mediaAssets.id, parsed.data.id));
  revalidateAll();
  return { ok: true };
}

/** Deletes an asset only when nothing references it. */
export async function deleteMedia(id: string): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) return { error: "Invalid media id." };
  const db = getDb();

  const [asset] = await db.select().from(schema.mediaAssets).where(eq(schema.mediaAssets.id, parsedId.data));
  if (!asset) return { error: "Media not found." };

  const [inProfile, inProjects, inGallery, inCreative] = await Promise.all([
    db
      .select({ id: schema.profile.id })
      .from(schema.profile)
      .where(or(eq(schema.profile.portraitId, asset.id), eq(schema.profile.cvId, asset.id))),
    db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.coverId, asset.id)),
    db.select({ id: schema.projectMedia.projectId }).from(schema.projectMedia).where(eq(schema.projectMedia.mediaId, asset.id)),
    db
      .select({ id: schema.creativeProjects.id })
      .from(schema.creativeProjects)
      .where(or(eq(schema.creativeProjects.coverId, asset.id), eq(schema.creativeProjects.videoId, asset.id))),
  ]);
  if (inProfile.length + inProjects.length + inGallery.length + inCreative.length > 0) {
    return { error: "This file is still in use. Remove it from the profile, project or studio entry first." };
  }

  if (asset.provider === "cloudinary") {
    const removed = await destroyCloudinaryAsset(asset.publicId, asset.kind);
    if (!removed) return { error: "Cloudinary could not delete the file. Nothing was changed." };
  } else {
    // Committed files in /public stay on disk; only dev uploads are removed.
    await deleteLocalUpload(asset.publicId);
  }

  await db.delete(schema.mediaAssets).where(eq(schema.mediaAssets.id, asset.id));
  return { ok: true };
}
