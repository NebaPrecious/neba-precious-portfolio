import Link from "next/link";
import { Code2, Plus } from "lucide-react";
import CategoryManager from "@/components/admin/CategoryManager";
import Notice from "@/components/admin/Notice";
import RowActions from "@/components/admin/RowActions";
import { listCategories, listProjects } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const [projects, categories] = await Promise.all([listProjects(), listCategories("dev")]);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Development projects</h1>
          <p>Shown on /work and the home page. Featured items appear on the home page first.</p>
        </div>
        <Link className="btn btn-accent btn-sm" href="/admin/projects/new">
          <Plus size={15} aria-hidden="true" /> New project
        </Link>
      </div>

      <Notice searchParams={searchParams} />

      <div className="admin-grid-2">
        <section aria-label="Projects">
          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              <p>Add your first project with a short description, screenshots and links.</p>
              <Link className="btn btn-sm" href="/admin/projects/new">
                New project
              </Link>
            </div>
          ) : (
            <div className="rows">
              {projects.map((p, i) => (
                <div className="row" key={p.id}>
                  <div className="row-thumb">
                    {p.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                      <img src={p.cover.url} alt="" />
                    ) : (
                      <Code2 size={18} aria-hidden="true" />
                    )}
                  </div>
                  <div className="row-main">
                    <div className="row-title">
                      <Link href={`/admin/projects/${p.id}`}>{p.name}</Link>
                      {p.status === "published" ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge badge-warning">Draft</span>
                      )}
                      {p.featured && <span className="badge">Featured</span>}
                      {p.isSample && <span className="sample-badge">Sample</span>}
                    </div>
                    <p className="row-sub">
                      {[p.category?.name, p.stage, p.technologies.map((t) => t.name).join(", ")].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <RowActions
                    type="project"
                    id={p.id}
                    name={p.name}
                    published={p.status === "published"}
                    featured={p.featured}
                    first={i === 0}
                    last={i === projects.length - 1}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <CategoryManager scope="dev" categories={categories} title="Project categories" unit="projects" />
      </div>
    </>
  );
}
