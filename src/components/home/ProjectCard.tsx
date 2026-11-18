import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import MediaImage from "@/components/media/MediaImage";
import type { ProjectDTO } from "@/lib/types";

/**
 * Compact project card: the whole card is one link (stretched title link),
 * highlights on hover while sibling cards dim (see .hover-list).
 */
export default function ProjectCard({ project }: { project: ProjectDTO }) {
  const thumb = project.cover ?? project.gallery[0] ?? null;

  return (
    <article className="pcard">
      <div className="pcard-side">
        {thumb && (
          <div className="pcard-thumb">
            <MediaImage media={thumb} fill sizes="(max-width: 900px) 30vw, 160px" alt="" />
          </div>
        )}
        {project.stage && <p className="pcard-stage mono">{project.stage}</p>}
      </div>
      <div className="pcard-body">
        <h3 className="pcard-title">
          <Link href={`/work/${project.slug}`} className="stretched">
            {project.name}
            {project.isSample && <span className="sample-badge">Sample</span>}
            <ArrowUpRight className="pcard-arrow" size={16} aria-hidden="true" />
          </Link>
        </h3>
        {project.category && <p className="pcard-cat">{project.category.name}</p>}
        <p className="pcard-summary">{project.summary}</p>
        {project.confidentialityNote && (
          <p className="pcard-note mono">
            <LockKeyhole size={12} aria-hidden="true" /> Company-owned · limited preview
          </p>
        )}
        {project.technologies.length > 0 && (
          <ul className="pill-list" aria-label="Technologies">
            {project.technologies.map((t) => (
              <li key={t} className="pill">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
