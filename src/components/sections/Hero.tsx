"use client";

import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/animations/Reveal";

export default function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="container hero-grid">
        <div className="hero-content">
          <Reveal>
            <p className="hero-kicker">Software Developer · Designer · Douala, CM</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1>
              Digital products built with{" "}
              <span className="accent-word">purpose</span> and{" "}
              <span className="accent-word">resolve</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="hero-description">
              I&apos;m Neba Precious Ngeh, a software developer and designer
              creating practical digital experiences while growing through
              technology, visual design, and storytelling.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
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
          </Reveal>

          <Reveal delay={0.3}>
            <div className="hero-status">
              <span className="status-dot" aria-hidden="true" />
              <span>Building my brand and growing through meaningful work.</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="hero-portrait" delay={0.18}>
          <div className="portrait-frame">
            <Image
              src="/neba-precious-profile.png"
              alt="Professional portrait of Neba Precious Ngeh"
              fill
              priority
              sizes="(max-width: 900px) 85vw, 38vw"
              className="portrait-image"
            />
            <div className="portrait-caption">
              <span>Neba P. Ngeh</span>
              <strong>Developer + Designer</strong>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
