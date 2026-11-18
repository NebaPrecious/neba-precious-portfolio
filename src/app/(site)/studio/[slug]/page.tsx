import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import MediaImage from "@/components/media/MediaImage";
import { formatDuration, parseVideoUrl } from "@/lib/embed";
import { siteUrl } from "@/lib/site";
import { getCreativeBySlug, getPublishedCreative } from "@/server/dal/public";
import "@/styles/studio.css";
import "@/styles/work.css";

export async function generateStaticParams() {
  const items = await getPublishedCreative();
  return items.length > 0 ? items.map((i) => ({ slug: i.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/studio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCreativeBySlug(slug);
  if (!item) return { title: "Not found" };
  const image = item.cover ?? item.video;
  const imageUrl = image?.kind === "video" ? image.posterUrl : image?.url;
  return {
    title: `${item.title} — Studio`,
    description: item.summary,
    alternates: { canonical: `/studio/${item.slug}` },
    openGraph: {
      type: item.video || item.externalUrl ? "video.other" : "website",
      title: item.title,
      description: item.summary,
      url: `/studio/${item.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: image?.alt || item.title }] : undefined,
    },
  };
}

export default async function CreativePage({ params }: PageProps<"/studio/[slug]">) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getCreativeBySlug(slug), getPublishedCreative()]);
  if (!item) notFound();

  const i = all.findIndex((c) => c.id === item.id);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i < all.length - 1 ? all[i + 1] : null;
  const embed = parseVideoUrl(item.externalUrl);
  const poster = item.video?.posterUrl ?? item.cover?.url ?? undefined;
  const duration = formatDuration(item.video?.durationSeconds);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.video || embed ? "VideoObject" : "CreativeWork",
    name: item.title,
    description: item.summary,
    url: `${siteUrl}/studio/${item.slug}`,
    creator: { "@id": `${siteUrl}/#person` },
    ...(poster ? { thumbnailUrl: poster.startsWith("http") ? poster : `${siteUrl}${poster}` } : {}),
    ...(item.video ? { contentUrl: item.video.url } : {}),
    ...(embed?.embedUrl ? { embedUrl: embed.embedUrl } : {}),
  };

  return (
    <article className="screen screen-grain">
      <div className="letterbox" aria-hidden="true" />
      <div className="wrap viewer">
        <Link href="/studio" className="detail-back">
          <ArrowLeft size={14} aria-hidden="true" /> Back to the studio
        </Link>

        <div className="viewer-stage" data-aspect={item.aspect}>
          {item.video ? (
            <video
              src={item.video.url}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              aria-label={item.title}
            />
          ) : embed?.embedUrl ? (
            <iframe
              src={embed.embedUrl}
              title={item.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <>
              {item.cover && (
                <div className="viewer-image">
                  <MediaImage media={item.cover} fill priority sizes="100vw" alt={item.cover.alt || item.title} />
                </div>
              )}
              {embed && (
                <div className="viewer-external">
                  <a className="btn btn-accent" href={embed.watchUrl} target="_blank" rel="noopener noreferrer">
                    Watch on {embed.provider === "external" ? embed.label : embed.provider}
                    <ArrowUpRight className="arrow-diag" size={16} aria-hidden="true" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        <div className="viewer-head">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-index">{String(i + 1).padStart(2, "0")}</span>
              {item.category?.name ?? "Studio"}
              {duration && <span>· {duration}</span>}
              {item.isSample && <span className="sample-badge">Sample</span>}
            </p>
            <h1 style={{ marginTop: "var(--space-4)" }}>{item.title}</h1>
          </div>
          <div className="stack">
            <p className="lede">{item.summary}</p>
            {item.body && (
              <div className="prose">
                {item.body.split(/\n{2,}/).map((p, k) => (
                  <p key={k}>{p}</p>
                ))}
              </div>
            )}
            <dl className="detail-meta" style={{ borderBottom: 0, paddingBottom: 0 }}>
              {item.tools.length > 0 && (
                <div>
                  <dt>Tools</dt>
                  <dd>{item.tools.join(", ")}</dd>
                </div>
              )}
              {item.year && (
                <div>
                  <dt>Year</dt>
                  <dd>{item.year}</dd>
                </div>
              )}
            </dl>
            {embed && embed.embedUrl && (
              <a className="link-arrow" href={embed.watchUrl} target="_blank" rel="noopener noreferrer">
                Open on {embed.provider === "youtube" ? "YouTube" : "Vimeo"}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {(prev || next) && (
          <nav className="pager" aria-label="More studio work" style={{ marginTop: "var(--space-8)" }}>
            {prev && (
              <Link href={`/studio/${prev.slug}`}>
                <span className="eyebrow">← Previous</span>
                <strong>{prev.title}</strong>
              </Link>
            )}
            {next && (
              <Link href={`/studio/${next.slug}`} className="pager-next">
                <span className="eyebrow">Next →</span>
                <strong>{next.title}</strong>
              </Link>
            )}
          </nav>
        )}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </article>
  );
}
