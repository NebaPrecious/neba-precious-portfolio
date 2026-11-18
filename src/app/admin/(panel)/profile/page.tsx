import ProfileForm from "@/components/admin/ProfileForm";
import { getProfileForEdit } from "@/server/dal/admin";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  const profile = await getProfileForEdit();
  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Profile missing</h3>
        <p>
          Run <code>npm run db:seed</code> to create the profile record.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Profile</h1>
          <p>Your name, story, contact details and portrait — used across the whole site.</p>
        </div>
      </div>
      <ProfileForm
        values={{
          displayName: profile.displayName,
          fullName: profile.fullName,
          devBrand: profile.devBrand,
          studioBrand: profile.studioBrand,
          titles: profile.titles,
          heroIntro: profile.heroIntro,
          shortBio: profile.shortBio,
          longBio: profile.longBio,
          engineeringApproach: profile.engineeringApproach,
          creativeApproach: profile.creativeApproach,
          openTo: profile.openTo,
          location: profile.location,
          email: profile.email,
          availability: profile.availability,
          availabilityNote: profile.availabilityNote,
          socials: profile.socials,
          portrait: profile.portrait,
        }}
      />
    </>
  );
}
