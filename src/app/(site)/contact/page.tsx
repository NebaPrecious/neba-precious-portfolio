import type { Metadata } from "next";
import Doodle from "@/components/animations/Doodle";
import { ArrowUpRight, Download } from "lucide-react";
import PlayHero from "@/components/play/PlayHero";
import ContactForm from "@/components/contact/ContactForm";
import { requireProfile } from "@/server/dal/public";
import "@/styles/play.css";
import "@/styles/work.css";
import "@/styles/contact.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Neba Precious about software development, websites, video editing, videography or creative collaboration.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await requireProfile();

  return (
    <>
      <PlayHero variant="page" scene={{ type: "toybox", words: ["SAY", "HI!"], props: ["envelope", "envelope", "envelope", "marbles"] }}>
        <div className="play-overlay wrap">
          <p className="play-top mono">04 · Contact · {profile.location}</p>
          <div className="play-copy">
            <p className="eyebrow play-eyebrow">Get in touch</p>
            <h1 id="hero-title" className="play-title">
              Let&apos;s make{" "}
              <span className="accent doodle-wrap">
                something.
                <Doodle kind="underline" color="var(--doodle-violet)" width={5} delay={0.5} />
              </span>
            </h1>
            <p className="play-intro">
              Software, a website, a video edit or a collaboration? Tell me what you have in mind and I&apos;ll
              get back to you.
            </p>
          </div>
        </div>
      </PlayHero>

      <section className="section">
        <div className="wrap contact-grid">
          <aside className="contact-aside">
            <dl className="contact-details">
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="link-arrow" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Elsewhere</dt>
                <dd className="contact-socials">
                  {profile.socials.map((s) => (
                    <a key={s.url} className="link-arrow" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label} <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ))}
                </dd>
              </div>
              {profile.cv && (
                <div>
                  <dt>CV</dt>
                  <dd>
                    <a className="link-arrow" href="/cv" target="_blank" rel="noopener">
                      <Download size={14} aria-hidden="true" /> Download CV (PDF)
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>

          <ContactForm email={profile.email} />
        </div>
      </section>
    </>
  );
}
