"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Clapperboard, Code2, House, Send, UserRound } from "lucide-react";
import { haptic } from "@/components/play/motion";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/work", label: "Work", icon: Code2 },
  { href: "/studio", label: "Studio", icon: Clapperboard },
  { href: "/about", label: "About", icon: UserRound },
  { href: "/contact", label: "Contact", icon: Send },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Phone navigation: a floating glass dock within thumb reach. The active
 * pill glides between tabs. Steps aside while the keyboard is open.
 */
export default function MobileDock() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && (el as HTMLInputElement).type !== "radio";
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  return (
    <nav className="mobile-dock" aria-label="Primary" data-hidden={typing}>
      <ul>
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} onClick={() => haptic(8)}>
                {active && (
                  <motion.span
                    layoutId="dock-pill"
                    className="mobile-dock-pill"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                <Icon size={20} strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
