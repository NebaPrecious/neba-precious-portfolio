import EasterEgg from "@/components/site/EasterEgg";
import SiteFooter from "@/components/site/SiteFooter";
import MobileDock from "@/components/site/MobileDock";
import SiteHeader from "@/components/site/SiteHeader";
import Spotlight from "@/components/site/Spotlight";
import PersonStructuredData from "@/components/seo/PersonStructuredData";
import { requireProfile } from "@/server/dal/public";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const profile = await requireProfile();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <span id="top" />
      <Spotlight />
      <EasterEgg />
      <SiteHeader name={profile.displayName} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter profile={profile} />
      <MobileDock />
      <PersonStructuredData profile={profile} />
    </>
  );
}
