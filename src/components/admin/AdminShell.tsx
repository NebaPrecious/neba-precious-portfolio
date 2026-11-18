"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  Code2,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/site/ThemeToggle";
import { logout } from "@/server/actions/auth";

type Props = {
  user: { name: string; email: string };
  unread: number;
  children: React.ReactNode;
};

const groups = [
  {
    label: null,
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: Code2 },
      { href: "/admin/studio", label: "Studio", icon: Clapperboard },
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/cv", label: "CV", icon: FileText },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, badge: true },
    ],
  },
  {
    label: "Library",
    items: [{ href: "/admin/media", label: "Media", icon: Images }],
  },
] as const;

export default function AdminShell({ user, unread, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="admin" data-nav-open={open}>
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>

      <header className="admin-topbar">
        <button type="button" className="icon-button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={18} aria-hidden="true" />
        </button>
        <span className="admin-brand">
          <span className="split-mark" aria-hidden="true" /> The Desk
        </span>
        <ThemeToggle />
      </header>

      {open && <button type="button" className="admin-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <aside className="admin-sidebar theme-dark" aria-label="Admin">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/admin" className="admin-brand">
            <span className="split-mark" aria-hidden="true" />
            <span>
              The Desk
              <small>Portfolio admin</small>
            </span>
          </Link>
          {open && (
            <button type="button" className="icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {groups.map((group) => (
            <div key={group.label ?? "root"} style={{ display: "grid", gap: 2 }}>
              {group.label && <p className="admin-nav-group">{group.label}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href, "exact" in item && item.exact) ? "page" : undefined}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {item.label}
                    {"badge" in item && item.badge && unread > 0 && (
                      <span className="badge badge-accent" aria-label={`${unread} unread`}>
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <a href="/" target="_blank" rel="noopener">
            <ExternalLink size={15} aria-hidden="true" /> View live site
          </a>
          <span title={user.email}>Signed in as {user.name}</span>
          <form action={logout}>
            <button type="submit">
              <LogOut size={15} aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <main id="admin-main" className="admin-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
