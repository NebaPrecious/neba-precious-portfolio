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
  uuidList,
  uuidOrNull,
  yearField,
  zodFieldErrors,
  type FormState,
} from "@/server/admin-helpers";
import { optionalUrl, slugSchema } from "@/lib/validation";

const projectSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(120),
  slug: slugSchema,
  summary: z
    .string()
    .trim()
    .min(10, { error: "Write a short description (at least 10 characters)." })
    .max(400, { error: "Keep the description under 400 characters." }),
  body: z.string().trim().max(10000),
  stage: z.string().trim().max(80),
  role: z.string().trim().max(120),
  confidentialityNote: z.string().trim().max(600),
  categoryId: uuidOrNull,
  coverId: uuidOrNull,
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  year: yearField,
  status: z.enum(["draft", "published"]),
});

type ProjectField = keyof z.infer<typeof projectSchema> | "technologies";

function revalidate() {
  refresh();
  updateTag(TAGS.projects);
}

export async function saveProject(_prev: FormState, fd: FormData): Promise<FormState<ProjectField>> {
  await requireAdmin();
  const id = str(fd, "id");
  if (id && !z.uuid().safeParse(id).success) return { status: "error", message: "Invalid project." };

  const parsed = projectSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    summary: str(fd, "summary"),
    body: str(fd, "body"),
    stage: str(fd, "stage"),
    role: str(fd, "role"),
    confidentialityNote: str(fd, "confidentialityNote"),
    categoryId: str(fd, "categoryId"),
    coverId: str(fd, "coverId"),
    repoUrl: str(fd, "repoUrl"),
    demoUrl: str(fd, "demoUrl"),
    year: str(fd, "year"),
    status: str(fd, "status"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fields: zodFieldErrors(parsed.error) };
  }

  const technologies = list(str(fd, "technologies"), { max: 20, maxLength: 40 });
  const galleryIds = uuidList(str(fd, "galleryIds"));
  const featured = bool(fd, "featured");
  const data = parsed.data;
  const db = getDb();

  try {
    await db.transaction(async (tx) => {
      let projectId = id;
      const existing = id
        ? (await tx.select().from(schema.projects).where(eq(schema.projects.id, id)))[0]
        : undefined;
      if (id && !existing) throw new Error("not-found");

      const publishedAt =
        data.status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

      if (existing) {
        await tx
          .update(schema.projects)
          .set({ ...data, featured, publishedAt })
          .where(eq(schema.projects.id, id));
      } else {
        const [{ value }] = await tx.select({ value: max(schema.projects.sortOrder) }).from(schema.projects);
        const [created] = await tx
          .insert(schema.projects)
          .values({ ...data, featured, publishedAt, sortOrder: (value ?? -1) + 1 })
          .returning({ id: schema.projects.id });
        projectId = created.id;
      }

      await tx.delete(schema.projectTechnologies).where(eq(schema.projectTechnologies.projectId, projectId));
      if (technologies.length) {
        await tx
          .insert(schema.projectTechnologies)
          .values(technologies.map((name, i) => ({ projectId, name, sortOrder: i })));
      }

      await tx.delete(schema.projectMedia).where(eq(schema.projectMedia.projectId, projectId));
      if (galleryIds.length) {
        await tx
          .insert(schema.projectMedia)
          .values(galleryIds.map((mediaId, i) => ({ projectId, mediaId, sortOrder: i })));
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: "That slug is already used.", fields: { slug: "Choose a different slug." } };
    }
    if (error instanceof Error && error.message === "not-found") {
      return { status: "error", message: "This project no longer exists." };
    }
    console.error("[admin] saveProject failed");
    return { status: "error", message: "Could not save the project. Please try again." };
  }

  revalidate();
  redirect(`/admin/projects?notice=${id ? "saved" : "created"}`);
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  await getDb().delete(schema.projects).where(eq(schema.projects.id, parsed));
  revalidate();
  redirect("/admin/projects?notice=deleted");
}

export async function setProjectFlag(id: string, flag: "featured" | "published", value: boolean) {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  if (flag === "featured") {
    await db.update(schema.projects).set({ featured: value }).where(eq(schema.projects.id, parsed));
  } else {
    const [row] = await db.select().from(schema.projects).where(eq(schema.projects.id, parsed));
    if (!row) return;
    await db
      .update(schema.projects)
      .set({ status: value ? "published" : "draft", publishedAt: value ? (row.publishedAt ?? new Date()) : row.publishedAt })
      .where(eq(schema.projects.id, parsed));
  }
  revalidate();
}

export async function moveProject(id: string, direction: "up" | "down") {
  await requireAdmin();
  const parsed = z.uuid().parse(id);
  const db = getDb();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .orderBy(asc(schema.projects.sortOrder), asc(schema.projects.createdAt));
    const order = rows.map((r) => r.id);
    const i = order.indexOf(parsed);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    for (const [index, rowId] of order.entries()) {
      await tx.update(schema.projects).set({ sortOrder: index }).where(eq(schema.projects.id, rowId));
    }
  });
  revalidate();
}
