"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { id?: string; href?: string; label: string };

/**
 * Section nav with indicator lines that grow for the section in view.
 * In-page items track scroll position; `href` items link to other pages.
 */
export default function ScrollSpyNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map((i) => i.id).filter((id): id is string => Boolean(id));
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inView[0]) setActive(inView[0].target.id);
      },
      // A band across the upper-middle of the viewport decides the active section.
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="spy-nav" aria-label="On this page">
      <ul>
        {items.map((item) => {
          const isActive = Boolean(item.id && item.id === active);
          const content = (
            <>
              <span className="spy-line" aria-hidden="true" />
              <span className="spy-label">{item.label}</span>
            </>
          );
          return (
            <li key={item.label}>
              {item.id ? (
                <a href={`#${item.id}`} data-active={isActive} aria-current={isActive ? "location" : undefined}>
                  {content}
                </a>
              ) : (
                <Link href={item.href ?? "/"}>
                  {content}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
