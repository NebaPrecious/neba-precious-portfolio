"use server";

import { and, asc, eq, max } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { TAGS } from "@/server/dal/public";
import { bool, isUniqueViolation, str, type FormState } from "@/server/admin-helpers";
import { slugify } from "@/lib/validation";

function revalidate() {
  refresh();
  updateTag(TAGS.categories);
  updateTag(TAGS.skills);
  updateTag(TAGS.projects);
  updateTag(TAGS.creative);
}

const scopeSchema = z.enum(["dev", "studio", "skill"]);
const nameSchema = z.string().trim().min(1, { error: "Name is required." }).max(60, { error: "Keep it under 60 characters." });

/* ---- Categories ---------------------------------------------------------- */

export async function createCategory(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const scope = scopeSchema.safeParse(str(fd, "scope"));
  const name = nameSchema.safeParse(str(fd, "name"));
  if (!scope.success || !name.success) return { status: "error", message: name.error?.issues[0]?.message ?? "Invalid category." };

  const slug = slugify(name.data) || `category-${Date.now()}`;
  const db = getDb();
  try {
    const [{ value }] = await db
      .select({ value: max(schema.categories.sortOrder) })
      .from(schema.categories)
      .where(eq(schema.categories.scope, scope.data));
    await db.insert(schema.categories).values({ scope: scope.data, name: name.data, slug, sortOrder: (value ?? -1) + 1 });
  } catch (error) {
    if (isUniqueViolation(error)) return { status: "error", message: "A category with that name already exists." };
    return { status: "error", message: "Could not create the category." };
  }
  revalidate();
  return { status: "success", message: `Added “${name.data}”.` };
}

export async function renameCategory(id: string, name: string): Promise<{ error?: string }> {
  await requireAdmin();
  const parsedId = z.uuid().safeParse(id);
  const parsedName = nameSchema.safeParse(name);
  if (!parsedId.success || !parsedName.success) return { error: parsedName.error?.issues[0]?.message ?? "Invalid." };
  try {
    await getDb()
      .update(schema.categories)
      .set({ name: parsedName.data, slug: slugify(parsedName.data) })
      .where(eq(schema.categories.id, parsedId.data));
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "A category with that name already exists." };
    return { error: "Could not rename." };
  }
  revalidate();
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { error: "Invalid." };
  const db = getDb();
  const [skill] = await db.select({ id: schema.skills.id }).from(schema.skills).where(eq(schema.skills.categoryId, parsed.data)).limit(1);
  if (skill) return { error: "Move or delete the skills in this group first." };
  // Projects/studio entries fall back to "uncategorised" (FK set null).
  await db.delete(schema.categories).where(eq(schema.categories.id, parsed.data));
  revalidate();
  return {};
}

export async function moveCategory(id: string, direction: "up" | "down") {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  const [cat] = await db.select().from(schema.categories).where(eq(schema.categories.id, parsed));
  if (!cat) return;
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.scope, cat.scope))
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
    const order = rows.map((r) => r.id);
    const i = order.indexOf(parsed);
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    for (const [index, rowId] of order.entries()) {
      await tx.update(schema.categories).set({ sortOrder: index }).where(eq(schema.categories.id, rowId));
    }
  });
  revalidate();
}

/* ---- Skills -------------------------------------------------------------- */

const skillSchema = z.object({
  name: nameSchema,
  note: z.string().trim().max(40, { error: "Keep the note short (e.g. “Learning”)." }),
  categoryId: z.uuid({ error: "Choose a group." }),
});

export async function createSkill(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = skillSchema.safeParse({ name: str(fd, "name"), note: str(fd, "note"), categoryId: str(fd, "categoryId") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const db = getDb();
  const [{ value }] = await db
    .select({ value: max(schema.skills.sortOrder) })
    .from(schema.skills)
    .where(eq(schema.skills.categoryId, parsed.data.categoryId));
  await db.insert(schema.skills).values({ ...parsed.data, sortOrder: (value ?? -1) + 1 });
  revalidate();
  return { status: "success", message: `Added “${parsed.data.name}”.` };
}

export async function updateSkill(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(str(fd, "id"));
  const parsed = skillSchema.safeParse({ name: str(fd, "name"), note: str(fd, "note"), categoryId: str(fd, "categoryId") });
  if (!id.success || !parsed.success) return { status: "error", message: parsed.error?.issues[0]?.message ?? "Invalid." };
  await getDb()
    .update(schema.skills)
    .set({ ...parsed.data, visible: bool(fd, "visible") })
    .where(eq(schema.skills.id, id.data));
  revalidate();
  return { status: "success", message: "Saved." };
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await getDb().delete(schema.skills).where(eq(schema.skills.id, z.uuid().parse(id)));
  revalidate();
}

export async function toggleSkillVisibility(id: string, visible: boolean) {
  await requireAdmin();
  await getDb().update(schema.skills).set({ visible }).where(eq(schema.skills.id, z.uuid().parse(id)));
  revalidate();
}

export async function moveSkill(id: string, direction: "up" | "down") {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  const [skill] = await db.select().from(schema.skills).where(eq(schema.skills.id, parsed));
  if (!skill) return;
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: schema.skills.id })
      .from(schema.skills)
      .where(and(eq(schema.skills.categoryId, skill.categoryId)))
      .orderBy(asc(schema.skills.sortOrder), asc(schema.skills.name));
    const order = rows.map((r) => r.id);
    const i = order.indexOf(parsed);
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    for (const [index, rowId] of order.entries()) {
      await tx.update(schema.skills).set({ sortOrder: index }).where(eq(schema.skills.id, rowId));
    }
  });
  revalidate();
}
