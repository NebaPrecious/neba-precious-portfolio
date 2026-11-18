"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { TAGS } from "@/server/dal/public";
import { list, str, uuidOrNull, zodFieldErrors, type FormState } from "@/server/admin-helpers";

const text = (maxLen: number, label: string, min = 0) =>
  z
    .string()
    .trim()
    .min(min, { error: `${label} is required.` })
    .max(maxLen, { error: `${label} must be under ${maxLen} characters.` });

const profileSchema = z.object({
  displayName: text(80, "Display name", 1),
  fullName: text(120, "Full name", 1),
  devBrand: text(80, "Development brand", 1),
  studioBrand: text(80, "Studio brand", 1),
  heroIntro: text(400, "Hero introduction", 10),
  shortBio: text(400, "Short biography", 10),
  longBio: text(6000, "Long biography"),
  engineeringApproach: text(1200, "Engineering approach"),
  creativeApproach: text(1200, "Creative approach"),
  location: text(120, "Location", 1),
  email: z.string().trim().max(254).pipe(z.email({ error: "Enter a valid email address." })),
  availability: z.enum(["available", "limited", "unavailable"]),
  availabilityNote: text(200, "Availability note"),
  portraitId: uuidOrNull,
});

type ProfileField = keyof z.infer<typeof profileSchema> | "titles" | "socials" | "openTo";

const socialSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z.url({ protocol: /^https?$/ }),
});

function revalidate() {
  updateTag(TAGS.profile);
}

export async function saveProfile(_prev: FormState, fd: FormData): Promise<FormState<ProfileField>> {
  await requireAdmin();
  const parsed = profileSchema.safeParse(Object.fromEntries(Object.keys(profileSchema.shape).map((k) => [k, str(fd, k)])));
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fields: zodFieldErrors(parsed.error) };
  }

  const titles = [str(fd, "title1"), str(fd, "title2")].map((t) => t.trim().slice(0, 60)).filter(Boolean);
  if (titles.length === 0) {
    return { status: "error", message: "Add at least one professional title.", fields: { titles: "Required." } };
  }
  const openTo = list(str(fd, "openTo"), { max: 10, maxLength: 60 });

  const labels = fd.getAll("socialLabel").map(String);
  const urls = fd.getAll("socialUrl").map(String);
  const socials: { label: string; url: string }[] = [];
  for (let i = 0; i < Math.min(labels.length, urls.length, 10); i++) {
    if (!labels[i].trim() && !urls[i].trim()) continue;
    const s = socialSchema.safeParse({ label: labels[i], url: urls[i] });
    if (!s.success) {
      return {
        status: "error",
        message: `Social link ${i + 1} needs a label and a full https:// URL.`,
        fields: { socials: "Check the social links." },
      };
    }
    socials.push(s.data);
  }

  await getDb()
    .update(schema.profile)
    .set({ ...parsed.data, titles, openTo, socials })
    .where(eq(schema.profile.id, 1));

  revalidate();
  return { status: "success", message: "Profile saved. The public site is updated." };
}

export async function setCv(mediaId: string | null): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = z.uuid().nullable().safeParse(mediaId);
  if (!parsed.success) return { error: "Invalid file." };
  if (parsed.data) {
    const [m] = await getDb().select().from(schema.mediaAssets).where(eq(schema.mediaAssets.id, parsed.data));
    if (!m || m.kind !== "document") return { error: "The CV must be a PDF document." };
  }
  await getDb().update(schema.profile).set({ cvId: parsed.data }).where(eq(schema.profile.id, 1));
  revalidate();
  return {};
}
