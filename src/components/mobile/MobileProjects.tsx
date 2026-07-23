"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  BrainCircuit,
  HeartPulse,
  Sparkles,
} from "lucide-react";

const mobileProjects = [
  {
    number: "01",
    name: "Jangora",
    category: "Personal Finance",
    description:
      "An AI-assisted personal finance application designed to help users track expenses, build better saving habits, work toward financial goals, and develop financial discipline.",
    technologies: [
      "Ionic Angular",
      "NestJS",
      "TypeScript",
      "PostgreSQL",
    ],
    status: "In development",
    icon: BrainCircuit,
    href: "https://github.com/NebaPrecious",
    linkLabel: "View GitHub profile",
    accentClass: "mobile-project-purple",
    external: true,
  },
  {
    number: "02",
    name: "PharmaCompare",
    category: "Digital Healthcare",
    description:
      "An online healthcare platform designed to help people access medical services from home and receive faster assistance during urgent situations, with AI-supported features.",
    technologies: [
      "Angular",
      "Ionic",
      "Node.js",
      "MySQL",
    ],
    status: "Team project",
    icon: HeartPulse,
    href: "#mobile-contact",
    linkLabel: "Discuss the project",
    accentClass: "mobile-project-cyan",
    external: false,
  },
];

export default function MobileProjects() {
  return (
    <section
      className="mobile-section mobile-projects"
      id="mobile-projects"
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
            <span className="mobile-section-number">02</span>
            <p className="mobile-section-label">Selected projects</p>
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
          Products shaped through code and purpose.
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
          A selection of digital products I have contributed to or am
          currently developing.
        </motion.p>

        <div className="mobile-project-grid">
          {mobileProjects.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.article
                className={`mobile-project-card ${project.accentClass}`}
                key={project.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.68,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="mobile-project-visual">
                  <div className="mobile-project-orb mobile-project-orb-one" />
                  <div className="mobile-project-orb mobile-project-orb-two" />

                  <div className="mobile-project-visual-top">
                    <span>{project.number}</span>

                    <span className="mobile-project-status">
                      {project.status}
                    </span>
                  </div>

                  <div className="mobile-project-icon">
                    <Icon
                      size={34}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>

                  <p>{project.category}</p>
                </div>

                <div className="mobile-project-content">
                  <h3>{project.name}</h3>

                  <p>{project.description}</p>

                  <div
                    className="mobile-project-tags"
                    aria-label={`${project.name} technologies`}
                  >
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  <a
                    href={project.href}
                    target={project.external ? "_blank" : undefined}
                    rel={project.external ? "noreferrer" : undefined}
                  >
                    <span>{project.linkLabel}</span>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}