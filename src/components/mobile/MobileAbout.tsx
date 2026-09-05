"use client";

import { motion } from "motion/react";

const facts = [
  {
    label: "Based in",
    value: "Douala, Cameroon",
  },
  {
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
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mobile-kicker">About</p>

          <h2 className="mobile-section-title">
            Turning ideas into useful digital products.
          </h2>
        </motion.div>

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
            <span className="mobile-about-card-index">01</span>

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
            <span className="mobile-about-card-index">02</span>

            <h3>Creative development</h3>

            <p>
              Alongside code, I am growing through visual design and video
              editing using Canva, Photoshop, and CapCut.
            </p>
          </motion.article>
        </div>

        <div className="mobile-fact-grid">
          {facts.map((fact, index) => (
            <motion.div
              className="mobile-fact-item"
              key={fact.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
              }}
            >
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
