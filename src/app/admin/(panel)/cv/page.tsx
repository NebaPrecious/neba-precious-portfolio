import CvManager from "@/components/admin/CvManager";
import { getProfileForEdit } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "CV" };

export default async function AdminCvPage() {
  const profile = await getProfileForEdit();
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>CV</h1>
          <p>
            Visitors download your CV from the stable link <code>/cv</code>, which always points to the file
            published here. Upload a new PDF to replace it — old versions stay in the media library until you
            delete them.
          </p>
        </div>
      </div>
      <section className="panel" style={{ maxWidth: "40rem" }}>
        <CvManager initial={profile?.cv ?? null} />
      </section>
    </>
  );
}
