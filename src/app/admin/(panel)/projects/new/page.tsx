import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "@/components/admin/ProjectForm";
import { listCategories } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const categories = await listCategories("dev");
  return (
    <>
      <div className="admin-page-head">
        <div>
          <Link className="admin-crumb" href="/admin/projects">
            <ArrowLeft size={13} aria-hidden="true" /> Projects
          </Link>
          <h1>New project</h1>
          <p>Start as a draft; publish when the description and screenshots are ready.</p>
        </div>
      </div>
      <ProjectForm
        categories={categories}
        values={{
          name: "",
          slug: "",
          summary: "",
          body: "",
          stage: "",
          role: "",
          confidentialityNote: "",
          categoryId: null,
          cover: null,
          gallery: [],
          technologies: [],
          repoUrl: null,
          demoUrl: null,
          year: null,
          featured: false,
          status: "draft",
        }}
      />
    </>
  );
}
