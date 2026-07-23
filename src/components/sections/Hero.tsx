"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const textAnimation = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          transition={{
            staggerChildren: 0.12,
            delayChildren: 0.15,
          }}
        >
          <motion.p
            className="eyebrow"
            variants={textAnimation}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Software Developer · Designer · Douala, Cameroon
          </motion.p>

          <motion.h1
            variants={textAnimation}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Building digital products with
            <span> purpose and creativity.</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            variants={textAnimation}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            I&apos;m Neba Precious Ngeh, a software developer and designer
            creating practical digital experiences while growing through
            technology, visual design, and storytelling.
          </motion.p>

          <motion.div
            className="hero-actions"
            variants={textAnimation}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <a className="button button-primary" href="#projects">
              View my work
              <ArrowDownRight size={18} aria-hidden="true" />
            </a>

            <a className="button button-secondary" href="#contact">
              Let&apos;s connect
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            className="hero-status"
            variants={textAnimation}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="status-dot" aria-hidden="true" />
            <span>
              Building my brand and growing through meaningful work.
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-portrait"
          initial={{
            opacity: 0,
            x: 50,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.95,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}