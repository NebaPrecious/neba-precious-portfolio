<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Neba Precious Portfolio

Single-page Next.js 16 App Router portfolio. See `LOCAL_DEVELOPMENT.md` for the verified local toolchain (Node 24, npm, Next 16.3.4).

## Commands

- `npm run dev` — dev server on http://localhost:3000 (Turbopack default)
- `npm run check` — full gate: `lint` -> `typecheck` -> `build`. Run before committing.
- `npm run build && npm run start` — production preview
- Individual: `npm run lint`, `npm run typecheck`

Use npm (repo has `package-lock.json`).

## Architecture

- **Dual desktop/mobile render tree**: `src/app/page.tsx` renders BOTH a `.desktop-portfolio` and `.mobile-portfolio` wrapper, each with its own set of components (`src/components/sections/*` vs `src/components/mobile/*`). CSS toggles visibility — `.mobile-portfolio` is shown only at `max-width: 700px`; desktop is hidden then. When changing one section, likely update BOTH variants.
- **Styling is hand-written plain CSS** in `src/app/globals.css` (~2500 lines) using CSS custom properties (e.g. `--accent`, `--surface`). Tailwind 4 is installed but the design system is custom CSS — don't assume `@apply` or Tailwind utilities are used.
- Design tokens (colors, fonts, `--container`) and page metadata/SEO live in `src/app/globals.css` and `src/app/layout.tsx` respectively.
- `@/*` path alias maps to `src/*` (see `tsconfig.json`).
- Project content is data-driven from `src/data/projects.ts`.
- Client animation wrapper: `src/components/animations/Reveal.tsx` (`"use client"`, uses `motion`).

## Gotchas

- `src/app/page.tsx` contains leftover dead snippet inside the JSX (a stray `return (...)` block from an earlier edit). Don't duplicate or reintroduce it.
- `globals.css` breakpoints: mobile `max-width: 700px`, tablet `701–900px`. Some rules are duplicated/conflicting inside the media queries (e.g. `.mobile-portrait-area` defined twice in `@media (max-width: 350px)`); the later one wins — be careful editing these.
- SEO/content metadata is centralized in `layout.tsx` (`metadata`, `viewport`); also generated files `robots.ts`, `sitemap.ts`, `icon.tsx`, `opengraph-image.tsx`, `PersonStructuredData.tsx`.
- Site URL base uses `NEXT_PUBLIC_SITE_URL` with a Vercel fallback.
