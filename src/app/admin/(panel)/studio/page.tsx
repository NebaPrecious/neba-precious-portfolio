import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";
import CategoryManager from "@/components/admin/CategoryManager";
import Notice from "@/components/admin/Notice";
import RowActions from "@/components/admin/RowActions";
import { listCategories, listCreative } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Studio" };

export default async function AdminStudioPage({ searchParams }: PageProps<"/admin/studio">) {
  const [items, categories] = await Promise.all([listCreative(), listCategories("studio")]);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Preelite Visual Creatives</h1>
          <p>Video edits, videography and social creatives shown on /studio. Only your own work — covers and videos come from your uploads.</p>
        </div>
        <Link className="btn btn-accent btn-sm" href="/admin/studio/new">
          <Plus size={15} aria-hidden="true" /> New studio work
        </Link>
      </div>

      <Notice searchParams={searchParams} />

      <div className="admin-grid-2">
        <section aria-label="Studio entries">
          {items.length === 0 ? (
            <div className="empty-state">
              <h3>No studio work yet</h3>
              <p>
                Visitors currently see an honest “in the edit” slate. Upload a video (or paste a YouTube/Vimeo
                link) with a cover frame to publish your first piece.
              </p>
              <Link className="btn btn-sm" href="/admin/studio/new">
                Add studio work
              </Link>
            </div>
          ) : (
            <div className="rows">
              {items.map((c, i) => {
                const thumb = c.cover?.url ?? c.video?.posterUrl;
                return (
                  <div className="row" key={c.id}>
                    <div className="row-thumb">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                        <img src={thumb} alt="" />
                      ) : (
                        <Clapperboard size={18} aria-hidden="true" />
                      )}
                    </div>
                    <div className="row-main">
                      <div className="row-title">
                        <Link href={`/admin/studio/${c.id}`}>{c.title}</Link>
                        {c.status === "published" ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )}
                        {c.featured && <span className="badge">Featured</span>}
                        {c.isSample && <span className="sample-badge">Sample</span>}
                      </div>
                      <p className="row-sub">
                        {[c.category?.name, c.video ? "Video uploaded" : c.externalUrl ? "External link" : "No video", c.aspect].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <RowActions
                      type="creative"
                      id={c.id}
                      name={c.title}
                      published={c.status === "published"}
                      featured={c.featured}
                      first={i === 0}
                      last={i === items.length - 1}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <CategoryManager scope="studio" categories={categories} title="Disciplines" unit="entries" />
      </div>
    </>
  );
}
