import Link from "next/link";
import Doodle from "@/components/animations/Doodle";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import ProjectCard from "@/components/home/ProjectCard";
import ScrollSpyNav from "@/components/home/ScrollSpyNav";
import StudioBand from "@/components/home/StudioBand";
import PlayHero from "@/components/play/PlayHero";
import SocialIcons from "@/components/site/SocialIcons";
import {
  getCategories,
  getPublishedCreative,
  getPublishedProjects,
  getSkillGroups,
  requireProfile,
} from "@/server/dal/public";
import "@/styles/play.css";
import "@/styles/home.css";
import "@/styles/studio.css";

const availabilityLabel = {
  available: "Available for work",
  limited: "Limited availability",
  unavailable: "Not taking new work",
} as const;

export default async function HomePage() {
  const [profile, projects, creative, studioCategories, skillGroups] = await Promise.all([
    requireProfile(),
    getPublishedProjects(),
    getPublishedCreative(),
    getCategories("studio"),
    getSkillGroups(),
  ]);

  const [firstName, ...rest] = profile.displayName.split(" ");
  const lastName = rest.join(" ");
  const paragraphs = profile.longBio.split(/\n{2,}/).filter(Boolean);
  const featured = (projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).slice(0, 4);

  return (
    <>
      {/* 1 — Play: the interactive landing */}
      <PlayHero
        scene={{
          type: "toybox",
          words: [firstName.toUpperCase(), lastName.toUpperCase()].filter(Boolean),
          props: ["brackets", "camera", "play", "marbles"],
        }}
      >
        <div className="play-overlay wrap">
          <p className="play-top mono">
            <span className="status-dot" data-state={profile.availability} aria-hidden="true" />
            {availabilityLabel[profile.availability]} · {profile.location}
          </p>

          <div className="play-copy">
            <p className="eyebrow play-eyebrow">{profile.titles.join(" · ")}</p>
            <h1 id="hero-title" className="play-title">
              <span className="doodle-wrap">
                Hi
                <Doodle kind="asterisk" color="var(--doodle-violet)" width={5} delay={0.9} />
              </span>
              , I&apos;m{" "}
              <span className="accent doodle-wrap">
                {profile.displayName}
                <Doodle kind="underline" color="var(--gold)" width={5} delay={0.5} />
              </span>
              .
            </h1>
            <p className="play-intro">{profile.heroIntro}</p>
            <div className="play-ctas">
              <Link href="/work" className="btn btn-accent">
                {profile.devBrand} <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
              </Link>
              <Link href="/studio" className="btn btn-outline">
                {profile.studioBrand} <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </PlayHero>

      {/* 2 — Sticky identity column + scrolling content */}
      <div className="wrap split">
        <aside className="split-aside">
          <div>
            <p className="split-name">{profile.displayName}</p>
            <p className="split-title">{profile.titles.join(" & ")}</p>
            <p className="split-tagline">{profile.shortBio}</p>
          </div>
          <ScrollSpyNav
            items={[
              { id: "about", label: "About" },
              { id: "work", label: "Work" },
              { id: "toolkit", label: "Toolkit" },
              { id: "studio", label: "Studio" },
            ]}
          />
          <SocialIcons socials={profile.socials} email={profile.email} />
        </aside>

        <div className="split-main">
          <section id="about" className="split-section" aria-label="About me">
            <h2 className="split-heading">About</h2>
            <div className="split-prose">
              {paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <p>{p}</p>
                </Reveal>
              ))}
              {(profile.engineeringApproach || profile.creativeApproach) && (
                <Reveal>
                  <p>
                    {profile.engineeringApproach && (
                      <>
                        On the engineering side — <strong>{profile.devBrand}</strong> — {lowerFirst(profile.engineeringApproach)}{" "}
                      </>
                    )}
                    {profile.creativeApproach && (
                      <>
                        Behind the camera — <strong>{profile.studioBrand}</strong> — {lowerFirst(profile.creativeApproach)}
                      </>
                    )}
                  </p>
                </Reveal>
              )}
            </div>
            <div className="split-links">
              <Link className="link-arrow" href="/about">
                More about me <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              {profile.cv && (
                <a className="link-arrow" href="/cv" target="_blank" rel="noopener">
                  <Download size={15} aria-hidden="true" /> Download CV
                </a>
              )}
            </div>
          </section>

          <section id="work" className="split-section" aria-label="Selected development work">
            <h2 className="split-heading">Work</h2>
            <ol className="hover-list">
              {featured.map((project) => (
                <li key={project.id}>
                  <Reveal>
                    <ProjectCard project={project} />
                  </Reveal>
                </li>
              ))}
            </ol>
            <div className="split-links">
              <Link className="link-arrow" href="/work">
                View all development work <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section id="toolkit" className="split-section" aria-label="Toolkit">
            <h2 className="split-heading">Toolkit</h2>
            <div className="toolkit">
              {skillGroups.map((group) => (
                <Reveal key={group.category.id} className="toolkit-group">
                  <h3>{group.category.name}</h3>
                  <ul className="pill-list">
                    {group.skills.map((s) => (
                      <li key={s.id} className="pill">
                        {s.name}
                        {s.note && <span className="pill-note"> · {s.note}</span>}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 3 — The studio, in its own screening room */}
      <div id="studio">
        <StudioBand brand={profile.studioBrand} items={creative} categories={studioCategories} />
      </div>
    </>
  );
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
