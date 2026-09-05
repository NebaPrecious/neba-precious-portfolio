"use client";

import { motion } from "motion/react";

const skillGroups = [
  {
    title: "Frontend",
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
    skills: [
      "Canva",
      "Photoshop · Learning",
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
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mobile-kicker">Skills</p>

          <h2 className="mobile-section-title">
            The technologies supporting my work.
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
          A growing collection of development and creative tools I use to
          turn ideas into practical experiences.
        </motion.p>

        <div className="mobile-skill-groups">
          {skillGroups.map((group, index) => (
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
              <h3>{group.title}</h3>

              <div className="mobile-skill-tags">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
