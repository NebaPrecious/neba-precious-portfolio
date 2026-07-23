"use client";

import { motion } from "motion/react";
import {
  Code2,
  MapPin,
  Palette,
  TrendingUp,
} from "lucide-react";

const facts = [
  {
    icon: MapPin,
    label: "Based in",
    value: "Douala, Cameroon",
  },
  {
    icon: TrendingUp,
    label: "Current focus",
    value: "Building my brand and growing",
  },
];

export default function MobileAbout() {
  return (
    <section
      className="mobile-section mobile-about"
      id="mobile-about"
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
            <span className="mobile-section-number">01</span>
            <p className="mobile-section-label">About me</p>
          </div>

          <Code2 size={19} aria-hidden="true" />
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
          Turning ideas into useful digital products.
        </motion.h2>

        <motion.p
          className="mobile-about-lead"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.62,
            delay: 0.12,
          }}
        >
          I am a full-stack developer who enjoys building practical,
          user-focused experiences across frontend and backend systems.
        </motion.p>

        <div className="mobile-about-cards">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.65,
              delay: 0.08,
            }}
          >
            <span className="mobile-about-card-icon">
              <Code2 size={20} aria-hidden="true" />
            </span>

            <h3>Software development</h3>

            <p>
              My experience covers frontend and backend development using
              Angular, Ionic, React, Node.js, NestJS, PHP, MySQL, and
              PostgreSQL.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.65,
              delay: 0.16,
            }}
          >
            <span className="mobile-about-card-icon">
              <Palette size={20} aria-hidden="true" />
            </span>

            <h3>Creative development</h3>

            <p>
              Alongside code, I am growing through visual design and video
              editing using Canva, Photoshop, and CapCut.
            </p>
          </motion.article>
        </div>

        <div className="mobile-fact-grid">
          {facts.map((fact, index) => {
            const Icon = fact.icon;

            return (
              <motion.div
                className="mobile-fact-card"
                key={fact.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
              >
                <Icon size={17} aria-hidden="true" />

                <div>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}