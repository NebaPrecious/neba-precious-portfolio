"use client";

import { motion } from "motion/react";
import {
  Clapperboard,
  Palette,
  Sparkles,
} from "lucide-react";

const creativeAreas = [
  {
    number: "01",
    title: "Visual design",
    subtitle: "Canva and Photoshop",
    description:
      "Creating flyers with Canva while developing stronger design foundations and learning Adobe Photoshop.",
    icon: Palette,
    accentClass: "mobile-creative-purple",
  },
  {
    number: "02",
    title: "Video editing",
    subtitle: "CapCut",
    description:
      "Editing event highlights, promotional teasers, and general video content using CapCut.",
    icon: Clapperboard,
    accentClass: "mobile-creative-cyan",
  },
];

export default function MobileCreative() {
  return (
    <section
      className="mobile-section mobile-creative"
      id="mobile-creative"
    >
      <div className="mobile-container">
        <motion.div
          className="mobile-section-heading"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div>
            <span className="mobile-section-number">04</span>
            <p className="mobile-section-label">Creative growth</p>
          </div>

          <Sparkles size={19} aria-hidden="true" />
        </motion.div>

        <motion.h2
          className="mobile-section-title"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.65,
            delay: 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Growing beyond code through visual storytelling.
        </motion.h2>

        <motion.p
          className="mobile-section-intro"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            delay: 0.12,
          }}
        >
          My creative journey supports how I think about digital products,
          communication, and user experience.
        </motion.p>

        <div className="mobile-creative-grid">
          {creativeAreas.map((area, index) => {
            const Icon = area.icon;

            return (
              <motion.article
                className={`mobile-creative-card ${area.accentClass}`}
                key={area.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                }}
              >
                <div className="mobile-creative-card-top">
                  <span>{area.number}</span>

                  <div className="mobile-creative-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <p className="mobile-creative-subtitle">
                    {area.subtitle}
                  </p>

                  <h3>{area.title}</h3>

                  <p className="mobile-creative-description">
                    {area.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className="mobile-learning-banner"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            delay: 0.12,
          }}
        >
          <span className="mobile-learning-dot" />

          <div>
            <span>Current journey</span>
            <strong>Learning, experimenting, and improving consistently.</strong>
          </div>
        </motion.div>
      </div>
    </section>
  );
}