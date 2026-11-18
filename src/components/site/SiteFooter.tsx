import Link from "next/link";
import Doodle from "@/components/animations/Doodle";
import { cacheLife } from "next/cache";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { navigation } from "@/lib/site";
import type { ProfileDTO } from "@/lib/types";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function SiteFooter({ profile }: { profile: ProfileDTO }) {
  return (
    <footer className="site-footer theme-dark">
      <div className="wrap">
        <div className="footer-cta">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-index">05</span> Contact
            </p>
            <h2 style={{ marginTop: "var(--space-4)" }}>
              Have something worth{" "}
              <span className="doodle-wrap">
                making
                <Doodle kind="loop" color="var(--accent)" width={4} />
              </span>
              <span className="accent">?</span>
            </h2>
            <a className="footer-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
          <div className="footer-cta-actions">
            <Link className="btn" href="/contact">
              Start an enquiry
              <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
            </Link>
            {profile.cv && (
              <a className="btn btn-outline" href="/cv" target="_blank" rel="noopener">
                <Download size={16} aria-hidden="true" />
                Download CV
              </a>
            )}
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-brands">
            <p>
              <strong>{profile.devBrand}</strong>: software engineering and digital products.
            </p>
            <p>
              <strong>{profile.studioBrand}</strong>: video editing, videography and social media
              creatives.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="eyebrow">Index</h3>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="eyebrow">Elsewhere</h3>
            <ul>
              {profile.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-arrow">
                    {s.label}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Based in</h3>
            <ul>
              <li>{profile.location}</li>
              <li className="muted mono">UTC+1 · WAT</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © <CurrentYear /> {profile.fullName}
          </span>
          <span>Designed &amp; built by {profile.devBrand}</span>
          <a href="#top" className="link-arrow">
            Back to top ↑
          </a>
        </div>
      </div>

      <span className="footer-wordmark" aria-hidden="true">
        {profile.displayName}
      </span>
    </footer>
  );
}
