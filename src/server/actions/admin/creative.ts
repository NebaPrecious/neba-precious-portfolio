"use server";

import { asc, eq, max } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { TAGS } from "@/server/dal/public";
import {
  bool,
  isUniqueViolation,
  list,
  str,
  uuidOrNull,
  yearField,
  zodFieldErrors,
  type FormState,
} from "@/server/admin-helpers";
import { optionalUrl, slugSchema } from "@/lib/validation";

const creativeSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(120),
  slug: slugSchema,
  summary: z
    .string()
    .trim()
    .min(10, { error: "Write a short description (at least 10 characters)." })
    .max(400, { error: "Keep the description under 400 characters." }),
  body: z.string().trim().max(10000),
  categoryId: uuidOrNull,
  coverId: uuidOrNull,
  videoId: uuidOrNull,
  externalUrl: optionalUrl,
  aspect: z.enum(["landscape", "portrait", "square"]),
  year: yearField,
  status: z.enum(["draft", "published"]),
});

type CreativeField = keyof z.infer<typeof creativeSchema> | "tools";

function revalidate() {
  refresh();
  updateTag(TAGS.creative);
}

export async function saveCreative(_prev: FormState, fd: FormData): Promise<FormState<CreativeField>> {
  await requireAdmin();
  const id = str(fd, "id");
  if (id && !z.uuid().safeParse(id).success) return { status: "error", message: "Invalid entry." };

  const parsed = creativeSchema.safeParse({
    title: str(fd, "title"),
    slug: str(fd, "slug"),
    summary: str(fd, "summary"),
    body: str(fd, "body"),
    categoryId: str(fd, "categoryId"),
    coverId: str(fd, "coverId"),
    videoId: str(fd, "videoId"),
    externalUrl: str(fd, "externalUrl"),
    aspect: str(fd, "aspect"),
    year: str(fd, "year"),
    status: str(fd, "status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fields: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  // Honesty guard: published work must show the actual work.
  if (data.status === "published" && !data.coverId && !data.videoId) {
    return {
      status: "error",
      message: "Add a cover image or upload the video before publishing.",
      fields: { coverId: "Required to publish." },
    };
  }

  const tools = list(str(fd, "tools"), { max: 15, maxLength: 40 });
  const featured = bool(fd, "featured");
  const db = getDb();

  try {
    const [existing] = id
      ? await db.select().from(schema.creativeProjects).where(eq(schema.creativeProjects.id, id))
      : [];
    if (id && !existing) return { status: "error", message: "This entry no longer exists." };
    const publishedAt =
      data.status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

    if (existing) {
      await db
        .update(schema.creativeProjects)
        .set({ ...data, tools, featured, publishedAt })
        .where(eq(schema.creativeProjects.id, id));
    } else {
      const [{ value }] = await db.select({ value: max(schema.creativeProjects.sortOrder) }).from(schema.creativeProjects);
      await db
        .insert(schema.creativeProjects)
        .values({ ...data, tools, featured, publishedAt, sortOrder: (value ?? -1) + 1 });
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: "That slug is already used.", fields: { slug: "Choose a different slug." } };
    }
    console.error("[admin] saveCreative failed");
    return { status: "error", message: "Could not save. Please try again." };
  }

  revalidate();
  redirect(`/admin/studio?notice=${id ? "saved" : "created"}`);
}

export async function deleteCreative(id: string) {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  await getDb().delete(schema.creativeProjects).where(eq(schema.creativeProjects.id, parsed));
  revalidate();
  redirect("/admin/studio?notice=deleted");
}

export async function setCreativeFlag(
  id: string,
  flag: "featured" | "published",
  value: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  const [row] = await db.select().from(schema.creativeProjects).where(eq(schema.creativeProjects.id, parsed));
  if (!row) return { error: "Not found." };
  if (flag === "featured") {
    await db.update(schema.creativeProjects).set({ featured: value }).where(eq(schema.creativeProjects.id, parsed));
  } else {
    if (value && !row.coverId && !row.videoId) {
      return { error: "Add a cover image or video before publishing." };
    }
    await db
      .update(schema.creativeProjects)
      .set({ status: value ? "published" : "draft", publishedAt: value ? (row.publishedAt ?? new Date()) : row.publishedAt })
      .where(eq(schema.creativeProjects.id, parsed));
  }
  revalidate();
  return {};
}

export async function moveCreative(id: string, direction: "up" | "down") {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: schema.creativeProjects.id })
      .from(schema.creativeProjects)
      .orderBy(asc(schema.creativeProjects.sortOrder), asc(schema.creativeProjects.createdAt));
    const order = rows.map((r) => r.id);
    const i = order.indexOf(parsed);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    for (const [index, rowId] of order.entries()) {
      await tx.update(schema.creativeProjects).set({ sortOrder: index }).where(eq(schema.creativeProjects.id, rowId));
    }
  });
  revalidate();
}
