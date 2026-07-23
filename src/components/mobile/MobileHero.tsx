"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";

const revealItem = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function MobileHero() {
  return (
    <section className="mobile-hero" id="mobile-home">
      <div className="mobile-container">
        <motion.div
          className="mobile-portrait-area"
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="mobile-portrait-glow" />
          <div className="mobile-portrait-decoration" />

          <div className="mobile-portrait-frame">
            <Image
              src="/neba-precious-profile.png"
              alt="Professional portrait of Neba Precious Ngeh"
              fill
              priority
              sizes="(max-width: 700px) 68vw, 300px"
              className="mobile-portrait-image"
            />

            <div className="mobile-portrait-overlay">
              <span>Neba Precious Ngeh</span>
              <strong>Software Developer and Designer</strong>
            </div>
          </div>

          <motion.div
            className="mobile-floating-card mobile-floating-card-left"
            initial={{
              opacity: 0,
              x: -15,
              y: 8,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.4,
            }}
          >
            <span>Currently building</span>
            <strong>Jangora</strong>
          </motion.div>

          <motion.div
            className="mobile-floating-card mobile-floating-card-right"
            initial={{
              opacity: 0,
              x: 15,
              y: 8,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.5,
            }}
          >
            <span>My role</span>
            <strong>Developer + Designer</strong>
          </motion.div>
        </motion.div>

        <motion.div
          className="mobile-hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.09,
                delayChildren: 0.18,
              },
            },
          }}
        >
          <motion.p
            className="mobile-kicker"
            variants={revealItem}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Software Developer · Designer · Douala, Cameroon
          </motion.p>

          <motion.h1
            variants={revealItem}
            transition={{
              duration: 0.68,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Building digital products with
            <span> purpose and creativity.</span>
          </motion.h1>

          <motion.p
            className="mobile-hero-description"
            variants={revealItem}
            transition={{
              duration: 0.62,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            I&apos;m Neba Precious Ngeh, a software developer and designer
            creating practical digital experiences while growing through
            technology, visual design, and storytelling.
          </motion.p>

          <motion.div
            className="mobile-hero-actions"
            variants={revealItem}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <a
              className="mobile-primary-button"
              href="#mobile-projects"
            >
              View my work
              <ArrowDownRight size={16} aria-hidden="true" />
            </a>

            <a
              className="mobile-secondary-button"
              href="#mobile-contact"
            >
              Let&apos;s connect
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            className="mobile-hero-meta"
            variants={revealItem}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mobile-availability">
              <span
                className="mobile-availability-dot"
                aria-hidden="true"
              />

              <p>
                Building my brand and growing through meaningful work.
              </p>
            </div>

            <div
              className="mobile-social-row"
              aria-label="Social links"
            >
              <a
                href="https://github.com/NebaPrecious"
                target="_blank"
                rel="noreferrer"
                aria-label="Open GitHub profile"
              >
                <FaGithub size={17} aria-hidden="true" />
              </a>

              <a
                href="https://linkedin.com/in/nebaprecious"
                target="_blank"
                rel="noreferrer"
                aria-label="Open LinkedIn profile"
              >
                <FaLinkedinIn size={17} aria-hidden="true" />
              </a>

              <a
                href="mailto:preciousngehneba@gmail.com"
                aria-label="Send an email"
              >
                <Mail size={17} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}