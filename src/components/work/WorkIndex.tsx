"use client";

import { useMemo, useState } from "react";
import ProjectPlate from "./ProjectPlate";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";

export default function WorkIndex({
  projects,
  categories,
}: {
  projects: ProjectDTO[];
  categories: CategoryDTO[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const used = useMemo(
    () => categories.filter((c) => projects.some((p) => p.category?.id === c.id)),
    [categories, projects],
  );
  const shown = active ? projects.filter((p) => p.category?.id === active) : projects;

  return (
    <>
      <div className="work-toolbar">
        {used.length > 1 ? (
          <div className="chips" role="group" aria-label="Filter by category">
            <button type="button" className="chip" aria-pressed={active === null} onClick={() => setActive(null)}>
              All <span className="count">{projects.length}</span>
            </button>
            {used.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={active === c.id}
                onClick={() => setActive(c.id)}
              >
                {c.name}
                <span className="count">{projects.filter((p) => p.category?.id === c.id).length}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <p className="work-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? "project" : "projects"}
        </p>
      </div>

      <div className="project-plates">
        {shown.map((project, i) => (
          <ProjectPlate key={project.id} project={project} index={i} headingLevel="h2" priority={i === 0} />
        ))}
      </div>
    </>
  );
}
