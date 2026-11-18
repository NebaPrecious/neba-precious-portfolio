"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { navigation } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop: floating pill with the full nav.
 * Mobile: slim bar (wordmark + theme) that slides away while scrolling down
 * and returns when scrolling up; navigation lives in <MobileDock>.
 */
export default function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled(y > 8);
        // Ignore tiny jitters; hide after scrolling down past the first screenful.
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 240);
          last = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`site-header${pathname.startsWith("/studio") ? " screen" : ""}`}
      data-scrolled={scrolled}
      data-hidden={hidden}
    >
      <div className="wrap site-header-inner">
        <Link href="/" className="wordmark" aria-label={`${name}, home`}>
          <span className="split-mark" aria-hidden="true" />
          {name}
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  <span className="mono" aria-hidden="true">
                    {item.index}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
