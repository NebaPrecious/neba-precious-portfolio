# Creatives Gallery Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `/creatives` page with a two-tab Pinterest-masonry gallery (Visual design / Video creatives), an image lightbox, an in-modal video player, and path-aware navigation.

**Architecture:** Static Server Component page (`src/app/creatives/page.tsx`) with its own metadata, rendering a client gallery. Content is data-driven from `src/data/creatives.ts` (Cloudinary-ready URL strings; SVG placeholders for now). One shared masonry layout (CSS multi-column) serves both tabs; a single modal handles image lightbox and video playback. Navbar becomes path-aware via `usePathname`.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), TypeScript, React 19, `motion` (v12, `motion/react`), `lucide-react`, `next/image`, plain CSS in `src/app/globals.css`.

**Spec:** `docs/superpowers/specs/2026-09-06-creatives-page-design.md`

## Global Constraints

- Next.js 16 (App Router). **AGENTS.md: THIS Next.js is not training-data Next.js — see `node_modules/next/dist/docs/` before writing code.**
- Design tokens only from `globals.css` custom properties: `--background`, `--surface`, `--surface-2`, `--border`, `--border-strong`, `--accent`, `--accent-tint`, `--foreground`, `--muted`, `--font-display`, `--ease-out`.
- Motion imported from `"motion/react"` (never `framer-motion`).
- Icons from `lucide-react`; brand/social icons from `react-icons`.
- All new CSS added to `src/app/globals.css` with the existing section-comment style (`/* ======== ... */`).
- No `—` emdashes anywhere (user rule). No section numbers.
- `npm run check` (lint -> typecheck -> build) must stay green after every task.
- New CSS classes must not collide with existing ones in `globals.css`.
- `@/*` path alias maps to `src/*`.

---

### Task 1: Creative data model + placeholder assets

**Files:**
- Create: `src/data/creatives.ts`
- Create: `scripts/generate-creative-placeholders.mjs`
- Runtime output: `public/creatives/visuals/*.svg`, `public/creatives/video-poster.svg`

**Interfaces:**
- Produces:
  - `type CreativeItem = { id: string; title: string; description: string; src: string; poster?: string; aspectRatio: "portrait" | "square" | "landscape"; type: "image" | "video"; }`
  - `export const visualDesigns: CreativeItem[]`
  - `export const videoCreatives: CreativeItem[]`

- [ ] **Step 1: Create `src/data/creatives.ts`**

```ts
export type CreativeItem = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster?: string;
  aspectRatio: "portrait" | "square" | "landscape";
  type: "image" | "video";
};

export const visualDesigns: CreativeItem[] = [
  {
    id: "neon-retreat",
    title: "Neon Retreat Flyer",
    description:
      "Event flyer concept built around bold typography and a neon color palette.",
    src: "/creatives/visuals/neon-retreat.svg",
    aspectRatio: "portrait",
    type: "image",
  },
  {
    id: "summit-brand",
    title: "Summit Brand Board",
    description:
      "Early brand exploration for a tech summit, pairing a calm blue system with clean type.",
    src: "/creatives/visuals/summit-brand.svg",
    aspectRatio: "landscape",
    type: "image",
  },
  {
    id: "event-highlight-thumb",
    title: "Event Highlights Thumbnail",
    description:
      "YouTube thumbnail direction for event highlight recaps.",
    src: "/creatives/visuals/event-highlight-thumb.svg",
    aspectRatio: "square",
    type: "image",
  },
  {
    id: "product-launch",
    title: "Product Launch Social",
    description:
      "Social media graphic for a product launch, focused on a single bold message.",
    src: "/creatives/visuals/product-launch.svg",
    aspectRatio: "portrait",
    type: "image",
  },
  {
    id: "studio-reel-cover",
    title: "Studio Reel Cover",
    description:
      "Cover design for a studio showreel, kept minimal to let the footage lead.",
    src: "/creatives/visuals/studio-reel-cover.svg",
    aspectRatio: "landscape",
    type: "image",
  },
  {
    id: "campaign-banner",
    title: "Campaign Banner",
    description:
      "Wide banner for a short campaign, with a high-contrast palette and tight copy.",
    src: "/creatives/visuals/campaign-banner.svg",
    aspectRatio: "landscape",
    type: "image",
  },
];

export const videoCreatives: CreativeItem[] = [
  {
    id: "event-highlight-2025",
    title: "Event Highlights 2025",
    description:
      "Fast-cut highlights reel built from event footage, synced to the music track.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
  {
    id: "teaser-this-is-fire",
    title: "Teaser: This is Fire",
    description:
      "Short teaser that builds tension through pacing and cuts before the reveal.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
  {
    id: "creative-showreel",
    title: "Creative Showreel",
    description:
      "A 60-second showreel mixing motion graphics and live clips.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
];
```

- [ ] **Step 2: Create `scripts/generate-creative-placeholders.mjs`**

```js
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "creatives", "visuals");
mkdirSync(outDir, { recursive: true });

const visualSeeds = [
  { id: "neon-retreat", from: "#7c3aed", to: "#1e1b4b", size: [600, 800], label: "NEON RETREAT" },
  { id: "summit-brand", from: "#0ea5e9", to: "#0c4a6e", size: [800, 600], label: "SUMMIT BRAND" },
  { id: "event-highlight-thumb", from: "#f59e0b", to: "#431407", size: [700, 700], label: "EVENT HIGHLIGHTS" },
  { id: "product-launch", from: "#f472b6", to: "#500724", size: [600, 800], label: "PRODUCT LAUNCH" },
  { id: "studio-reel-cover", from: "#10b981", to: "#064e3b", size: [800, 600], label: "STUDIO REEL" },
  { id: "campaign-banner", from: "#ef4444", to: "#450a0a", size: [800, 500], label: "CAMPAIGN BANNER" },
];

const contextSvg = (from, to, size, label) => {
  const [w, h] = size;
  const r = Math.round(Math.min(w, h) * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${Math.round(w * 0.82)}" cy="${Math.round(h * 0.16)}" r="${r}" fill="rgba(255,255,255,0.08)"/>
  <rect x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.52)}" width="${Math.round(w * 0.3)}" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
  <text x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.92)}" font-family="Arial, sans-serif" font-size="${Math.round(Math.min(w, h) * 0.05)}" font-weight="700" letter-spacing="3" fill="rgba(255,255,255,0.85)">${label}</text>
</svg>
`;
};

for (const seed of visualSeeds) {
  writeFileSync(
    join(outDir, `${seed.id}.svg`),
    contextSvg(seed.from, seed.to, seed.size, seed.label),
  );
}

const posterPath = join(process.cwd(), "public", "creatives", "video-poster.svg");
writeFileSync(
  posterPath,
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img" aria-label="Video preview">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#18181b"/>
      <stop offset="1" stop-color="#3f3f46"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <rect x="372" y="201" width="56" height="48" rx="14" fill="rgba(255,255,255,0.92)"/>
  <polygon points="384,215 384,235 400,225" fill="#18181b"/>
</svg>
`,
);

console.log(`Wrote ${visualSeeds.length} visual placeholders + poster to public/creatives/`);
```

- [ ] **Step 3: Generate the placeholder files**

Run: `node scripts/generate-creative-placeholders.mjs`
Expected: prints "Wrote 6 visual placeholders + poster", and `ls public/creatives/visuals` shows the 6 SVGs; `public/creatives/video-poster.svg` exists.

- [ ] **Step 4: Verify typecheck**

Run: `npm run typecheck`
Expected: exit 0, no output beyond tsc finishing.

- [ ] **Step 5: Commit**

```bash
git add src/data/creatives.ts scripts/generate-creative-placeholders.mjs public/creatives
git commit -m "feat: creative gallery data model and placeholder assets"
```

---

### Task 2: Configure next/image for SVG + Cloudinary

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `images.dangerouslyAllowSVG: true`, `images.remotePatterns` including `commondatastorage.googleapis.com` and `res.cloudinary.com`.

- [ ] **Step 1: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: "Compiled successfully", no ESLint/TS errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow SVG and Cloudinary images via next/image"
```

---

### Task 3: Creatives route with metadata + sitemap

**Files:**
- Create: `src/app/creatives/page.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `CreativesClient` (Task 6) — not yet imported in this task; this task renders a minimal shell placeholder inline, replaced in Task 6.
- Produces: `GET /creatives`, `metadata` object, sitemap entry.

- [ ] **Step 1: Create `src/app/creatives/page.tsx`**

```tsx
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "Creative work",
  description:
    "Visual designs, flyers, and video creatives crafted by Neba Precious Ngeh.",
  alternates: {
    canonical: "/creatives",
  },
};

export default function CreativesPage() {
  return (
    <>
      <Navbar />

      <main className="creatives-page">
        <section className="section">
          <div className="container">
            <Reveal>
              <div className="section-heading creative-page-heading">
                <div>
                  <p className="section-label">Creative</p>
                  <h1 className="page-title">
                    Work beyond <span className="accent-word">code</span>
                  </h1>
                </div>

                <p className="page-intro">
                  Visual designs and edited video pieces, collected in one place.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Append sitemap entry — modify `src/app/sitemap.ts`**

Replace the existing return array with:

```ts
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/creatives`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
```

- [ ] **Step 3: Verify build + route**

Run: `npm run build`
Expected: route list includes `/creatives` (under "Route (app)").

- [ ] **Step 4: Commit**

```bash
git add src/app/creatives/page.tsx src/app/sitemap.ts
git commit -m "feat: creatives route with metadata and sitemap entry"
```

---

### Task 4: Path-aware navbar navigation

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Produces: "Creative" nav item (desktop + mobile) points to `/creatives`; all section links (About/Projects/Skills/Contact desktop nav, mobile menu, `Let's talk` button, both brand links) are home-anchors on "/" and `/#...` / `/` elsewhere.
- Consumes: `usePathname` from `next/navigation` (available; Navbar is already `"use client"`).

- [ ] **Step 1: Change the link data + make hrefs path-aware**

Replace `navigationLinks` (lines 23-49) with:

```tsx
type NavLink =
  | { label: string; section: string; href?: undefined }
  | { label: string; href: string; section?: undefined };

const navigationLinks: NavLink[] = [
  { label: "About", section: "about" },
  { label: "Projects", section: "projects" },
  { label: "Skills", section: "skills" },
  { label: "Creative", href: "/creatives" },
  { label: "Contact", section: "contact" },
];
```

Inside the component (after the existing state declarations), add:

```tsx
const pathname = usePathname();
const isHome = pathname === "/";

function hrefFor(link: NavLink): string {
  if (link.href) {
    return link.href;
  }
  const hash = `#${link.section}`;
  return isHome ? hash : `/${hash}`;
}
```

Add `import { usePathname } from "next/navigation";` to the import block at the top of the file (after the existing `"use client";` and before the `react` import).

- [ ] **Step 2: Update brand links**

Desktop brand (line ~235): change `href="#home"` to `href={isHome ? "#home" : "/"}`.
Mobile brand (line ~244): change `href="#mobile-home"` to `href={isHome ? "#mobile-home" : "/"}`.

- [ ] **Step 3: Update desktop nav + contact link**

Desktop nav map (currently `navigationLinks.slice(0, 4)`): change `href={link.desktopHref}` to `href={hrefFor(link)}` and the `key` to `key={hrefFor(link)}`.

`Let's talk` link (line ~263): change `href="#contact"` to `href={isHome ? "#contact" : "/#contact"}`.

- [ ] **Step 4: Update mobile menu links**

Mobile menu map (currently `href={link.mobileHref}`): change to `href={hrefFor(link)}` and key to `key={link.label}` (label is unique and stable; href can be repeated). Remove the old `desktopHref`/`mobileHref` references everywhere.

- [ ] **Step 5: Verify typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 6: Verify behavior via CDP**

Start preview: `(fuser -k 3210/tcp 2>/dev/null; sleep 1; npx next start -p 3210 > /tmp/next-preview.log 2>&1 &); sleep 4` (after `npm run build`).

Using a headless-Chrome CDP script (see Task 9 for the full script pattern): navigate to `http://localhost:3210` (width 1200), evaluate that the nav contains `a[href="/creatives"]` with text "Creative", and that About/Projects/Skills links are `#about`/`#projects`/`#skills`. Then navigate to `http://localhost:3210/creatives` and evaluate that the same links are `/#about`/`/#projects`/`/#skills` and the brand links to `/`.

Expected: assertions pass on both pages.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: path-aware navbar with creatives link"
```

---

### Task 5: Home Creative section links to /creatives

**Files:**
- Modify: `src/components/sections/Creative.tsx`
- Modify: `src/components/mobile/MobileCreative.tsx`
- Modify: `src/app/globals.css` (link resets + "view all" link styles)

**Interfaces:**
- Consumes: `Link` from `next/link`, `motion` from `motion/react`.
- Produces: desktop + mobile creative cards navigate to `/creatives`; a "View all work" link under each list.

- [ ] **Step 1: Desktop — `src/components/sections/Creative.tsx`**

Add `import Link from "next/link";`. Replace the card map body (the `article.creative-item` inside the `.creative-list`) with:

```tsx
<Link className="creative-item" href="/creatives" key={area.title}>
  <div>
    <h3>{area.title}</h3>
    <p>{area.description}</p>
  </div>

  <ArrowUpRight
    className="creative-arrow"
    size={22}
    aria-hidden="true"
  />
</Link>
```

After the `.creative-list` div, add:

```tsx
<Reveal delay={0.35}>
  <Link className="creative-more" href="/creatives">
    View all work
    <ArrowUpRight size={16} aria-hidden="true" />
  </Link>
</Reveal>
```

- [ ] **Step 2: Mobile — `src/components/mobile/MobileCreative.tsx`**

Add `import Link from "next/link";` and `import { ArrowUpRight } from "lucide-react";`.

Replace the card map with `motion`-enabled links. `const MotionLink = motion(Link);` (add after the `creativeAreas` array), then inside the map:

```tsx
<MotionLink
  className="mobile-creative-item"
  href="/creatives"
  key={area.title}
  initial={{ opacity: 0, y: 26 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.15 }}
  transition={{ duration: 0.65, delay: index * 0.1 }}
>
  <h3>{area.title}</h3>

  <p>{area.description}</p>

  <ArrowUpRight
    className="mobile-creative-arrow"
    size={16}
    aria-hidden="true"
  />
</MotionLink>
```

- [ ] **Step 3: CSS — link resets + view-all links in `globals.css`**

In the CREATIVE section (after `.creative-item:hover .creative-arrow`), add:

```css
.creative-item {
  color: inherit;
  text-decoration: none;
  transition: background 180ms ease;
}

.creative-item:hover {
  background: var(--surface);
}

.creative-more {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 650;
  letter-spacing: 0.02em;
  text-decoration: none;
}

.creative-more:hover svg {
  transform: translate(2px, -2px);
}

.creative-more svg {
  transition: transform 300ms var(--ease-out);
}
```

In the MOBILE CREATIVE section, add:

```css
.mobile-creative-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  color: inherit;
  text-decoration: none;
}

.mobile-creative-item .mobile-creative-arrow {
  margin-left: auto;
  color: var(--accent);
}

.mobile-creative-more {
  margin-top: 1.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 650;
  text-decoration: none;
}
```

Add a `<Link className="mobile-creative-more" href="/creatives">View all work <ArrowUpRight /></Link>` after the `.mobile-creative-list` div in `MobileCreative.tsx`.

- [ ] **Step 4: Verify build + CDP**

Run: `npm run build`. Then in the preview server (port 3210), CDP check at width 1200 and 390: the home Creative section has `a.creative-item[href="/creatives"]` (2 per tree) and a `a.creative-more[href="/creatives"]` link; clicking one navigates to `/creatives`.

Expected: assertions pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Creative.tsx src/components/mobile/MobileCreative.tsx src/app/globals.css
git commit -m "feat: link home creative section to creatives page"
```

---

### Task 6: Gallery client components (tabs + grid + cards)

**Files:**
- Create: `src/components/creatives/CreativesClient.tsx`
- Create: `src/components/creatives/CreativeGrid.tsx`
- Create: `src/components/creatives/CreativeItem.tsx`

**Interfaces:**
- Consumes: `visualDesigns`, `videoCreatives`, `CreativeItem` from `@/data/creatives`; `CreativeIndexModal` stub from Task 7 is NOT used yet — Task 7 wires the modal.
- Produces:
  - `CreativesClient` (default export; renders page intro, tabs, grid; owns `activeTab` + `selectedIndex` state; renders the modal when `selectedIndex !== null`)
  - `CreativeGrid({ items, onSelect }: { items: CreativeItem[]; onSelect: (index: number) => void })` (default export)
  - `CreativeItemCard({ item, onSelect }: { item: CreativeItem; onSelect: () => void })` (default export)

- [ ] **Step 1: Create `src/components/creatives/CreativesClient.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  visualDesigns,
  videoCreatives,
  type CreativeItem,
} from "@/data/creatives";
import CreativeGrid from "./CreativeGrid";
import CreativeModal from "./CreativeModal";

type Tab = "visuals" | "videos";

const tabs: { id: Tab; label: string }[] = [
  { id: "visuals", label: "Visual design" },
  { id: "videos", label: "Video creatives" },
];

export default function CreativesClient() {
  const [activeTab, setActiveTab] = useState<Tab>("visuals");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const items: CreativeItem[] =
    activeTab === "visuals" ? visualDesigns : videoCreatives;

  return (
    <>
      <div
        className="creative-tabs"
        role="tablist"
        aria-label="Creative work categories"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              type="button"
              role="tab"
              id={`creative-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="creative-tabpanel"
              tabIndex={selected ? 0 : -1}
              className={selected ? "creative-tab is-active" : "creative-tab"}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIndex(null);
              }}
              onKeyDown={(event) => {
                const current = tabs.findIndex((t) => t.id === activeTab);
                let next = current;

                if (event.key === "ArrowRight") {
                  next = (current + 1) % tabs.length;
                } else if (event.key === "ArrowLeft") {
                  next = (current - 1 + tabs.length) % tabs.length;
                }

                if (next !== current) {
                  event.preventDefault();
                  setActiveTab(tabs[next].id);
                  setSelectedIndex(null);
                  document
                    .getElementById(`creative-tab-${tabs[next].id}`)
                    ?.focus();
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="creative-tabpanel"
        id="creative-tabpanel"
        role="tabpanel"
        aria-labelledby={`creative-tab-${activeTab}`}
      >
        <CreativeGrid
          items={items}
          onSelect={(index) => setSelectedIndex(index)}
        />
      </div>

      <CreativeModal
        items={items}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={(index) => setSelectedIndex(index)}
      />
    </>
  );
}

export type { Dispatch, SetStateAction };
```

- [ ] **Step 2: Create `src/components/creatives/CreativeGrid.tsx`**

```tsx
"use client";

import type { CreativeItem } from "@/data/creatives";
import CreativeItemCard from "./CreativeItem";

type CreativeGridProps = {
  items: CreativeItem[];
  onSelect: (index: number) => void;
};

export default function CreativeGrid({
  items,
  onSelect,
}: CreativeGridProps) {
  if (items.length === 0) {
    return (
      <div className="creative-empty-state">
        <p>Nothing here yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="creative-masonry">
      {items.map((item, index) => (
        <CreativeItemCard
          item={item}
          onSelect={() => onSelect(index)}
          key={item.id}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/creatives/CreativeItem.tsx`**

```tsx
"use client";

import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import type { CreativeItem } from "@/data/creatives";

type CreativeItemProps = {
  item: CreativeItem;
  onSelect: () => void;
};

export default function CreativeItemCard({
  item,
  onSelect,
}: CreativeItemProps) {
  const isVideo = item.type === "video";

  return (
    <button
      type="button"
      className="creative-card"
      onClick={onSelect}
      aria-label={`Open ${item.title}`}
    >
      <span className={`creative-card-media creative-card-${item.aspectRatio}`}>
        <Image
          className="creative-card-image"
          src={item.src}
          alt={item.title}
          fill
          sizes="(max-width: 700px) 90vw, (max-width: 1200px) 45vw, 30vw"
        />
      </span>

      <span className="creative-card-overlay">
        <span className="creative-card-copy">
          <strong>{item.title}</strong>
          <span>{item.description}</span>
        </span>

        {isVideo ? (
          <span className="creative-play-button" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </span>
        ) : (
          <span className="creative-open-button" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        )}
      </span>
    </button>
  );
}
```

Note: `poster` for video cards is handled in the modal (Task 7). The card shows the poster via `src` + the card CSS uses `object-fit: cover`.

- [ ] **Step 4: Wire the shell page to the client**

Modify `src/app/creatives/page.tsx`: replace the single `</Reveal>`-then-`</section>` structure so `CreativesClient` renders inside the same container after the heading. Add `import CreativesClient from "@/components/creatives/CreativesClient";` and, inside `.container`, after the heading Reveal:

```tsx
<Reveal delay={0.1}>
  <CreativesClient />
</Reveal>
```

(Task 7's `CreativeModal` import in `CreativesClient` will fail typecheck until the file exists — create `CreativeModal.tsx` in Task 7 *before* running `npm run check` in Task 6's verification, or run the typecheck for Task 6 after Task 7's Step 1.)

- [ ] **Step 5: Verify typecheck**

Run: `npm run typecheck`
Expected: exit 0 (after Task 7 creates `CreativeModal.tsx`, or see Task 6 note above).

- [ ] **Step 6: Commit**

```bash
git add src/components/creatives/CreativesClient.tsx src/components/creatives/CreativeGrid.tsx src/components/creatives/CreativeItem.tsx src/app/creatives/page.tsx
git commit -m "feat: creatives gallery tabs and item cards"
```

---

### Task 7: Lightbox + video modal

**Files:**
- Create: `src/components/creatives/CreativeModal.tsx`

**Interfaces:**
- Consumes: `CreativeItem` from `@/data/creatives`.
- Produces: `CreativeModal({ items, index, onClose, onNavigate }: { items: CreativeItem[]; index: number | null; onClose: () => void; onNavigate: (index: number) => void })` (default export). `index === null` renders nothing; otherwise renders the item at `index`.

- [ ] **Step 1: Create `src/components/creatives/CreativeModal.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CreativeItem } from "@/data/creatives";

type CreativeModalProps = {
  items: CreativeItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function CreativeModal({
  items,
  index,
  onClose,
  onNavigate,
}: CreativeModalProps) {
  const isOpen = index !== null;
  const item = index === null ? null : items[index];

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (index === null || items.length < 2) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate((index + 1) % items.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate((index - 1 + items.length) % items.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, index, items.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          className="creative-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="creative-modal-panel"
            role="presentation"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="creative-modal-media">
              {item.type === "video" ? (
                <video
                  className="creative-modal-video"
                  src={item.src}
                  poster={item.poster}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  className="creative-modal-image"
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1200px) 92vw, 1100px"
                />
              )}
            </div>

            <div className="creative-modal-caption">
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>

              {items.length > 1 && (
                <div className="creative-modal-nav">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigate((index - 1 + items.length) % items.length);
                    }}
                    aria-label="Previous item"
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigate((index + 1) % items.length);
                    }}
                    aria-label="Next item"
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="creative-modal-close"
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify typecheck across the creatives components**

Run: `npm run check`
Expected: full gate green (lint, typecheck, build).

- [ ] **Step 3: Commit**

```bash
git add src/components/creatives/CreativeModal.tsx
git commit -m "feat: creative lightbox and video modal"
```

---

### Task 8: Creatives page CSS (tabs, masonry, cards, modal)

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: class names used in Tasks 3/6/7: `creatives-page`, `page-title`, `page-intro`, `creative-page-heading`, `creative-tabs`, `creative-tab` (+ `is-active`), `creative-tabpanel`, `creative-masonry`, `creative-card`, `creative-card-media`, `creative-card-portrait/square/landscape`, `creative-card-image`, `creative-card-overlay`, `creative-card-copy`, `creative-play-button`, `creative-open-button`, `creative-empty-state`, `creative-modal-backdrop`, `creative-modal-panel`, `creative-modal-media`, `creative-modal-image`, `creative-modal-video`, `creative-modal-caption`, `creative-modal-nav`, `creative-modal-close`.

- [ ] **Step 1: Add base styles**

Insert a new `/* ================= CREATIVES ================= */` section before the existing `/* ================= CONTACT ================= */` block in `globals.css`:

```css
/* ========================================
   CREATIVES
======================================== */

.page-title {
  margin: 1rem 0 0;
  font-size: clamp(2.8rem, 6vw, 5.2rem);
  line-height: 0.95;
  font-variation-settings: "wdth" 112;
}

.page-intro {
  max-width: 46ch;
  color: var(--muted);
  line-height: 1.7;
}

.creative-tabs {
  margin-top: 3rem;
  display: inline-flex;
  gap: 0.4rem;
  padding: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}

.creative-tab {
  padding: 0.7rem 1.3rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 650;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease;
}

.creative-tab:hover {
  color: var(--foreground);
}

.creative-tab.is-active {
  background: var(--foreground);
  color: var(--background);
}

.creative-tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.creative-tabpanel {
  margin-top: 2.2rem;
}

.creative-masonry {
  columns: 3;
  column-gap: 1.2rem;
}

.creative-card {
  position: relative;
  margin: 0 0 1.2rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 1.1rem;
  overflow: hidden;
  background: var(--surface);
  display: block;
  width: 100%;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  break-inside: avoid;
  transition: border-color 200ms ease, transform 240ms var(--ease-out);
}

.creative-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.creative-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.creative-card-media {
  position: relative;
  display: block;
  width: 100%;
}

.creative-card-portrait {
  aspect-ratio: 3 / 4;
}

.creative-card-square {
  aspect-ratio: 1 / 1;
}

.creative-card-landscape {
  aspect-ratio: 4 / 3;
}

.creative-card-placeholder {
  aspect-ratio: 16 / 9;
}

.creative-card-image {
  object-fit: cover;
  transition: transform 500ms var(--ease-out);
}

.creative-card:hover .creative-card-image {
  transform: scale(1.04);
}

.creative-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.1rem;
  color: #fff;
  background: linear-gradient(
    to top,
    oklch(0.125 0.012 295 / 0.86),
    transparent 55%
  );
  opacity: 0;
  transition: opacity 220ms ease;
}

.creative-card:hover .creative-card-overlay,
.creative-card:focus-visible .creative-card-overlay {
  opacity: 1;
}

.creative-card-copy {
  display: block;
}

.creative-card-copy strong {
  display: block;
  font-size: 1.02rem;
  font-weight: 700;
}

.creative-card-copy > span {
  display: -webkit-box;
  margin-top: 0.3rem;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.78rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.creative-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3rem;
  height: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  transform: translate(-50%, -50%) translateY(6px);
  transition: transform 220ms var(--ease-out), background 180ms ease;
}

.creative-card:hover .creative-play-button {
  transform: translate(-50%, -50%) translateY(0);
  background: var(--accent);
}

.creative-open-button {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
}

.creative-empty-state {
  padding: 4rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 1.1rem;
  text-align: center;
  color: var(--muted);
}

/* Modal */

.creative-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0.05 0.01 295 / 0.88);
  backdrop-filter: blur(10px);
}

.creative-modal-panel {
  position: relative;
  width: min(100%, 64rem);
  max-height: 90vh;
  border: 1px solid var(--border-strong);
  border-radius: 1.2rem;
  background: var(--surface);
  overflow: auto;
}

.creative-modal-media {
  position: relative;
  width: 100%;
  height: min(72vh, 48rem);
}

.creative-modal-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.creative-modal-image {
  object-fit: contain;
}

.creative-modal-caption {
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.creative-modal-caption strong {
  font-size: 1.05rem;
}

.creative-modal-caption p {
  margin: 0.3rem 0 0;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.55;
}

.creative-modal-nav {
  margin-left: auto;
  display: inline-flex;
  gap: 0.4rem;
}

.creative-modal-nav button {
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--surface-2);
  color: var(--foreground);
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease;
}

.creative-modal-nav button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.creative-modal-close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--foreground);
  cursor: pointer;
  z-index: 2;
  transition: border-color 180ms ease, color 180ms ease;
}

.creative-modal-close:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 2: Add responsive rules**

Inside the existing `@media (max-width: 900px) and (min-width: 701px)` block add:

```css
  .creative-masonry {
    columns: 2;
  }
```

Inside the existing `@media (max-width: 700px)` block add:

```css
  .creative-masonry {
    columns: 2;
    column-gap: 0.8rem;
  }

  .creative-card {
    margin-bottom: 0.8rem;
  }

  .creative-tabs {
    width: 100%;
  }

  .creative-tab {
    flex: 1;
    padding: 0.65rem 0.9rem;
    font-size: 0.78rem;
  }
```

Add a new block after the `@media (max-width: 700px)` block closes:

```css
@media (max-width: 350px) {
  .creative-masonry {
    columns: 1;
  }
}
```

And a new block after that:

```css
@media (min-width: 1201px) {
  .creative-masonry {
    columns: 4;
  }
}
```

(Ensure the `@media (max-width: 350px)` and `@media (min-width: 1201px)` blocks do not collide with the existing `@media (max-width: 350px)` block at the file end — merge into it if present; the existing tiny-phone block holds `.mobile-portrait-area` fixes and must be preserved.)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: compile succeeds, new `public/creatives` assets present in the build output.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: creatives gallery and modal styling"
```

---

### Task 9: End-to-end verification (CDP)

**Files:**
- Create: `/tmp/opencode/creatives-check.mjs` (throwaway, not committed)

**Interfaces:**
- Consumes: completed `/creatives` page + home page changes.

- [ ] **Step 1: Write the CDP check script**

```js
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/usr/bin/google-chrome";
const PORT = 9337;
const userData = mkdtempSync(join(tmpdir(), "chrome-creatives-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--remote-debugging-port=" + PORT,
  `--user-data-dir=${userData}`, "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = async (p) => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

for (let i = 0; i < 30; i++) {
  try { const v = await getJson("/json/version"); if (v.webSocketDebuggerUrl) break; } catch {}
  await sleep(400);
}
const page = (await getJson("/json/list")).find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};

await send("Page.enable");

async function visit(width, height, mobile, url, fn) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url });
  await sleep(3500);
  return evaluate(fn);
}

const checks = [];
const check = (label, value) => {
  checks.push(`${value ? "PASS" : "FAIL"} - ${label}`);
  console.log(`${value ? "PASS" : "FAIL"} - ${label}`);
};

// Home: nav + teaser links
let r = await visit(1200, 900, false, "http://localhost:3210", `(() => {
  const nav = [...document.querySelectorAll(".nav-links a")].map(a => [a.textContent.trim(), a.getAttribute("href")]);
  const creativeCards = document.querySelectorAll("a.creative-item[href='/creatives']").length;
  const brand = document.querySelector(".desktop-brand")?.getAttribute("href");
  return { nav, creativeCards, brand };
})()`);
check("home navbar has Creative -> /creatives", r.nav.some(([t, h]) => t === "Creative" && h === "/creatives"));
check("home section links anchor (#about etc.)", r.nav.some(([t, h]) => t === "About" && h === "#about"));
check("home has 2 creative teaser cards", r.creativeCards === 2);
check("home brand is #home", r.brand === "#home");

// Creatives page: nav, grid, tabs
r = await visit(1200, 900, false, "http://localhost:3210/creatives", `(() => {
  const nav = [...document.querySelectorAll(".nav-links a")].map(a => [a.textContent.trim(), a.getAttribute("href")]);
  const brand = document.querySelector(".desktop-brand")?.getAttribute("href");
  const cards = document.querySelectorAll(".creative-card").length;
  const gridCols = getComputedStyle(document.querySelector(".creative-masonry")).columnCount;
  const activeTab = document.querySelector(".creative-tab.is-active")?.textContent.trim();
  return { nav, brand, cards, gridCols, activeTab };
})()`);
check("creatives nav anchors are /#about", r.nav.some(([t, h]) => t === "About" && h === "/#about"));
check("creatives brand links to /", r.brand === "/");
check("visual tab shows 6 cards", r.cards === 6);
check("active tab is 'Visual design'", r.activeTab === "Visual design");

// Switch tabs
r = await visit(1200, 900, false, "http://localhost:3210/creatives", `(async () => {
  const videoTab = [...document.querySelectorAll(".creative-tab")].find(b => b.textContent.includes("Video"));
  videoTab.click();
  await new Promise(res => setTimeout(res, 500));
  return {
    active: document.querySelector(".creative-tab.is-active")?.textContent.trim(),
    cards: document.querySelectorAll(".creative-card").length,
    hasPlayButton: !!document.querySelector(".creative-play-button"),
  };
})()`);
check("video tab activates", r.active === "Video creatives");
check("video tab shows 3 cards", r.cards === 3);
check("video cards show play button", r.hasPlayButton);

// Open image lightbox (visual tab -> click first card)
r = await visit(1200, 900, false, "http://localhost:3210/creatives", `(async () => {
  document.querySelector(".creative-tab.is-active")?.click();
  await new Promise(res => setTimeout(res, 300));
  const first = document.querySelector(".creative-card");
  first.click();
  await new Promise(res => setTimeout(res, 600));
  return {
    dialog: !!document.querySelector(".creative-modal-panel"),
    hasImage: !!document.querySelector(".creative-modal-image"),
    bodyLocked: document.body.style.overflow === "hidden" || getComputedStyle(document.body).overflow === "hidden",
  };
})()`);
check("image lightbox opens", r.dialog && r.hasImage && r.bodyLocked);

// Close via Escape
r = await visit(1200, 900, false, "http://localhost:3210/creatives", `(async () => {
  document.querySelector(".creative-card")?.click();
  await new Promise(res => setTimeout(res, 500));
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise(res => setTimeout(res, 500));
  return !document.querySelector(".creative-modal-panel");
})()`);
check("Escape closes the modal", r);

// Open video modal
r = await visit(1200, 900, false, "http://localhost:3210/creatives", `(async () => {
  const videoTab = [...document.querySelectorAll(".creative-tab")].find(b => b.textContent.includes("Video"));
  videoTab.click();
  await new Promise(res => setTimeout(res, 400));
  document.querySelector(".creative-card")?.click();
  await new Promise(res => setTimeout(res, 600));
  const video = document.querySelector(".creative-modal-video");
  return { hasVideo: !!video, hasControls: video?.controls === true };
})()`);
check("video modal has native player", r.hasVideo && r.hasControls);

// Responsive columns
r = await visit(800, 900, false, "http://localhost:3210/creatives", `(() => 
  getComputedStyle(document.querySelector(".creative-masonry")).columnCount)()`);
check("tablet 800px has 2 columns", r === "2");
r = await visit(390, 844, true, "http://localhost:3210/creatives", `(() =>
  getComputedStyle(document.querySelector(".creative-masonry")).columnCount)()`);
check("mobile 390px has 2 columns", r === "2");

console.log(`\n${checks.filter((c) => c.startsWith("PASS")).length}/${checks.length} checks passed`);
ws.close();
chrome.kill("SIGKILL");
process.exit(checks.every((c) => c.startsWith("PASS")) ? 0 : 1);
```

- [ ] **Step 2: Build + start preview**

Run: `npm run build`, then `(fuser -k 3210/tcp 2>/dev/null; sleep 1; npx next start -p 3210 > /tmp/next-preview.log 2>&1 &); sleep 4`

Expected: `curl -sI http://localhost:3210/creatives` returns `HTTP/1.1 200 OK`.

- [ ] **Step 3: Run the CDP check**

Run: `node /tmp/opencode/creatives-check.mjs`
Expected: 11/11 checks PASS.

- [ ] **Step 4: Final gate + cleanup**

Run: `npm run check`
Expected: lint, typecheck, build all green. Then `fuser -k 3210/tcp 2>/dev/null`.

- [ ] **Step 5: Commit any straggler changes**

```bash
git status --short
git add -A && git commit -m "chore: finalize creatives page"
```

---

## Self-Review Notes

- Spec coverage mapped: route/metadata/sitemap (Task 3), path-aware nav + teaser links (Tasks 4-5), data model + placeholders (Task 1), components (Tasks 6-7), masonry + modal CSS (Task 8), empty state (Task 6 grid), accessibility (tabs focus/arrows in Task 6, dialog + Escape + scroll lock in Task 7), reduced motion (global rules already handle `prefers-reduced-motion`), verification (Task 9).
- No placeholders/TODOs; every code step contains full content.
- Type consistency: `CreativeItem`, `CreativeGrid({ items, onSelect })`, `CreativeItemCard({ item, onSelect })`, `CreativeModal({ items, index, onClose, onNavigate })` used identically across Tasks 6-7.