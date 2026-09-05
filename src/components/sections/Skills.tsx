import Reveal from "@/components/animations/Reveal";

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
    title: "Tools",
    skills: [
      "Git",
      "GitHub",
      "Postman",
      "Chrome DevTools",
      "Clean Code",
    ],
  },
  {
    title: "Creative",
    skills: [
      "Canva",
      "Photoshop · Learning",
      "CapCut",
      "Visual Design",
      "Video Editing",
    ],
  },
];

export default function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="section-label">Skills</p>
              <h2>
                Skills and <span className="accent-word">tools</span>
              </h2>
            </div>

            <p>
              Technologies and creative tools supporting my current work.
            </p>
          </div>
        </Reveal>

        <div className="skills-grid">
          {skillGroups.map((group, index) => (
            <Reveal key={group.title} delay={index * 0.08}>
              <article className="skill-group">
                <h3>{group.title}</h3>

                <ul>
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}