import { siteUrl } from "@/lib/site";
import type { ProfileDTO } from "@/lib/types";

function absolute(url: string) {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}

/** JSON-LD for the person + website. Built from the live profile. */
export default function PersonStructuredData({ profile }: { profile: ProfileDTO }) {
  const [city, country] = profile.location.split(",").map((s) => s.trim());

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: profile.fullName,
        alternateName: [profile.displayName, profile.devBrand, profile.studioBrand],
        url: siteUrl,
        image: profile.portrait ? absolute(profile.portrait.url) : undefined,
        jobTitle: profile.titles.join(" & "),
        description: profile.shortBio,
        email: `mailto:${profile.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: city,
          addressCountry: country === "Cameroon" ? "CM" : country,
        },
        sameAs: profile.socials.map((s) => s.url),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: profile.displayName,
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so profile text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
