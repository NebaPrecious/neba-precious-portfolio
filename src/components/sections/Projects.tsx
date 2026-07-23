import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="section-number">02</p>
            <h2>Selected projects</h2>
          </div>

          <p>
            Products I have contributed to or am currently developing.
          </p>
        </div>

        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-card" key={project.name}>
              <div className="project-index">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="project-main">
                <div className="project-meta">
                  <span>{project.category}</span>
                  <span className="project-status">{project.status}</span>
                </div>

                <h3>{project.name}</h3>
                <p>{project.description}</p>

                <div className="tag-list">
                  {project.technologies.map((technology) => (
                    <span className="tag" key={technology}>
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}