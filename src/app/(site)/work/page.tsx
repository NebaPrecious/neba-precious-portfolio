import type { Metadata } from "next";
import Doodle from "@/components/animations/Doodle";
import PlayHero from "@/components/play/PlayHero";
import WorkIndex from "@/components/work/WorkIndex";
import { getCategories, getPublishedProjects, requireProfile } from "@/server/dal/public";
import "@/styles/play.css";
import "@/styles/work.css";

export const metadata: Metadata = {
  title: "Development work",
  description:
    "Software projects by Neba Precious (Dev Pre_elite) — web and mobile products across personal finance and digital healthcare.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const [profile, projects, categories] = await Promise.all([
    requireProfile(),
    getPublishedProjects(),
    getCategories("dev"),
  ]);

  // Real screenshots for the 3D devices: up to two per project, five in total.
  const screens = projects
    .flatMap((p) =>
      (p.gallery.length ? p.gallery : p.cover ? [p.cover] : [])
        .filter((m) => m.kind === "image" && m.width && m.height)
        .slice(0, 2)
        .map((m) => ({ url: m.url, width: m.width!, height: m.height!, href: `/work/${p.slug}`, label: p.name })),
    )
    .slice(0, 5);

  return (
    <>
      <PlayHero
        variant="page"
        scene={
          screens.length > 0
            ? { type: "devices", screens }
            : { type: "toybox", words: ["CODE"], props: ["brackets", "brackets", "marbles"] }
        }
        fallbackWord="CODE"
      >
        <div className="play-overlay wrap">
          <p className="play-top mono">01 · Source — Engineering</p>
          <div className="play-copy">
            <p className="eyebrow play-eyebrow">Development work</p>
            <h1 id="hero-title" className="play-title">
              <span className="doodle-wrap">
                {profile.devBrand}
                <Doodle kind="loop" color="var(--doodle-blue)" width={4} delay={0.4} />
              </span>
            </h1>
            <p className="play-intro">
              Web and mobile products I have built or contributed to. Short write-ups, real screens, and links
              wherever the work is public.
            </p>
          </div>
        </div>
      </PlayHero>

      <section className="section" aria-label="Projects" style={{ paddingTop: "var(--space-6)" }}>
        <div className="wrap">
          {projects.length > 0 ? (
            <WorkIndex projects={projects} categories={categories} />
          ) : (
            <div className="empty-state" style={{ marginTop: "var(--space-8)" }}>
              <h3>Projects are on their way.</h3>
              <p>New development work will be published here soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
