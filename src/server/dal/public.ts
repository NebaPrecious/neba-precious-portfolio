import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema } from "@/server/db";
import { toCategory, toMedia } from "./mappers";
import type {
  CategoryDTO,
  CreativeDTO,
  ProfileDTO,
  ProjectDTO,
  SkillGroupDTO,
} from "@/lib/types";

/** Cache tags. Admin mutations call `updateTag()` with these. */
export const TAGS = {
  profile: "profile",
  projects: "projects",
  creative: "creative",
  skills: "skills",
  categories: "categories",
} as const;

/* -------------------------------------------------------------------------- */

export async function getProfile(): Promise<ProfileDTO | null> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.profile);

  const row = await getDb().query.profile.findFirst({
    with: { portrait: true, cv: true },
  });
  if (!row) return null;

  return {
    displayName: row.displayName,
    fullName: row.fullName,
    devBrand: row.devBrand,
    studioBrand: row.studioBrand,
    titles: row.titles,
    heroIntro: row.heroIntro,
    shortBio: row.shortBio,
    longBio: row.longBio,
    engineeringApproach: row.engineeringApproach,
    creativeApproach: row.creativeApproach,
    openTo: row.openTo,
    location: row.location,
    email: row.email,
    availability: row.availability,
    availabilityNote: row.availabilityNote,
    socials: row.socials,
    portrait: toMedia(row.portrait),
    cv: toMedia(row.cv),
  };
}

/** Throws if the profile row is missing — the seed or admin must create it. */
export async function requireProfile(): Promise<ProfileDTO> {
  const profile = await getProfile();
  if (!profile) {
    throw new Error("Profile is missing. Run `npm run db:seed`.");
  }
  return profile;
}

/* -------------------------------------------------------------------------- */

type ProjectRow = Awaited<ReturnType<typeof findProjects>>[number];

function findProjects() {
  return getDb().query.projects.findMany({
    where: eq(schema.projects.status, "published"),
    orderBy: [asc(schema.projects.sortOrder), asc(schema.projects.createdAt)],
    with: {
      category: true,
      cover: true,
      technologies: { orderBy: (t, o) => [o.asc(t.sortOrder)] },
      gallery: { orderBy: (t, o) => [o.asc(t.sortOrder)], with: { media: true } },
    },
  });
}

function toProject(row: ProjectRow): ProjectDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    body: row.body,
    stage: row.stage,
    role: row.role,
    confidentialityNote: row.confidentialityNote,
    category: toCategory(row.category),
    cover: toMedia(row.cover),
    gallery: row.gallery.map((g) => toMedia(g.media)).filter((m) => m !== null),
    technologies: row.technologies.map((t) => t.name),
    repoUrl: row.repoUrl,
    demoUrl: row.demoUrl,
    year: row.year,
    featured: row.featured,
    isSample: row.isSample,
  };
}

export async function getPublishedProjects(): Promise<ProjectDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);

  const rows = await findProjects();
  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const all = await getPublishedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */

type CreativeRow = Awaited<ReturnType<typeof findCreative>>[number];

function findCreative() {
  return getDb().query.creativeProjects.findMany({
    where: eq(schema.creativeProjects.status, "published"),
    orderBy: [asc(schema.creativeProjects.sortOrder), asc(schema.creativeProjects.createdAt)],
    with: { category: true, cover: true, video: true },
  });
}

function toCreative(row: CreativeRow): CreativeDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: toCategory(row.category),
    cover: toMedia(row.cover),
    video: toMedia(row.video),
    externalUrl: row.externalUrl,
    aspect: row.aspect,
    tools: row.tools,
    year: row.year,
    featured: row.featured,
    isSample: row.isSample,
  };
}

export async function getPublishedCreative(): Promise<CreativeDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.creative);

  const rows = await findCreative();
  return rows.map(toCreative);
}

export async function getCreativeBySlug(slug: string): Promise<CreativeDTO | null> {
  const all = await getPublishedCreative();
  return all.find((c) => c.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */

export async function getCategories(scope: "dev" | "studio" | "skill"): Promise<CategoryDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.categories);

  const rows = await getDb()
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.scope, scope))
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
}

export async function getSkillGroups(): Promise<SkillGroupDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.skills, TAGS.categories);

  const rows = await getDb()
    .select({ skill: schema.skills, category: schema.categories })
    .from(schema.skills)
    .innerJoin(schema.categories, eq(schema.skills.categoryId, schema.categories.id))
    .where(and(eq(schema.skills.visible, true), eq(schema.categories.scope, "skill")))
    .orderBy(asc(schema.categories.sortOrder), asc(schema.skills.sortOrder));

  const groups = new Map<string, SkillGroupDTO>();
  for (const { skill, category } of rows) {
    let group = groups.get(category.id);
    if (!group) {
      group = { category: { id: category.id, name: category.name, slug: category.slug }, skills: [] };
      groups.set(category.id, group);
    }
    group.skills.push({ id: skill.id, name: skill.name, note: skill.note });
  }
  return [...groups.values()];
}
