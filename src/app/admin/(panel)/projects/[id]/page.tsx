import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProjectForEdit, listCategories } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [project, categories] = await Promise.all([getProjectForEdit(id), listCategories("dev")]);
  if (!project) notFound();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <Link className="admin-crumb" href="/admin/projects">
            <ArrowLeft size={13} aria-hidden="true" /> Projects
          </Link>
          <h1>{project.name}</h1>
        </div>
        {project.status === "published" && (
          <a className="btn btn-outline btn-sm" href={`/work/${project.slug}`} target="_blank" rel="noopener">
            View live <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
      <ProjectForm
        categories={categories}
        values={{
          id: project.id,
          name: project.name,
          slug: project.slug,
          summary: project.summary,
          body: project.body,
          stage: project.stage,
          role: project.role,
          confidentialityNote: project.confidentialityNote,
          categoryId: project.categoryId,
          cover: project.cover,
          gallery: project.gallery,
          technologies: project.technologies,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          year: project.year,
          featured: project.featured,
          status: project.status,
        }}
      />
    </>
  );
}
