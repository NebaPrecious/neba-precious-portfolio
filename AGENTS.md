<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Neba Precious Portfolio

Full-stack Next.js 16 App Router site: a public portfolio plus a private admin
dashboard. See `README.md` for setup, and `docs/redesign/` for the design direction
and decisions.

## Commands

- `npm run dev`: dev server on **http://localhost:3005**
- `npm run check`: lint → typecheck → build. Run before committing. The build reads
  the database, so `DATABASE_URL` must be reachable.
- `npm run db:generate` / `db:migrate` / `db:seed` / `admin:create`
- Use npm (there is a `package-lock.json`) and Node 24 (`nvm use 24`).

## Architecture

- **Cache Components are on** (`cacheComponents: true`).
  - Public reads live in `src/server/dal/public.ts` as `'use cache'` functions with
    `cacheTag`. Admin server actions call `updateTag(TAGS.x)`.
  - Anything that reads cookies, headers or searchParams must be inside Suspense.
  - Admin pages and layouts export `instant = false`.
- **Single responsive render tree.** The old dual desktop/mobile trees were removed;
  don't reintroduce them.
- **Styling is hand-written CSS** in `src/styles/*`: tokens, base, components, plus
  per-area files imported by the pages that use them.
  - Tailwind is imported for preflight only. Don't use utility classes.
  - Theme is set with `data-theme` on `<html>`, applied before paint by the inline
    script in `src/app/layout.tsx` and stored in the `theme` cookie.
  - `.screen` forces the dark "screening room" palette (used by the Studio).
- **Mobile first-class:** `src/styles/mobile.css` (loaded globally). Below 860px
  the site uses `MobileDock` for navigation and a header that hides on scroll.
  Selectors there are prefixed with `:root` so they beat page stylesheets, which
  load later. Phone tilt and shake feed the 3D scenes through
  `src/components/play/motion.ts`.
- **Server code** lives in `src/server/`:
  - `db/` holds the schema and client. `client.ts` has no `server-only` so CLI
    scripts can use it.
  - `dal/` holds data access, `actions/` holds server actions, and `auth/` holds
    sessions and passwords.
  - `media.ts` handles Cloudinary and local dev uploads, `mail.ts` sends through
    Resend, and `env.ts` holds optional service config.
- **Auth:** call `requireAdmin()` at the top of every admin page, action, DAL
  function and route handler. `src/proxy.ts` is only an optimistic cookie check.
- **3D heroes:** `src/components/play/`. `PlayHero` gates and lazy-loads one
  scene per page, chosen by `SceneSpec.type` (`types.ts`):
  - `toybox` (`Playground.tsx`)
  - `devices`, `orbit` and `lanyard` (`scenes/*`) Colours come from CSS tokens through
  `readPalette()`; don't hard-code them. Keep the static `.play-fallback` working
  for reduced-motion and no-WebGL visitors.
- **Content authenticity:** never seed or insert placeholder or stock media as
  Neba's work. The studio shows an honest "in the edit" slate until real work is
  published.
- `@/*` maps to `src/*`.

## Gotchas

- React 19 resets `<form action>` fields after an action. Admin forms use
  `useFormAction` (onSubmit + transition) from `src/components/admin/ui.tsx` so
  input survives validation errors.
- Drizzle renders bare column names inside raw `sql` subqueries. Qualify them
  explicitly (see `listMediaWithUsage`).
- Local uploads (`public/uploads/dev`) work only in development. Production needs
  Cloudinary.
- The `/cv` route is dynamic on purpose (`connection()`), so a newly published CV
  is served immediately.
