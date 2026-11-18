import "server-only";

import type { Category, MediaAsset } from "@/server/db/schema";
import type { CategoryDTO, Media } from "@/lib/types";

export function toMedia(row: MediaAsset | null | undefined): Media | null {
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    posterUrl: row.posterUrl,
    width: row.width,
    height: row.height,
    durationSeconds: row.durationSeconds,
    alt: row.alt,
    format: row.format,
    bytes: row.bytes,
    originalFilename: row.originalFilename,
  };
}

export function toCategory(row: Category | null | undefined): CategoryDTO | null {
  if (!row) return null;
  return { id: row.id, name: row.name, slug: row.slug };
}
