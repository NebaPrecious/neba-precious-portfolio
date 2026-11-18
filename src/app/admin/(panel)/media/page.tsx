import MediaLibrary from "@/components/admin/MediaLibrary";
import { listMediaWithUsage } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Media" };

export default async function AdminMediaPage() {
  const items = await listMediaWithUsage();
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Media library</h1>
          <p>
            Every uploaded image, video and document. Files still in use can’t be deleted — remove them from
            their project first. Add alt text so images are accessible.
          </p>
        </div>
      </div>
      <MediaLibrary items={items} />
    </>
  );
}
