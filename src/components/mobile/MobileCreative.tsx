"use client";

import { motion } from "motion/react";

const creativeAreas = [
  {
    title: "Visual design",
    description:
      "Creating flyers with Canva while developing stronger design foundations and learning Adobe Photoshop.",
  },
  {
    title: "Video editing",
    description:
      "Editing event highlights, promotional teasers, and general video content using CapCut.",
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
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mobile-kicker">Creative</p>

          <h2 className="mobile-section-title">
            Growing beyond code through visual storytelling.
          </h2>
        </motion.div>

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

        <div className="mobile-creative-list">
          {creativeAreas.map((area, index) => (
            <motion.article
              className="mobile-creative-item"
              key={area.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.65,
                delay: index * 0.1,
              }}
            >
              <h3>{area.title}</h3>

              <p>{area.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
