import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="container hero-grid">
        <div className="hero-content">
          <p className="eyebrow">
            Software Developer · Designer · Douala, Cameroon
          </p>

          <h1>
            Building digital products with
            <span> purpose and creativity.</span>
          </h1>

          <p className="hero-description">
            I&apos;m Neba Precious Ngeh, a software developer and designer
            creating practical digital experiences while growing through
            technology, visual design, and storytelling.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#projects">
              View my work
              <ArrowDownRight size={18} aria-hidden="true" />
            </a>

            <a className="button button-secondary" href="#contact">
              Let&apos;s connect
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="hero-status">
            <span className="status-dot" aria-hidden="true" />
            <span>Building my brand and growing through meaningful work.</span>
          </div>
        </div>

        <div className="hero-portrait">
          <div className="portrait-glow" />

          <div className="portrait-frame">
            <Image
             src="/neba-precious-profile.png"
              alt="Professional portrait of Neba Precious Ngeh"
              fill
              priority
              sizes="(max-width: 900px) 85vw, 38vw"
              className="portrait-image"
            />
          </div>

          <div className="portrait-badge portrait-badge-top">
            <span>Currently building</span>
            <strong>Jangora</strong>
          </div>

          <div className="portrait-badge portrait-badge-bottom">
            <span>Role</span>
            <strong>Developer + Designer</strong>
          </div>
        </div>
      </div>
    </section>
  );
}