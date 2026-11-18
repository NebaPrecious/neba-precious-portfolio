import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ----------------------------------------------------------------------------
 * Enums
 * ------------------------------------------------------------------------- */

export const publishStatus = pgEnum("publish_status", ["draft", "published"]);

/** Which part of the site a category belongs to. */
export const categoryScope = pgEnum("category_scope", ["dev", "studio", "skill"]);

export const mediaKind = pgEnum("media_kind", ["image", "video", "document"]);

/** Where the binary lives. `local` = committed file in /public or dev-only uploads. */
export const mediaProvider = pgEnum("media_provider", ["cloudinary", "local"]);

export const mediaAspect = pgEnum("media_aspect", ["landscape", "portrait", "square"]);

export const enquiryStatus = pgEnum("enquiry_status", ["new", "read", "handled"]);

export const enquiryType = pgEnum("enquiry_type", [
  "software",
  "website",
  "video_editing",
  "videography",
  "collaboration",
  "employment",
  "general",
]);

export const availabilityStatus = pgEnum("availability_status", [
  "available",
  "limited",
  "unavailable",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ----------------------------------------------------------------------------
 * Auth
 * ------------------------------------------------------------------------- */

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

/** Sessions store only the SHA-256 hash of the cookie token. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Throttling buckets. `key` is a hash, never a raw IP or email. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

/* ----------------------------------------------------------------------------
 * Media
 * ------------------------------------------------------------------------- */

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: mediaKind("kind").notNull(),
    provider: mediaProvider("provider").notNull(),
    /** Cloudinary public_id, or the path under /public for local files. */
    publicId: text("public_id").notNull(),
    url: text("url").notNull(),
    /** Poster frame for videos. */
    posterUrl: text("poster_url"),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: real("duration_seconds"),
    bytes: integer("bytes"),
    format: text("format"),
    originalFilename: text("original_filename"),
    alt: text("alt").notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("media_provider_public_id_idx").on(t.provider, t.publicId)],
);

/* ----------------------------------------------------------------------------
 * Profile (singleton row, id = 1)
 * ------------------------------------------------------------------------- */

export type SocialLink = { label: string; url: string };

export const profile = pgTable(
  "profile",
  {
    id: integer("id").primaryKey().default(1),
    displayName: text("display_name").notNull(),
    fullName: text("full_name").notNull(),
    devBrand: text("dev_brand").notNull(),
    studioBrand: text("studio_brand").notNull(),
    titles: text("titles").array().notNull().default(sql`'{}'::text[]`),
    heroIntro: text("hero_intro").notNull(),
    shortBio: text("short_bio").notNull(),
    longBio: text("long_bio").notNull().default(""),
    engineeringApproach: text("engineering_approach").notNull().default(""),
    creativeApproach: text("creative_approach").notNull().default(""),
    openTo: text("open_to").array().notNull().default(sql`'{}'::text[]`),
    location: text("location").notNull(),
    email: text("email").notNull(),
    availability: availabilityStatus("availability").notNull().default("available"),
    availabilityNote: text("availability_note").notNull().default(""),
    socials: jsonb("socials").$type<SocialLink[]>().notNull().default([]),
    portraitId: uuid("portrait_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    cvId: uuid("cv_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [check("profile_singleton", sql`${t.id} = 1`)],
);

/* ----------------------------------------------------------------------------
 * Taxonomy
 * ------------------------------------------------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scope: categoryScope("scope").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_scope_slug_idx").on(t.scope, t.slug)],
);

/* ----------------------------------------------------------------------------
 * Development projects
 * ------------------------------------------------------------------------- */

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull().default(""),
    /** Free text like "In development", "Team project", "Shipped". */
    stage: text("stage").notNull().default(""),
    role: text("role").notNull().default(""),
    /** Shown when the work is confidential (e.g. company-owned). */
    confidentialityNote: text("confidentiality_note").notNull().default(""),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    coverId: uuid("cover_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    year: integer("year"),
    featured: boolean("featured").notNull().default(false),
    /** Demo content shown with a visible "Sample" badge; removable in bulk. */
    isSample: boolean("is_sample").notNull().default(false),
    status: publishStatus("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("projects_listing_idx").on(t.status, t.sortOrder)],
);

export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.name] })],
);

/** Screenshot gallery for a project. */
export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.mediaId] })],
);

/* ----------------------------------------------------------------------------
 * Skills
 * ------------------------------------------------------------------------- */

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** Optional qualifier, e.g. "Learning". Never a percentage. */
    note: text("note").notNull().default(""),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    visible: boolean("visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("skills_category_idx").on(t.categoryId, t.sortOrder)],
);

/* ----------------------------------------------------------------------------
 * Preelite Visual Creatives — studio work
 * ------------------------------------------------------------------------- */

export const creativeProjects = pgTable(
  "creative_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull().default(""),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    coverId: uuid("cover_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    videoId: uuid("video_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    /** YouTube / Vimeo / TikTok / Instagram / other link. */
    externalUrl: text("external_url"),
    aspect: mediaAspect("aspect").notNull().default("landscape"),
    tools: text("tools").array().notNull().default(sql`'{}'::text[]`),
    year: integer("year"),
    featured: boolean("featured").notNull().default(false),
    /** Demo content shown with a visible "Sample" badge; removable in bulk. */
    isSample: boolean("is_sample").notNull().default(false),
    status: publishStatus("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("creative_listing_idx").on(t.status, t.sortOrder)],
);

/* ----------------------------------------------------------------------------
 * Contact enquiries
 * ------------------------------------------------------------------------- */

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    type: enquiryType("type").notNull(),
    message: text("message").notNull(),
    status: enquiryStatus("status").notNull().default("new"),
    emailDelivered: boolean("email_delivered").notNull().default(false),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("enquiries_inbox_idx").on(t.status, t.createdAt)],
);

/* ----------------------------------------------------------------------------
 * Relations
 * ------------------------------------------------------------------------- */

export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(categories, { fields: [projects.categoryId], references: [categories.id] }),
  cover: one(mediaAssets, { fields: [projects.coverId], references: [mediaAssets.id] }),
  technologies: many(projectTechnologies),
  gallery: many(projectMedia),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, { fields: [projectTechnologies.projectId], references: [projects.id] }),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, { fields: [projectMedia.projectId], references: [projects.id] }),
  media: one(mediaAssets, { fields: [projectMedia.mediaId], references: [mediaAssets.id] }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  category: one(categories, { fields: [skills.categoryId], references: [categories.id] }),
}));

export const creativeProjectsRelations = relations(creativeProjects, ({ one }) => ({
  category: one(categories, { fields: [creativeProjects.categoryId], references: [categories.id] }),
  cover: one(mediaAssets, {
    fields: [creativeProjects.coverId],
    references: [mediaAssets.id],
    relationName: "creative_cover",
  }),
  video: one(mediaAssets, {
    fields: [creativeProjects.videoId],
    references: [mediaAssets.id],
    relationName: "creative_video",
  }),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  portrait: one(mediaAssets, {
    fields: [profile.portraitId],
    references: [mediaAssets.id],
    relationName: "profile_portrait",
  }),
  cv: one(mediaAssets, {
    fields: [profile.cvId],
    references: [mediaAssets.id],
    relationName: "profile_cv",
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(adminUsers, { fields: [sessions.userId], references: [adminUsers.id] }),
}));

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryType = (typeof enquiryType.enumValues)[number];
