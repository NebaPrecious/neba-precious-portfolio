import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import CreativeCard from "@/components/studio/CreativeCard";
import StudioSlate from "@/components/studio/StudioSlate";
import type { CategoryDTO, CreativeDTO } from "@/lib/types";

export default function StudioBand({
  brand,
  items,
  categories,
}: {
  brand: string;
  items: CreativeDTO[];
  categories: CategoryDTO[];
}) {
  const featured = (items.some((i) => i.featured) ? items.filter((i) => i.featured) : items).slice(0, 3);

  return (
    <section className="screen studio-band" aria-labelledby="studio-band-title">
      <div className="wrap">
        <div className="studio-band-head">
          <Reveal>
            <p className="eyebrow">
              <span className="status-dot" data-state="rec" aria-hidden="true" />
              <span className="eyebrow-index">02</span> Reel · Studio
            </p>
            <h2 id="studio-band-title" className="studio-band-title">
              {brand}
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="studio-band-aside">
            <p className="lede">
              The studio side of my practice: editing, shooting and designing for screens of
              every size.
            </p>
            <ul className="studio-band-cats mono" aria-label="Studio disciplines">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <span className="accent">{String(i + 1).padStart(2, "0")}</span> {c.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {featured.length > 0 ? (
          <div className="creative-grid">
            {featured.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.06}>
                <CreativeCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        ) : null}
        {featured.length > 1 && (
          <p className="swipe-hint" aria-hidden="true">
            Swipe
          </p>
        )}
        {featured.length === 0 && (
          <Reveal>
            <StudioSlate />
          </Reveal>
        )}

        <Reveal className="studio-band-foot">
          <Link href="/studio" className="btn btn-accent">
            Enter the studio <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
