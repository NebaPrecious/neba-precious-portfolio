"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { TAGS } from "@/server/dal/public";

/** Re-reads everything for the public site (use after scripts edit the DB directly). */
export async function refreshPublicSite(): Promise<{ ok: true }> {
  await requireAdmin();
  for (const tag of Object.values(TAGS)) updateTag(tag);
  return { ok: true };
}
