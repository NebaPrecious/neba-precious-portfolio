import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import MediaImage, { isPortrait } from "@/components/media/MediaImage";
import { siteUrl } from "@/lib/site";
import { getProjectBySlug, getPublishedProjects } from "@/server/dal/public";
import "@/styles/work.css";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  // At least one param is required for build-time validation under Cache Components.
  return projects.length > 0 ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const image = project.cover ?? project.gallery[0];
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.name,
      description: project.summary,
      url: `/work/${project.slug}`,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);
  if (!project) notFound();

  const i = all.findIndex((p) => p.id === project.id);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i < all.length - 1 ? all[i + 1] : null;
  const images = project.gallery.length > 0 ? project.gallery : project.cover ? [project.cover] : [];
  const allPhones = images.length > 0 && images.every(isPortrait);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.summary,
    applicationCategory: project.category?.name,
    url: project.demoUrl ?? `${siteUrl}/work/${project.slug}`,
    author: { "@id": `${siteUrl}/#person` },
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
  };

  return (
    <article>
      <header className="page-hero detail-hero">
        <div className="wrap">
          <Link href="/work" className="detail-back">
            <ArrowLeft size={14} aria-hidden="true" /> All development work
          </Link>
          <div className="page-hero-grid" style={{ marginTop: "var(--space-6)" }}>
            <div>
              <p className="eyebrow">
                <span className="eyebrow-index">{String(i + 1).padStart(2, "0")}</span>
                {project.category?.name ?? "Project"}
                {project.isSample && <span className="sample-badge">Sample</span>}
              </p>
              <h1>{project.name}</h1>
            </div>
            <div>
              <p className="lede">{project.summary}</p>
              {(project.repoUrl || project.demoUrl) && (
                <div className="detail-links">
                  {project.demoUrl && (
                    <a className="btn btn-accent" href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      Live demo <ArrowUpRight className="arrow-diag" size={16} aria-hidden="true" />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a className="btn btn-outline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      Source code <ArrowUpRight className="arrow-diag" size={16} aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="wrap">
        <dl className="detail-meta">
          {project.role && (
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {project.stage && (
            <div>
              <dt>Stage</dt>
              <dd>{project.stage}</dd>
            </div>
          )}
          {project.year && (
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
          )}
          {project.technologies.length > 0 && (
            <div style={{ gridColumn: "span 2" }}>
              <dt>Stack</dt>
              <dd>
                <ul className="tag-list" style={{ marginTop: "0.4rem" }}>
                  {project.technologies.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        <div className="detail-body">
          <div className="stack">
            {project.confidentialityNote && (
              <p className="notice">
                <LockKeyhole size={16} aria-hidden="true" />
                <span>{project.confidentialityNote}</span>
              </p>
            )}
            {project.body && (
              <div className="prose">
                {project.body.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>{para}</p>
                ))}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className={`gallery ${allPhones ? "" : "gallery-wide"}`}>
              {images.map((m, k) => (
                <Reveal key={m.id} delay={k * 0.05}>
                  <figure className="frame">
                    <div className="frame-media">
                      <MediaImage
                        media={m}
                        sizes={allPhones ? "(max-width: 900px) 45vw, 16vw" : "(max-width: 900px) 92vw, 60vw"}
                        priority={k === 0}
                      />
                    </div>
                    {m.alt && <figcaption className="frame-caption">{m.alt}</figcaption>}
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {(prev || next) && (
          <nav className="pager" aria-label="More projects">
            {prev && (
              <Link href={`/work/${prev.slug}`}>
                <span className="eyebrow">← Previous</span>
                <strong>{prev.name}</strong>
              </Link>
            )}
            {next && (
              <Link href={`/work/${next.slug}`} className="pager-next">
                <span className="eyebrow">Next →</span>
                <strong>{next.name}</strong>
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
