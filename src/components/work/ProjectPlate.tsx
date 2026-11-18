import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Tilt from "@/components/animations/Tilt";
import ScreensPlate from "@/components/media/ScreensPlate";
import type { ProjectDTO } from "@/lib/types";

/** Large alternating project feature used on the home and work index. */
export default function ProjectPlate({
  project,
  index,
  headingLevel = "h3",
  priority = false,
}: {
  project: ProjectDTO;
  index: number;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const Heading = headingLevel;
  const images = project.gallery.length > 0 ? project.gallery : project.cover ? [project.cover] : [];

  return (
    <article className="project-plate" data-flip={index % 2 === 1}>
      <Link href={`/work/${project.slug}`} className="project-plate-visual" tabIndex={-1} aria-hidden="true">
        <Tilt max={6}>
          <ScreensPlate images={images} label={project.name} priority={priority} />
        </Tilt>
      </Link>

      <div className="project-plate-body">
        <p className="project-plate-meta mono">
          <span className="accent">{String(index + 1).padStart(2, "0")}</span>
          {project.category && <span>{project.category.name}</span>}
          {project.stage && <span>{project.stage}</span>}
          {project.isSample && <span className="sample-badge">Sample</span>}
        </p>

        <Heading className="project-plate-title">
          <Link href={`/work/${project.slug}`}>{project.name}</Link>
        </Heading>

        <p className="project-plate-summary">{project.summary}</p>

        {project.technologies.length > 0 && (
          <ul className="tag-list" aria-label="Technologies">
            {project.technologies.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
        )}

        {project.confidentialityNote && (
          <p className="project-plate-note">
            <LockKeyhole size={14} aria-hidden="true" />
            Company-owned · limited public preview
          </p>
        )}

        <div className="project-plate-links">
          <Link href={`/work/${project.slug}`} className="link-arrow">
            Project details <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {project.repoUrl && (
            <a href={project.repoUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
              Source code <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
              Live demo <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
