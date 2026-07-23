"use client";

import { motion } from "motion/react";
import {
  Blocks,
  Braces,
  Database,
  Palette,
  Wrench,
} from "lucide-react";

const skillGroups = [
  {
    title: "Frontend",
    icon: Braces,
    description: "Interfaces and responsive web experiences.",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "Angular",
      "Ionic",
      "React",
      "Bootstrap",
    ],
  },
  {
    title: "Backend",
    icon: Database,
    description: "APIs, application logic, and data systems.",
    skills: [
      "Node.js",
      "NestJS",
      "PHP",
      "REST APIs",
      "MySQL",
      "PostgreSQL",
    ],
  },
  {
    title: "Development tools",
    icon: Wrench,
    description: "Tools supporting my development workflow.",
    skills: [
      "Git",
      "GitHub",
      "Postman",
      "Chrome DevTools",
      "Clean Code",
    ],
  },
  {
    title: "Creative tools",
    icon: Palette,
    description: "Tools supporting my visual and creative growth.",
    skills: [
      "Canva",
      "Photoshop — Learning",
      "CapCut",
      "Visual Design",
      "Video Editing",
    ],
  },
];

export default function MobileSkills() {
  return (
    <section
      className="mobile-section mobile-skills"
      id="mobile-skills"
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
            <span className="mobile-section-number">03</span>
            <p className="mobile-section-label">Skills and tools</p>
          </div>

          <Blocks size={19} aria-hidden="true" />
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
          The technologies supporting my work.
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
          A growing collection of development and creative tools I use to
          turn ideas into practical experiences.
        </motion.p>

        <div className="mobile-skill-groups">
          {skillGroups.map((group, index) => {
            const Icon = group.icon;

            return (
              <motion.article
                className="mobile-skill-group"
                key={group.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.62,
                  delay: index * 0.07,
                }}
              >
                <div className="mobile-skill-heading">
                  <span>
                    <Icon size={18} aria-hidden="true" />
                  </span>

                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </div>

                <div className="mobile-skill-pills">
                  {group.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}