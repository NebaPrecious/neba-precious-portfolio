/**
 * Seeds the database with the REAL content that existed in the original
 * hard-coded site (src/data/*, sections/*). Idempotent: rows that already exist
 * are left untouched, so running it again never overwrites admin edits.
 *
 *   npm run db:seed
 *
 * Creative studio work is intentionally NOT seeded — the previous site used
 * sample videos and generated placeholders that were not Neba's work.
 */
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../src/server/db/client";

const db = getDb();

async function upsertCategory(scope: "dev" | "studio" | "skill", name: string, slug: string, sortOrder: number) {
  await db
    .insert(schema.categories)
    .values({ scope, name, slug, sortOrder })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(schema.categories)
    .where(and(eq(schema.categories.scope, scope), eq(schema.categories.slug, slug)));
  return row;
}

async function upsertLocalImage(path: string, width: number, height: number, alt: string) {
  await db
    .insert(schema.mediaAssets)
    .values({ kind: "image", provider: "local", publicId: path, url: path, width, height, alt })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(schema.mediaAssets)
    .where(and(eq(schema.mediaAssets.provider, "local"), eq(schema.mediaAssets.publicId, path)));
  return row;
}

async function main() {
  /* Categories -------------------------------------------------------------- */
  const finance = await upsertCategory("dev", "Personal finance", "personal-finance", 0);
  const health = await upsertCategory("dev", "Digital healthcare", "digital-healthcare", 1);

  await upsertCategory("studio", "Video editing", "video-editing", 0);
  await upsertCategory("studio", "Videography", "videography", 1);
  await upsertCategory("studio", "Social media creatives", "social-media-creatives", 2);

  const skillCats = {
    frontend: await upsertCategory("skill", "Frontend", "frontend", 0),
    backend: await upsertCategory("skill", "Backend", "backend", 1),
    databases: await upsertCategory("skill", "Databases", "databases", 2),
    tools: await upsertCategory("skill", "Development tools", "tools", 3),
    creative: await upsertCategory("skill", "Creative tools", "creative-tools", 4),
  };

  /* Media (existing files in /public) -------------------------------------- */
  const portrait = await upsertLocalImage(
    "/neba-precious-profile.png",
    1254,
    1254,
    "Portrait of Neba Precious smiling, wearing gold-rimmed glasses and a split black-and-red top",
  );
  const jangora = await Promise.all([
    upsertLocalImage("/projects/jangora/jangora-dashboard.png", 408, 870, "Jangora dashboard showing total balance, quick actions and monthly budget"),
    upsertLocalImage("/projects/jangora/jangora-login.png", 408, 870, "Jangora login screen"),
    upsertLocalImage("/projects/jangora/jangora-profile.png", 408, 870, "Jangora profile screen"),
    upsertLocalImage("/projects/jangora/jangora-splash.png", 408, 870, "Jangora splash screen"),
  ]);
  const pharmaSplash = await upsertLocalImage(
    "/projects/pharmacompare/pharmacompare-splash.png",
    676,
    1280,
    "Approved PharmaCompare splash screen",
  );

  /* Profile ------------------------------------------------------------------ */
  await db
    .insert(schema.profile)
    .values({
      id: 1,
      displayName: "Neba Precious",
      fullName: "Neba Precious Ngeh",
      devBrand: "Dev Pre_elite",
      studioBrand: "Preelite Visual Creatives",
      titles: ["Software Engineer", "Visual Creative"],
      heroIntro:
        "I build practical, user-focused digital products as Dev Pre_elite — and tell stories through video and visuals as Preelite Visual Creatives.",
      shortBio:
        "I am a full-stack developer who enjoys turning ideas into useful, user-focused digital products.",
      longBio: [
        "My experience covers frontend and backend development using tools such as Angular, Ionic, React, Node.js, NestJS, PHP, MySQL, and PostgreSQL. I have contributed to projects across healthcare, mobility, delivery, and personal finance.",
        "Alongside software development, I am growing as a designer and video editor. I create visual designs with Canva, study Photoshop, and edit event highlights and teasers with CapCut.",
      ].join("\n\n"),
      engineeringApproach:
        "Practical, user-focused experiences across frontend and backend systems — built to be useful first.",
      creativeApproach:
        "Event highlights, teasers and social content, edited with attention to pacing and the story the footage is trying to tell.",
      openTo: [],
      location: "Douala, Cameroon",
      email: "preciousngehneba@gmail.com",
      availability: "available",
      availabilityNote: "Building my brand and growing through meaningful work.",
      socials: [
        { label: "GitHub", url: "https://github.com/NebaPrecious" },
        { label: "LinkedIn", url: "https://linkedin.com/in/nebaprecious" },
      ],
      portraitId: portrait.id,
      cvId: null,
    })
    .onConflictDoNothing();

  /* Projects ----------------------------------------------------------------- */
  const [jangoraProject] = await db
    .insert(schema.projects)
    .values({
      slug: "jangora",
      name: "Jangora",
      summary:
        "An AI-assisted personal finance application designed to help users track expenses, build better saving habits, work toward financial goals, and develop financial discipline.",
      stage: "In development",
      role: "Personal project",
      categoryId: finance.id,
      coverId: jangora[0].id,
      featured: true,
      status: "published",
      sortOrder: 0,
      publishedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  if (jangoraProject) {
    await db.insert(schema.projectTechnologies).values(
      ["Ionic Angular", "NestJS", "TypeScript", "PostgreSQL"].map((name, i) => ({
        projectId: jangoraProject.id,
        name,
        sortOrder: i,
      })),
    );
    await db.insert(schema.projectMedia).values(
      jangora.map((m, i) => ({ projectId: jangoraProject.id, mediaId: m.id, sortOrder: i })),
    );
  }

  const [pharmaProject] = await db
    .insert(schema.projects)
    .values({
      slug: "pharmacompare",
      name: "PharmaCompare",
      summary:
        "A company-owned digital healthcare platform designed to help people access medical services from home and receive faster support during urgent situations.",
      stage: "Team project",
      role: "Backend development, as part of a team",
      confidentialityNote:
        "Only an approved splash-screen preview is shown. The complete product, repository, internal interfaces and implementation details remain private because the platform belongs to the company and is still under development.",
      categoryId: health.id,
      coverId: pharmaSplash.id,
      featured: true,
      status: "published",
      sortOrder: 1,
      publishedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  if (pharmaProject) {
    // NOTE: the old site disagreed with itself here (data file: PHP/MySQL;
    // rendered card: Node.js/MySQL/REST). The rendered, public version is used.
    await db.insert(schema.projectTechnologies).values(
      ["Angular", "Ionic", "Node.js", "MySQL", "REST APIs"].map((name, i) => ({
        projectId: pharmaProject.id,
        name,
        sortOrder: i,
      })),
    );
    await db.insert(schema.projectMedia).values({ projectId: pharmaProject.id, mediaId: pharmaSplash.id, sortOrder: 0 });
  }

  /* Skills --------------------------------------------------------------------- */
  const existingSkills = await db.select({ id: schema.skills.id }).from(schema.skills).limit(1);
  if (existingSkills.length === 0) {
    const groups: [keyof typeof skillCats, [string, string?][]][] = [
      ["frontend", [["HTML5"], ["CSS3"], ["JavaScript"], ["TypeScript"], ["Angular"], ["Ionic"], ["React"], ["Bootstrap"]]],
      ["backend", [["Node.js"], ["NestJS"], ["PHP"], ["REST APIs"]]],
      ["databases", [["PostgreSQL"], ["MySQL"]]],
      ["tools", [["Git"], ["GitHub"], ["Postman"], ["Chrome DevTools"], ["Clean Code"]]],
      ["creative", [["CapCut"], ["Canva"], ["Photoshop", "Learning"], ["Visual design"], ["Video editing"]]],
    ];
    for (const [cat, list] of groups) {
      await db.insert(schema.skills).values(
        list.map(([name, note], i) => ({
          name,
          note: note ?? "",
          categoryId: skillCats[cat].id,
          sortOrder: i,
        })),
      );
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDb().$client.end();
  });
