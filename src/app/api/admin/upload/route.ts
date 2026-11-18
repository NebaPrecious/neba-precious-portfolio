import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { getSession } from "@/server/auth/session";
import { localUploadsAllowed } from "@/server/env";
import { LOCAL_UPLOAD_DIR, UPLOAD_RULES, localUploadPath, sniffMime } from "@/server/media";
import { toMedia } from "@/server/dal/mappers";
import { assertSameOrigin } from "@/server/security";

/**
 * DEVELOPMENT-ONLY upload endpoint used when Cloudinary isn't configured.
 * Disabled in production: serverless filesystems are not persistent.
 */
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

const metaSchema = z.object({
  kind: z.enum(["image", "video", "document"]),
  width: z.coerce.number().int().positive().max(20000).optional(),
  height: z.coerce.number().int().positive().max(20000).optional(),
  duration: z.coerce.number().positive().max(60 * 60 * 6).optional(),
  alt: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  if (!localUploadsAllowed()) {
    return NextResponse.json({ error: "Local uploads are disabled." }, { status: 404 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const meta = metaSchema.safeParse({
    kind: form.get("kind"),
    width: form.get("width") || undefined,
    height: form.get("height") || undefined,
    duration: form.get("duration") || undefined,
    alt: form.get("alt") || undefined,
  });
  if (!(file instanceof File) || !meta.success) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const rules = UPLOAD_RULES[meta.data.kind];
  if (file.size > rules.maxBytes) {
    return NextResponse.json({ error: `File is too large. Use ${rules.label}.` }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffMime(bytes);
  if (!sniffed || !rules.mimes.includes(sniffed)) {
    return NextResponse.json({ error: `Unsupported file type. Use ${rules.label}.` }, { status: 415 });
  }

  const fileName = `${randomUUID()}.${EXT[sniffed]}`;
  await mkdir(path.dirname(localUploadPath(fileName)), { recursive: true });
  await writeFile(localUploadPath(fileName), bytes);

  const publicPath = `/${LOCAL_UPLOAD_DIR}/${fileName}`;
  const [row] = await getDb()
    .insert(schema.mediaAssets)
    .values({
      kind: meta.data.kind,
      provider: "local",
      publicId: publicPath,
      url: publicPath,
      width: meta.data.width ?? null,
      height: meta.data.height ?? null,
      durationSeconds: meta.data.duration ?? null,
      bytes: file.size,
      format: EXT[sniffed],
      originalFilename: file.name.slice(0, 255),
      alt: meta.data.alt ?? "",
    })
    .returning();

  return NextResponse.json({ media: toMedia(row) });
}
