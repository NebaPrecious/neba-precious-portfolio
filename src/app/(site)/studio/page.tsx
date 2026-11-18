import type { Metadata } from "next";
import Doodle from "@/components/animations/Doodle";
import PlayHero from "@/components/play/PlayHero";
import StudioIndex from "@/components/studio/StudioIndex";
import StudioSlate from "@/components/studio/StudioSlate";
import Timecode from "@/components/studio/Timecode";
import { getCategories, getPublishedCreative, requireProfile } from "@/server/dal/public";
import "@/styles/play.css";
import "@/styles/studio.css";

export const metadata: Metadata = {
  title: "Preelite Visual Creatives | Studio",
  description:
    "Preelite Visual Creatives is the studio of Neba Precious: video editing, videography and social media creatives from Douala, Cameroon.",
  alternates: { canonical: "/studio" },
};

export default async function StudioPage() {
  const [profile, items, categories] = await Promise.all([
    requireProfile(),
    getPublishedCreative(),
    getCategories("studio"),
  ]);

  const [first, ...rest] = profile.studioBrand.split(" ");

  // Covers (or video poster frames) of published work for the 3D orbit.
  const cards = items
    .map((item) => {
      const m = item.cover ?? item.video;
      const url = m?.kind === "video" ? m.posterUrl : m?.url;
      if (!m || !url) return null;
      const fallback = item.aspect === "portrait" ? [9, 16] : item.aspect === "square" ? [1, 1] : [16, 9];
      return {
        url,
        width: m.width ?? fallback[0],
        height: m.height ?? fallback[1],
        href: `/studio/${item.slug}`,
        label: item.title,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .slice(0, 12);

  return (
    <div className="screen screen-grain studio-page">
      <div className="letterbox" aria-hidden="true" />
      <PlayHero
        variant="page"
        className="screen"
        scene={
          cards.length >= 3
            ? { type: "orbit", cards }
            : { type: "toybox", words: ["REEL", "ACTION"], props: ["camera", "clapper", "reel", "play", "reel", "play"] }
        }
        fallbackWord="REEL"
      >
        <div className="play-overlay wrap">
          <div className="studio-hero-top mono">
            <span className="rec">
              <span className="status-dot" data-state="rec" aria-hidden="true" />
              Rec · Studio
            </span>
            <span>{profile.location}</span>
            <Timecode />
          </div>
          <div className="play-copy">
            <p className="eyebrow play-eyebrow">02 · Reel · Studio</p>
            <h1 id="hero-title" className="play-title studio-title">
              <span>{first}</span> <span className="accent">
                {rest.slice(0, -1).join(" ")}{" "}
                <span className="doodle-wrap">
                  {rest.at(-1)}
                  <Doodle kind="squiggle" color="var(--doodle-orange)" width={5} delay={0.5} />
                </span>
              </span>
            </h1>
            <p className="play-intro">
              The studio side of {profile.displayName}&apos;s practice: video editing, videography and social
              media creatives, made for the screens people actually watch.
            </p>
            <ul className="studio-band-cats mono" aria-label="Disciplines">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <span className="accent">{String(i + 1).padStart(2, "0")}</span> {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PlayHero>

      <section className="wrap" aria-label="Studio work" style={{ paddingBottom: "var(--space-9)" }}>
        {items.length > 0 ? <StudioIndex items={items} categories={categories} /> : <StudioSlate />}
      </section>
    </div>
  );
}
