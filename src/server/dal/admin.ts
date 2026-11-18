import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { toCategory, toMedia } from "./mappers";
import type { Media } from "@/lib/types";

/* Every function here calls requireAdmin() itself — never rely on the layout. */

export async function getOverview() {
  await requireAdmin();
  const db = getDb();
  const [projects, creative, enquiries, media, profile, recent] = await Promise.all([
    db
      .select({ status: schema.projects.status, n: count() })
      .from(schema.projects)
      .groupBy(schema.projects.status),
    db
      .select({ status: schema.creativeProjects.status, n: count() })
      .from(schema.creativeProjects)
      .groupBy(schema.creativeProjects.status),
    db
      .select({ status: schema.enquiries.status, n: count() })
      .from(schema.enquiries)
      .groupBy(schema.enquiries.status),
    db.select({ n: count() }).from(schema.mediaAssets),
    db.query.profile.findFirst(),
    db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(5),
  ]);

  const sum = (rows: { status: string; n: number }[], status?: string) =>
    rows.filter((r) => !status || r.status === status).reduce((a, r) => a + Number(r.n), 0);

  const projectRows = await db
    .select({ repo: schema.projects.repoUrl, demo: schema.projects.demoUrl })
    .from(schema.projects)
    .where(eq(schema.projects.status, "published"));

  return {
    projects: { total: sum(projects), published: sum(projects, "published") },
    creative: { total: sum(creative), published: sum(creative, "published") },
    enquiries: { total: sum(enquiries), unread: sum(enquiries, "new") },
    mediaCount: Number(media[0]?.n ?? 0),
    recent,
    checklist: {
      hasCv: Boolean(profile?.cvId),
      hasOpenTo: (profile?.openTo.length ?? 0) > 0,
      hasStudioWork: sum(creative, "published") > 0,
      projectsWithoutLinks: projectRows.filter((p) => !p.repo && !p.demo).length,
    },
  };
}

export async function getUnreadCount() {
  await requireAdmin();
  const [row] = await getDb()
    .select({ n: count() })
    .from(schema.enquiries)
    .where(eq(schema.enquiries.status, "new"));
  return Number(row?.n ?? 0);
}

/* ---- Categories ---------------------------------------------------------- */

export async function listCategories(scope: "dev" | "studio" | "skill") {
  await requireAdmin();
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.scope, scope))
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));

  const usage = await (scope === "dev"
    ? db.select({ id: schema.projects.categoryId, n: count() }).from(schema.projects).groupBy(schema.projects.categoryId)
    : scope === "studio"
      ? db
          .select({ id: schema.creativeProjects.categoryId, n: count() })
          .from(schema.creativeProjects)
          .groupBy(schema.creativeProjects.categoryId)
      : db.select({ id: schema.skills.categoryId, n: count() }).from(schema.skills).groupBy(schema.skills.categoryId));

  return rows.map((r) => ({
    ...toCategory(r)!,
    usage: Number(usage.find((u) => u.id === r.id)?.n ?? 0),
  }));
}

/* ---- Projects ------------------------------------------------------------ */

export async function listProjects() {
  await requireAdmin();
  return getDb().query.projects.findMany({
    orderBy: [asc(schema.projects.sortOrder), asc(schema.projects.createdAt)],
    with: { category: true, cover: true, technologies: { orderBy: (t, o) => [o.asc(t.sortOrder)] } },
  });
}

export async function getProjectForEdit(id: string) {
  await requireAdmin();
  const row = await getDb().query.projects.findFirst({
    where: eq(schema.projects.id, id),
    with: {
      cover: true,
      technologies: { orderBy: (t, o) => [o.asc(t.sortOrder)] },
      gallery: { orderBy: (t, o) => [o.asc(t.sortOrder)], with: { media: true } },
    },
  });
  if (!row) return null;
  return {
    ...row,
    cover: toMedia(row.cover),
    gallery: row.gallery.map((g) => toMedia(g.media)).filter((m): m is Media => m !== null),
    technologies: row.technologies.map((t) => t.name),
  };
}

/* ---- Creative ------------------------------------------------------------ */

export async function listCreative() {
  await requireAdmin();
  return getDb().query.creativeProjects.findMany({
    orderBy: [asc(schema.creativeProjects.sortOrder), asc(schema.creativeProjects.createdAt)],
    with: { category: true, cover: true, video: true },
  });
}

export async function getCreativeForEdit(id: string) {
  await requireAdmin();
  const row = await getDb().query.creativeProjects.findFirst({
    where: eq(schema.creativeProjects.id, id),
    with: { cover: true, video: true },
  });
  if (!row) return null;
  return { ...row, cover: toMedia(row.cover), video: toMedia(row.video) };
}

/* ---- Skills -------------------------------------------------------------- */

export async function listSkillsByCategory() {
  await requireAdmin();
  const db = getDb();
  const categories = await listCategories("skill");
  const skills = await db.select().from(schema.skills).orderBy(asc(schema.skills.sortOrder), asc(schema.skills.name));
  return categories.map((c) => ({ category: c, skills: skills.filter((s) => s.categoryId === c.id) }));
}

/* ---- Profile & CV -------------------------------------------------------- */

export async function getProfileForEdit() {
  await requireAdmin();
  const row = await getDb().query.profile.findFirst({ with: { portrait: true, cv: true } });
  if (!row) return null;
  return { ...row, portrait: toMedia(row.portrait), cv: toMedia(row.cv) };
}

/* ---- Inbox --------------------------------------------------------------- */

export async function listEnquiries(status?: "new" | "read" | "handled") {
  await requireAdmin();
  return getDb()
    .select()
    .from(schema.enquiries)
    .where(status ? eq(schema.enquiries.status, status) : undefined)
    .orderBy(desc(schema.enquiries.createdAt))
    .limit(200);
}

export async function getEnquiry(id: string) {
  await requireAdmin();
  const [row] = await getDb().select().from(schema.enquiries).where(eq(schema.enquiries.id, id));
  return row ?? null;
}

/* ---- Media --------------------------------------------------------------- */

/** All media with a usage count across every table that references it. */
export async function listMediaWithUsage(kind?: "image" | "video" | "document") {
  await requireAdmin();
  const m = schema.mediaAssets;
  const rows = await getDb()
    .select({
      media: m,
      // Fully-qualified column names: drizzle renders bare names inside subqueries.
      usage: sql<number>`(
        (select count(*) from "profile" p where p.portrait_id = "media_assets"."id" or p.cv_id = "media_assets"."id")
        + (select count(*) from "projects" pr where pr.cover_id = "media_assets"."id")
        + (select count(*) from "project_media" pm where pm.media_id = "media_assets"."id")
        + (select count(*) from "creative_projects" c where c.cover_id = "media_assets"."id" or c.video_id = "media_assets"."id")
      )::int`,
    })
    .from(m)
    .where(kind ? and(eq(m.kind, kind)) : undefined)
    .orderBy(desc(m.createdAt));

  return rows.map((r) => ({
    ...toMedia(r.media)!,
    provider: r.media.provider,
    publicId: r.media.publicId,
    createdAt: r.media.createdAt,
    usage: Number(r.usage),
  }));
}
