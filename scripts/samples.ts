/**
 * Clearly-labelled SAMPLE content so you can preview the full site before
 * your real work is uploaded. Every entry has `is_sample = true`, shows a
 * "Sample" badge on the site, and uses generated placeholder media from
 * /public/samples (no stock or third-party footage).
 *
 *   npm run samples:add      # insert (idempotent)
 *   npm run samples:remove   # delete every sample entry + its media records
 */
import { and, eq, like } from "drizzle-orm";
import { getDb, schema } from "../src/server/db/client";

const db = getDb();
const mode = process.argv[2];

type Img = { path: string; w: number; h: number; alt: string };

async function media(kind: "image" | "video", file: Img, opts: { poster?: string; duration?: number } = {}) {
  await db
    .insert(schema.mediaAssets)
    .values({
      kind,
      provider: "local",
      publicId: file.path,
      url: file.path,
      posterUrl: opts.poster ?? null,
      width: file.w,
      height: file.h,
      durationSeconds: opts.duration ?? null,
      format: file.path.split(".").pop() ?? null,
      originalFilename: file.path.split("/").pop() ?? null,
      alt: file.alt,
    })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(schema.mediaAssets)
    .where(and(eq(schema.mediaAssets.provider, "local"), eq(schema.mediaAssets.publicId, file.path)));
  return row;
}

async function category(scope: "studio", slug: string) {
  const [row] = await db
    .select()
    .from(schema.categories)
    .where(and(eq(schema.categories.scope, scope), eq(schema.categories.slug, slug)));
  return row?.id ?? null;
}

const SAMPLE_NOTE =
  "Placeholder entry to preview the layout — replace it with your real work from the admin dashboard.";

async function add() {
  const studio = [
    { slug: "sample-event-highlights-reel", title: "Event Highlights Reel", cat: "video-editing", aspect: "landscape", file: "studio-event-reel", w: 1600, h: 900, vw: 1280, vh: 720, video: true, tools: ["CapCut"] },
    { slug: "sample-product-teaser", title: "Product Teaser", cat: "video-editing", aspect: "portrait", file: "studio-product-teaser", w: 900, h: 1600, vw: 720, vh: 1280, video: true, tools: ["CapCut"] },
    { slug: "sample-brand-story-shoot", title: "Brand Story Shoot", cat: "videography", aspect: "landscape", file: "studio-brand-shoot", w: 1600, h: 900, vw: 1280, vh: 720, video: true, tools: [] },
    { slug: "sample-portrait-series", title: "Portrait Series", cat: "videography", aspect: "square", file: "studio-portrait-series", w: 1200, h: 1200, video: false, tools: [] },
    { slug: "sample-launch-carousel", title: "Launch Carousel", cat: "social-media-creatives", aspect: "square", file: "studio-launch-carousel", w: 1200, h: 1200, video: false, tools: ["Canva"] },
    { slug: "sample-reel-cover-pack", title: "Reel Cover Pack", cat: "social-media-creatives", aspect: "portrait", file: "studio-reel-covers", w: 900, h: 1600, video: false, tools: ["Canva"] },
  ] as const;

  for (const [i, s] of studio.entries()) {
    const cover = await media("image", { path: `/samples/${s.file}.png`, w: s.w, h: s.h, alt: `Sample placeholder cover: ${s.title}` });
    const video =
      s.video && "vw" in s
        ? await media(
            "video",
            { path: `/samples/${s.file}.webm`, w: s.vw, h: s.vh, alt: `Sample placeholder video: ${s.title}` },
            { poster: `/samples/${s.file}.png`, duration: 6 },
          )
        : null;
    await db
      .insert(schema.creativeProjects)
      .values({
        slug: s.slug,
        title: `Sample — ${s.title}`,
        summary: SAMPLE_NOTE,
        body: "This is generated placeholder media, not real client work. It exists only so you can see how video, portrait and square pieces sit in the studio.",
        categoryId: await category("studio", s.cat),
        coverId: cover.id,
        videoId: video?.id ?? null,
        aspect: s.aspect,
        tools: [...s.tools],
        featured: i < 3,
        isSample: true,
        status: "published",
        sortOrder: 100 + i,
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  const dev = [
    { slug: "sample-booking-dashboard", name: "Booking Dashboard", file: "dev-booking-dashboard", stage: "Sample", tech: ["Next.js", "TypeScript", "PostgreSQL"] },
    { slug: "sample-delivery-tracker", name: "Delivery Tracker", file: "dev-delivery-tracker", stage: "Sample", tech: ["Ionic", "Angular", "NestJS"] },
  ];
  for (const [i, d] of dev.entries()) {
    const cover = await media("image", { path: `/samples/${d.file}.png`, w: 1600, h: 1000, alt: `Sample placeholder screen: ${d.name}` });
    const [row] = await db
      .insert(schema.projects)
      .values({
        slug: d.slug,
        name: `Sample — ${d.name}`,
        summary: SAMPLE_NOTE,
        stage: d.stage,
        coverId: cover.id,
        featured: true,
        isSample: true,
        status: "published",
        sortOrder: 100 + i,
        publishedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();
    if (row) {
      await db.insert(schema.projectTechnologies).values(d.tech.map((name, k) => ({ projectId: row.id, name, sortOrder: k })));
      await db.insert(schema.projectMedia).values({ projectId: row.id, mediaId: cover.id, sortOrder: 0 });
    }
  }
  console.log("Sample content added. It shows a visible “Sample” badge everywhere.");
}

async function remove() {
  const p = await db.delete(schema.projects).where(eq(schema.projects.isSample, true)).returning({ id: schema.projects.id });
  const c = await db
    .delete(schema.creativeProjects)
    .where(eq(schema.creativeProjects.isSample, true))
    .returning({ id: schema.creativeProjects.id });
  const m = await db
    .delete(schema.mediaAssets)
    .where(and(eq(schema.mediaAssets.provider, "local"), like(schema.mediaAssets.publicId, "/samples/%")))
    .returning({ id: schema.mediaAssets.id });
  console.log(`Removed ${p.length} sample projects, ${c.length} studio entries, ${m.length} media records.`);
  console.log("The generated files stay in public/samples — delete that folder too if you like.");
}

(mode === "remove" ? remove() : add())
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
