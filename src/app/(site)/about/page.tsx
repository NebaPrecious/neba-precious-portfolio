import type { Metadata } from "next";
import Doodle from "@/components/animations/Doodle";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import Capabilities from "@/components/home/Capabilities";
import PlayHero from "@/components/play/PlayHero";
import MediaImage from "@/components/media/MediaImage";
import { getSkillGroups, requireProfile } from "@/server/dal/public";
import "@/styles/play.css";
import "@/styles/home.css";
import "@/styles/about.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Neba Precious — a software engineer and visual creative based in Douala, Cameroon.",
  alternates: { canonical: "/about" },
};

const availabilityLabel = {
  available: "Open to new work",
  limited: "Limited availability",
  unavailable: "Not taking new work right now",
} as const;

export default async function AboutPage() {
  const [profile, skillGroups] = await Promise.all([requireProfile(), getSkillGroups()]);
  const paragraphs = profile.longBio.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <PlayHero
        variant="page"
        fallbackWord="HELLO"
        scene={{
          type: "lanyard",
          portrait: profile.portrait?.url ?? null,
          name: profile.displayName,
          title: profile.titles.join(" & "),
          lines: [profile.devBrand, profile.studioBrand],
        }}
      >
        <div className="play-overlay wrap">
          <p className="play-top mono">03 · About · {profile.location}</p>
          <div className="play-copy">
            <p className="eyebrow play-eyebrow">{profile.titles.join(" · ")}</p>
            <h1 id="hero-title" className="play-title">
              One person.{" "}
              <span className="accent doodle-wrap">
                Two
                <Doodle kind="loop" color="var(--gold)" width={4} delay={0.4} />
              </span>{" "}
              disciplines.
            </h1>
            <p className="play-intro">{profile.shortBio}</p>
          </div>
        </div>
      </PlayHero>

      <section className="section" aria-labelledby="story-title">
        <div className="wrap about-story">
          <div className="about-story-side">
            <Reveal>
              <h2 id="story-title" className="eyebrow">
                <span className="eyebrow-index">A</span> The story so far
              </h2>
            </Reveal>
            {profile.portrait && (
              <Reveal delay={0.1} className="about-portrait">
                <figure className="frame tilt-static">
                  <div className="frame-media" style={{ aspectRatio: "1" }}>
                    <MediaImage
                      media={profile.portrait}
                      fill
                      sizes="(max-width: 900px) 92vw, 30vw"
                      alt={profile.portrait.alt || `Portrait of ${profile.displayName}`}
                    />
                  </div>
                  <figcaption className="frame-caption">
                    <span>{profile.fullName}</span>
                    <span>{profile.location}</span>
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>
          <div className="prose about-prose">
            {paragraphs.map((p, k) => (
              <Reveal key={k} delay={k * 0.05}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Approach">
        <div className="wrap about-approach">
          <Reveal className="approach approach-source">
            <p className="eyebrow">
              <span className="eyebrow-index">B</span> Source — {profile.devBrand}
            </p>
            <h2>On engineering</h2>
            <p>{profile.engineeringApproach || "—"}</p>
          </Reveal>
          <Reveal delay={0.08} className="approach approach-reel">
            <p className="eyebrow">
              <span className="eyebrow-index">C</span> Reel — {profile.studioBrand}
            </p>
            <h2>On visual work</h2>
            <p>{profile.creativeApproach || "—"}</p>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="facts-title">
        <div className="wrap">
          <h2 id="facts-title" className="sr-only">
            Details
          </h2>
          <dl className="about-facts">
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>
                <span className="status-dot" data-state={profile.availability} aria-hidden="true" />
                {availabilityLabel[profile.availability]}
              </dd>
            </div>
            {profile.openTo.length > 0 && (
              <div>
                <dt>Open to</dt>
                <dd>{profile.openTo.join(" · ")}</dd>
              </div>
            )}
            <div>
              <dt>Email</dt>
              <dd>
                <a className="link-arrow" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </dd>
            </div>
          </dl>
          {profile.availabilityNote && <p className="muted about-note">{profile.availabilityNote}</p>}

          <div className="about-actions">
            <Link className="btn" href="/contact">
              Get in touch <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
            </Link>
            {profile.cv && (
              <a className="btn btn-outline" href="/cv" target="_blank" rel="noopener">
                <Download size={16} aria-hidden="true" /> Download CV
              </a>
            )}
          </div>
        </div>
      </section>

      <Capabilities groups={skillGroups} index="D" title="Skills & tools" />
    </>
  );
}
