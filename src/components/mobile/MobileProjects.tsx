"use client";

import Image from "next/image";
import JangoraShowcase from "@/components/projects/JangoraShowcase";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";

export default function MobileProjects() {
  return (
    <section
      className="mobile-section mobile-projects"
      id="mobile-projects"
    >
      <div className="mobile-container">
        <motion.div
          initial={{
            opacity: 0,
            y: 22,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mobile-kicker">Projects</p>

          <h2 className="mobile-section-title">
            Products shaped through code and purpose.
          </h2>
        </motion.div>

        <motion.p
          className="mobile-section-intro"
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.6,
            delay: 0.12,
          }}
        >
          A selection of digital products I have contributed to or am
          currently developing.
        </motion.p>

        <div className="mobile-project-grid">
          <motion.article
            className="mobile-featured-project"
            initial={{
              opacity: 0,
              y: 28,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.12,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <JangoraShowcase mobile />

            <div className="mobile-project-content">
              <div className="mobile-project-heading-row">
                <div>
                  <span>Personal Finance</span>
                  <h3>Jangora</h3>
                </div>

                <span className="mobile-project-status">
                  In development
                </span>
              </div>

              <p>
                An AI-assisted personal finance application designed to help
                users track expenses, build better saving habits, work toward
                financial goals, and develop financial discipline.
              </p>

              <div
                className="mobile-project-tags"
                aria-label="Jangora technologies"
              >
                <span>Ionic Angular</span>
                <span>NestJS</span>
                <span>TypeScript</span>
                <span>PostgreSQL</span>
              </div>

              <a
                href="https://github.com/NebaPrecious"
                target="_blank"
                rel="noreferrer"
                className="mobile-project-link"
              >
                <span>View my GitHub</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </motion.article>

          <motion.article
            className="mobile-company-project"
            initial={{
              opacity: 0,
              y: 28,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.12,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mobile-company-project-visual">
              <div className="mobile-company-preview">
                <Image
                  src="/projects/pharmacompare/pharmacompare-splash.png"
                  alt="Approved PharmaCompare splash screen preview"
                  fill
                  sizes="(max-width: 700px) 72vw"
                  className="mobile-company-preview-image"
                />

                <div className="mobile-company-preview-overlay">
                  <span>Limited public preview</span>
                  <strong>PharmaCompare</strong>
                </div>
              </div>

              <span className="mobile-company-security">
                <LockKeyhole size={13} aria-hidden="true" />
                Company-owned project
              </span>
            </div>

            <div className="mobile-project-content">
              <div className="mobile-project-heading-row">
                <div>
                  <span>Digital Healthcare</span>
                  <h3>PharmaCompare</h3>
                </div>

                <span className="mobile-project-status">
                  Team project
                </span>
              </div>

              <p>
                Contributed as part of a team to the frontend and backend
                development of a company-owned healthcare platform helping
                users access medical services from home and receive faster
                support during urgent situations.
              </p>

              <div className="mobile-confidential-note">
                <LockKeyhole size={14} aria-hidden="true" />

                <span>
                  Only an approved splash-screen preview is displayed. The
                  repository, internal interfaces, and full product details
                  remain private because the platform belongs to the company
                  and is still under development.
                </span>
              </div>

              <div
                className="mobile-project-tags"
                aria-label="PharmaCompare technologies"
              >
                <span>Angular</span>
                <span>Ionic</span>
                <span>Node.js</span>
                <span>MySQL</span>
              </div>

              <a href="#mobile-contact" className="mobile-project-link">
                <span>Details available on request</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}