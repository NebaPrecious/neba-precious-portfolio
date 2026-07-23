export default function PersonStructuredData() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://neba-precious-portfolio.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Neba Precious Ngeh",
    alternateName: "Neba Precious",
    url: siteUrl,
    image: `${siteUrl}/neba-precious-profile.jpg`,
    jobTitle: "Software Developer and Designer",
    description:
      "Full-stack software developer and designer based in Douala, Cameroon.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Douala",
      addressCountry: "CM",
    },
    sameAs: [
      "https://github.com/NebaPrecious",
      "https://linkedin.com/in/nebaprecious",
    ],
    knowsAbout: [
      "Full-stack development",
      "TypeScript",
      "Angular",
      "Ionic",
      "React",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "MySQL",
      "Software design",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}