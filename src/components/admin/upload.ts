"use client";

import { createUploadTicket, registerCloudinaryUpload } from "@/server/actions/admin/media";
import type { Media } from "@/lib/types";

export type Kind = "image" | "video" | "document";

export const ACCEPT: Record<Kind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/quicktime,video/webm",
  document: "application/pdf",
};

/** Reads dimensions/duration in the browser (used for local dev uploads). */
async function probe(file: File, kind: Kind): Promise<{ width?: number; height?: number; duration?: number }> {
  const url = URL.createObjectURL(file);
  try {
    if (kind === "image") {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { width: img.naturalWidth, height: img.naturalHeight };
    }
    if (kind === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("probe"));
      });
      return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
    }
    return {};
  } catch {
    return {};
  } finally {
    URL.revokeObjectURL(url);
  }
}

function xhrUpload(url: string, body: FormData, onProgress: (pct: number) => void): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let json: unknown = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else {
        const message =
          (json as { error?: string | { message?: string } } | null)?.error ?? `Upload failed (HTTP ${xhr.status}).`;
        reject(new Error(typeof message === "string" ? message : message.message ?? "Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(body);
  });
}

/**
 * Uploads a file straight to storage (Cloudinary signed upload, or the
 * dev-only local endpoint) and returns the registered media record.
 */
export async function uploadFile(file: File, kind: Kind, onProgress: (pct: number) => void): Promise<Media> {
  const ticket = await createUploadTicket({ kind, mime: file.type, bytes: file.size });
  if (ticket.mode === "error") throw new Error(ticket.error);

  if (ticket.mode === "cloudinary") {
    const body = new FormData();
    for (const [k, v] of Object.entries(ticket.fields)) body.append(k, v);
    body.append("file", file);
    const result = await xhrUpload(ticket.endpoint, body, onProgress);
    const registered = await registerCloudinaryUpload({ kind, result });
    if ("error" in registered) throw new Error(registered.error);
    return registered.media;
  }

  const meta = await probe(file, kind);
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  if (meta.width) body.append("width", String(meta.width));
  if (meta.height) body.append("height", String(meta.height));
  if (meta.duration && Number.isFinite(meta.duration)) body.append("duration", String(meta.duration));
  const json = (await xhrUpload(ticket.endpoint, body, onProgress)) as { media: Media };
  return json.media;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
