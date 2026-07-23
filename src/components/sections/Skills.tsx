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
      "Next.js",
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
      "Photoshop — Learning",
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
        <div className="section-heading">
          <div>
            <p className="section-number">03</p>
            <h2>Skills and tools</h2>
          </div>

          <p>
            Technologies and creative tools supporting my current work.
          </p>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className="skill-card" key={group.title}>
              <h3>{group.title}</h3>

              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}