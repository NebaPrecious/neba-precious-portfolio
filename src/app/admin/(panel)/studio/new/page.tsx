import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreativeForm from "@/components/admin/CreativeForm";
import { listCategories } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "New studio work" };

export default async function NewCreativePage() {
  const categories = await listCategories("studio");
  return (
    <>
      <div className="admin-page-head">
        <div>
          <Link className="admin-crumb" href="/admin/studio">
            <ArrowLeft size={13} aria-hidden="true" /> Studio
          </Link>
          <h1>New studio work</h1>
          <p>Upload your own video or paste a link to where it’s hosted, then add a cover frame.</p>
        </div>
      </div>
      <CreativeForm
        categories={categories}
        values={{
          title: "",
          slug: "",
          summary: "",
          body: "",
          categoryId: categories[0]?.id ?? null,
          cover: null,
          video: null,
          externalUrl: null,
          aspect: "landscape",
          tools: [],
          year: null,
          featured: false,
          status: "draft",
        }}
      />
    </>
  );
}
