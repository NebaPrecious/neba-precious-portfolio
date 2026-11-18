"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { navigation } from "@/lib/site";
import type { SocialLink } from "@/lib/types";

type Props = {
  name: string;
  email: string;
  socials: SocialLink[];
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader({ name, email, socials }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const button = menuButtonRef.current;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 860) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      button?.focus();
    };
  }, [open]);

  return (
    <header className={`site-header${pathname.startsWith("/studio") ? " screen" : ""}`} data-scrolled={scrolled}>
      <div className="wrap site-header-inner">
        <Link href="/" className="wordmark" aria-label={`${name} — home`}>
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
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button menu-button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={17} aria-hidden="true" />
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
          >
            <div className="wrap mobile-menu-top">
              <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
                <span className="split-mark" aria-hidden="true" />
                {name}
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                className="icon-button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="wrap" aria-label="Primary">
              <ol>
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                      <span className="mono" aria-hidden="true">
                        {item.index}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </nav>

            <div className="wrap mobile-menu-foot">
              <a className="link-arrow" href={`mailto:${email}`}>
                {email}
              </a>
              <div className="socials">
                {socials.map((s) => (
                  <a key={s.url} className="link-arrow" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
