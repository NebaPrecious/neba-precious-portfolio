import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import CreativeForm from "@/components/admin/CreativeForm";
import { getCreativeForEdit, listCategories } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Edit studio work" };

export default async function EditCreativePage({ params }: PageProps<"/admin/studio/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [item, categories] = await Promise.all([getCreativeForEdit(id), listCategories("studio")]);
  if (!item) notFound();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <Link className="admin-crumb" href="/admin/studio">
            <ArrowLeft size={13} aria-hidden="true" /> Studio
          </Link>
          <h1>{item.title}</h1>
        </div>
        {item.status === "published" && (
          <a className="btn btn-outline btn-sm" href={`/studio/${item.slug}`} target="_blank" rel="noopener">
            View live <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
      <CreativeForm
        categories={categories}
        values={{
          id: item.id,
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          body: item.body,
          categoryId: item.categoryId,
          cover: item.cover,
          video: item.video,
          externalUrl: item.externalUrl,
          aspect: item.aspect,
          tools: item.tools,
          year: item.year,
          featured: item.featured,
          status: item.status,
        }}
      />
    </>
  );
}
