import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getPublishedCreative, getPublishedProjects } from "@/server/dal/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, creative] = await Promise.all([getPublishedProjects(), getPublishedCreative()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/studio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];

  return [
    ...staticRoutes,
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...creative.map((c) => ({
      url: `${siteUrl}/studio/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
