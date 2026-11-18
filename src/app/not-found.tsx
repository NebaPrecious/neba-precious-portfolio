import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PlayHero from "@/components/play/PlayHero";
import "@/styles/play.css";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main">
      <PlayHero scene={{ type: "toybox", words: ["404", "OOPS"], props: ["reel", "play", "marbles"] }}>
        <div className="play-overlay wrap">
          <p className="play-top mono">
            <Link href="/" className="link-arrow">
              ← Neba Precious
            </Link>
          </p>
          <div className="play-copy">
            <p className="eyebrow play-eyebrow">404 · Frame missing</p>
            <h1 id="hero-title" className="play-title">
              This frame didn&apos;t make the cut.
            </h1>
            <p className="play-intro">The page you were looking for doesn&apos;t exist or has moved. Knock the blocks around, then head back.</p>
            <div className="play-ctas">
              <Link href="/" className="btn btn-accent">
                Back to home <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
              </Link>
              <Link href="/work" className="btn btn-outline">
                Development work
              </Link>
              <Link href="/studio" className="btn btn-outline">
                Studio
              </Link>
            </div>
          </div>
        </div>
      </PlayHero>
    </main>
  );
}
