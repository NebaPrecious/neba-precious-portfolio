import "server-only";

import { createHash } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { getCloudinaryConfig, type CloudinaryConfig } from "@/server/env";

export type MediaKindValue = "image" | "video" | "document";

/** Allow-list of upload types and size limits (bytes). */
export const UPLOAD_RULES: Record<MediaKindValue, { mimes: string[]; maxBytes: number; label: string }> = {
  image: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    maxBytes: 10 * 1024 * 1024,
    label: "JPG, PNG, WebP, AVIF or GIF up to 10 MB",
  },
  video: {
    mimes: ["video/mp4", "video/quicktime", "video/webm"],
    // Cloudinary's free plan caps single video uploads at 100 MB.
    maxBytes: 100 * 1024 * 1024,
    label: "MP4, MOV or WebM up to 100 MB",
  },
  document: {
    mimes: ["application/pdf"],
    maxBytes: 10 * 1024 * 1024,
    label: "PDF up to 10 MB",
  },
};

export function cloudinaryResourceType(kind: MediaKindValue) {
  return kind === "document" ? "raw" : kind;
}

/** Cloudinary API signature: sorted params joined with & + secret, SHA-1. */
export function signCloudinary(params: Record<string, string | number>, secret: string) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/** Verifies the signature Cloudinary returns in an upload response. */
export function verifyCloudinaryResponse(publicId: string, version: number | string, signature: string, config: CloudinaryConfig) {
  const expected = createHash("sha1")
    .update(`public_id=${publicId}&version=${version}${config.apiSecret}`)
    .digest("hex");
  return expected === signature;
}

/** Delivery URLs with automatic quality/format, plus a poster frame for video. */
export function cloudinaryDeliveryUrls(secureUrl: string, kind: MediaKindValue) {
  if (kind === "image") {
    return { url: secureUrl, posterUrl: null };
  }
  if (kind === "video") {
    const url = secureUrl.replace("/video/upload/", "/video/upload/q_auto/");
    const posterUrl = secureUrl
      .replace("/video/upload/", "/video/upload/so_1,q_auto,f_jpg/")
      .replace(/\.[a-z0-9]+$/i, ".jpg");
    return { url, posterUrl };
  }
  return { url: secureUrl, posterUrl: null };
}

export async function destroyCloudinaryAsset(publicId: string, kind: MediaKindValue): Promise<boolean> {
  const config = getCloudinaryConfig();
  if (!config) return false;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, invalidate: "true" };
  const signature = signCloudinary(params, config.apiSecret);
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    api_key: config.apiKey,
    signature,
  });
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${cloudinaryResourceType(kind)}/destroy`,
    { method: "POST", body, signal: AbortSignal.timeout(15_000) },
  );
  if (!res.ok) return false;
  const json = (await res.json()) as { result?: string };
  return json.result === "ok" || json.result === "not found";
}

/* ---- Local development storage ------------------------------------------ */

export const LOCAL_UPLOAD_DIR = "uploads/dev";

export function localUploadPath(fileName: string) {
  return path.join(process.cwd(), "public", LOCAL_UPLOAD_DIR, fileName);
}

/** Only files the app itself uploaded in dev may be deleted from disk. */
export async function deleteLocalUpload(publicId: string) {
  if (!publicId.startsWith(`/${LOCAL_UPLOAD_DIR}/`)) return false;
  const fileName = path.basename(publicId);
  try {
    await unlink(localUploadPath(fileName));
    return true;
  } catch {
    return false;
  }
}

/** Checks the first bytes of a file against its declared type. */
export function sniffMime(bytes: Uint8Array): string | null {
  const hex = Buffer.from(bytes.slice(0, 16)).toString("hex");
  const ascii = Buffer.from(bytes.slice(0, 16)).toString("latin1");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (ascii.startsWith("GIF8")) return "image/gif";
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") return "image/webp";
  if (ascii.slice(4, 12) === "ftypavif") return "image/avif";
  if (ascii.startsWith("%PDF")) return "application/pdf";
  if (hex.startsWith("1a45dfa3")) return "video/webm";
  if (ascii.slice(4, 8) === "ftyp") {
    return ascii.slice(8, 10) === "qt" ? "video/quicktime" : "video/mp4";
  }
  return null;
}
