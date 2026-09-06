# Creatives Gallery Page — Design

Date: 2026-09-06
Status: Approved (design review)

## Overview

Add a dedicated `/creatives` page to the Neba Precious portfolio that showcases creative
work in a Pinterest-style masonry gallery with two tabs: **Visual design** and
**Video creatives**. Both tabs share the same gallery layout. Visual items open in an
image lightbox; video items open in a modal with a native HTML5 player. Content is fully
data-driven so real Cloudinary URLs can be swapped in later without code changes.

## Goals

- Separate, focused page for creative output (currently only two text cards on the home page).
- Pinterest-style masonry that looks designed and performs well (CSS only, no masonry JS).
- One shared layout for both tabs.
- Hover overlays with title + description; play-button affordance on videos.
- Click-to-open full image for visuals; click-to-play for videos.
- Zero cost to migrate placeholders → Cloudinary: change data strings only.

## Route & Metadata

- New file `src/app/creatives/page.tsx` (server component).
- Exports its own `metadata`:
  - `title`: "Creative work"
  - `description`: one line covering visual design + video editing/creatives.
- Reuses the existing `Navbar` and design tokens; no per-page CSS re-skin.
- `src/app/sitemap.ts`: append `{ url: siteUrl + "/creatives", ... }` entry.

## Navigation Changes

`Navbar.tsx` (currently renders only on the home page) becomes path-aware:

- Import `usePathname` from `next/navigation`.
- Helper `hrefFor(sectionId)`: when on "/", return `#<id>`; otherwise `/#<id>`.
  Applies to About, Projects, Skills, Contact (desktop nav + mobile menu).
- "Creative" nav item points to `/creatives` on both desktop and mobile (replaces
  `#creative` / `#mobile-creative`).
- Desktop brand link: on "/" keep `#home`; elsewhere link to `/`.
- Mobile brand link: on "/" keep `#mobile-home`; elsewhere link to `/`.

### Home Creative section as teaser

`src/components/sections/Creative.tsx` and `src/components/mobile/MobileCreative.tsx`:

- Each card keeps its title + short description.
- Each card becomes a link to `/creatives` (the existing `ArrowUpRight` icon is the
  affordance; desktop cards get a wrapping link, mobile cards too).
- Add a small "View all work" affordance consistent with each tree's style.

## Data Model

New file `src/data/creatives.ts`:

```ts
export type CreativeItem = {
  id: string;               // stable key
  title: string;
  description: string;
  src: string;              // image or video URL (Cloudinary-ready)
  poster?: string;          // videos: poster image URL
  aspectRatio: "portrait" | "square" | "landscape";
  type: "image" | "video";
};

export const visualDesigns: CreativeItem[];
export const videoCreatives: CreativeItem[];
```

- Placeholders now; real Cloudinary URLs later. Layout rhythm is controlled per item by
  `aspectRatio`; the masonry mixes heights.

## Components (`src/components/creatives/`)

| File | Type | Responsibility |
| --- | --- | --- |
| `CreativesClient.tsx` | client | Renders the page header controls + tab state ("Visual design" / "Video creatives") + active grid + modal. `useState<Tab>`. |
| `CreativeGrid.tsx` | client | Shared masonry grid; renders `CreativeItem` list for whichever tab is active. |
| `CreativeItem.tsx` | client | Card: thumbnail (`next/image`, lazy, `sizes` for columns), hover overlay (gradient + title + description), play button when `type === "video"`, click opens modal. |
| `CreativeModal.tsx` | client | Lightbox. Image mode: full image + caption, prev/next arrows within the active tab. Video mode: native `<video controls autoPlay poster>`. Escape/backdrop close; body scroll lock while open; `role="dialog"`. |

## Masonry Layout

- CSS multi-column: `.creative-masonry { columns: 3 16rem; column-gap: 1.2rem; }` with
  `.creative-card { break-inside: avoid; }`.
- Column count responsive via media queries to the existing breakpoint style
  (≥1200px: 4, 901–1200: 3, 701–900: 2, ≤700: 1–2 depending on width).
- Card media height varies by `aspectRatio` (portrait tall, square, landscape short) so
  the masonry rhythm reads as designed.
- No JS masonry; pure CSS is resize-safe and cheap.

## Modal Behavior

- Image: click card → overlay with image contained
  (`max-height: 82vh`), caption below (title + description). Prev/next cycle the active
  tab's items (hidden when the tab has one item).
- Video: overlay with `<video>` filling the modal (max ~80vh), native controls, `autoPlay`.
- Close: Escape key, backdrop click, close button. `document.body` overflow hidden while open.
- Respect `prefers-reduced-motion` (reuse existing CSS reduced-motion rules).

## Placeholder Strategy

- **Images**: generate local SVG files under `public/creatives/visuals/` with
  brand-tinted gradients and a subtle label (e.g., the item title) — the gallery looks
  designed and renders fully offline. Swapping to Cloudinary = editing `creatives.ts`.
- **Videos**: use Cloudinary's public demo mp4 (e.g., `…/dog.mp4`) with a generated SVG
  poster. Proves the real upload → URL → `<video>` pipeline that her uploads will follow.
- `next/image` `unoptimized` is NOT needed for local SVGs; otherwise follow the existing
  project image usage (`Image` from `next/image` with `fill`/sizes).

## Empty States

- If a tab's array is empty, render a tasteful empty state (small container card with
  muted copy) instead of an empty grid.

## Accessibility

- Tabs: `role="tablist"` / `role="tab"` / `role="tabpanel"`, arrow-key support,
  `aria-selected`, visible active state.
- Cards: buttons/links with `aria-label` = item title; overlay text is not the only
  affordance (focusable trigger).
- Modal: `role="dialog"`, `aria-modal="true"`, labelled by item title, focus on the close
  button on open, Escape closes.

## Performance

- `next/image` with `fill` + `sizes` matching column widths; lazy loading below the fold.
- Video loads only when the modal opens (no autoload of media on cards).

## Reused Design Tokens / Pattern Conventions

- Colors: `--background`, `--surface`, `--surface-2`, `--border`, `--border-strong`,
  `--accent`, `--accent-tint`, `--foreground`, `--muted`.
- Type: Archivo via `--font-display`; existing `section-label`, `section-heading`, `large-copy`.
- Motion: `motion/react` (`motion`, `AnimatePresence`) as used in `Reveal`/`Navbar`.
- All new CSS goes in `src/app/globals.css` following the existing section-comment style.

## File Manifest

- `src/app/creatives/page.tsx` (new)
- `src/components/creatives/CreativesClient.tsx`, `CreativeGrid.tsx`,
  `CreativeItem.tsx`, `CreativeModal.tsx` (new)
- `src/data/creatives.ts` (new)
- `public/creatives/visuals/*.svg` + one poster SVG (new)
- `src/components/layout/Navbar.tsx` (edit: path-aware links, Creative → /creatives)
- `src/components/sections/Creative.tsx`, `src/components/mobile/MobileCreative.tsx`
  (edit: link cards to /creatives)
- `src/app/sitemap.ts` (edit: add /creatives)
- `src/app/globals.css` (edit: creatives page styles)

## Verification

- `npm run check` (lint → typecheck → build) green.
- CDP (headless Chrome): `/creatives` renders; both tabs switch; masonry column count
  correct at 1200 / 800 / 390 px; image modal opens/closes; video modal reaches a
  playable element; nav links on the page return home correctly; home section links
  navigate to `/creatives`.

## Out of Scope

- Cloudinary upload/automation, auth, or CMS — URL swapping via the data file only.
- Lightbox carousel beyond prev/next within a tab; no swipe gestures.
- No new routes beyond `/creatives`.