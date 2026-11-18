# Redesign — Phase 1: Audit, Research & Plan

Date: 2026-11-18
Status: Approved 2026-11-18. Services: **Neon Postgres, Cloudinary, Resend, Vercel Hobby**. Implementation status → `02-status-and-checklist.md`.

---

## 1. Existing architecture summary

| Area | Finding |
|---|---|
| Framework | Next.js 16.3.4 App Router, React 19.2.4, TypeScript 5. `npm run check` passes cleanly (lint, typecheck, build). |
| Rendering | Every route is static (`○`). No dynamic rendering, no data fetching. |
| Routes | `/`, `/creatives`, plus generated `/icon`, `/apple-icon`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`. |
| Backend | **None.** No route handlers, no server actions, no `proxy.ts`, no database, no auth, no env files. The only env var read is `NEXT_PUBLIC_SITE_URL`. |
| Styling | One 2,479-line `globals.css` with OKLCH tokens (`--background`, `--accent`, …), dark only. Tailwind 4 is imported but its utilities aren't used. |
| Fonts | Archivo variable with the `wdth` axis loaded (a useful asset; see §6). |
| Motion | `Reveal.tsx` (IntersectionObserver + CSS, respects reduced motion — good). The mobile tree uses `motion` `whileInView` directly instead. |
| Media hosting | `next.config.ts` allows `res.cloudinary.com` and `commondatastorage.googleapis.com`, but **no Cloudinary asset or credential exists**. The GCS host is Google's *public sample bucket*, not an account of yours. |
| Contact | `mailto:` links only. No form. |
| Dev toolchain | Dev server on port **3005** (docs say 3000). Shell default here is Node 22; Node 24.15 is installed via nvm. Local PostgreSQL 16 is running, with no role created for your user yet. |

## 2. Page and component inventory

- `src/app/page.tsx` renders **two complete trees**: `.desktop-portfolio` (`sections/*`) and `.mobile-portfolio` (`mobile/*`), toggled by CSS at 700px.
- Sections: Hero (client component, didn't need to be), About, Skills (hardcoded list), Projects (hardcoded JSX; `data/projects.ts` exists but isn't used for rendering), Creative (teaser to `/creatives`), Contact (with the footer inside it).
- `/creatives`: tabs → masonry grid → modal/lightbox (`creatives/*`). Accessibility here is decent: ARIA tabs, keyboard arrows, Escape, focus on open.
- `Navbar`: path-aware hashes, a bottom-sheet mobile menu rendered through a portal.
- SEO: rich `metadata`, `viewport`, `PersonStructuredData`, a generated OG image and icons, sitemap, robots.

## 3. Problems found (verified in code)

**Broken now**
1. **CV download is a 404.** Both trees link `/neba-precious-cv.pdf`, and that file isn't in `public/`.
2. **JSON-LD image is a 404.** It points to `/neba-precious-profile.jpg`, but the file is `.png`.
3. **Duplicate DOM.** Because the page renders both trees, it has two `<h1>`s, two `<main>`s, two Navbars, two portals with `id="mobile-navigation-menu"`, and every section's content twice. That hurts SEO and accessibility and doubles hydration work.

**Authenticity (conflicts with the brief's rules)**
4. `/creatives` currently shows **Blender open-movie sample videos** (Big Buck Bunny, Elephants Dream, Sintel) and generated SVG placeholders under invented titles ("Neon Retreat Flyer", "Summit Brand Board"…) as if they were your work. These must be removed and replaced with clearly labelled empty slots.
5. PharmaCompare's tech list disagrees with itself: `data/projects.ts` says *PHP, MySQL, "PHP VISA"*, while the rendered card says *Node.js, MySQL, REST APIs*. Needs your confirmation.
6. Jangora's "View my GitHub" goes to your profile, not to a repository.

**Quality and debt**
7. No light theme, and `viewport.colorScheme` is hard-set to dark.
8. README is the create-next-app boilerplate (it mentions Geist, which isn't used). AGENTS.md says port 3000 and warns about a dead snippet in `page.tsx` that no longer exists.
9. No `not-found`, `error`, or `loading` UI.
10. `package-lock.json` has an uncommitted change that predates this work. I'll leave it alone.

**Worth preserving**
- The SEO metadata set, OG and icon generation, sitemap and robots (to be extended, not replaced).
- `Reveal` (light, CSS-driven, reduced-motion aware).
- The modal's keyboard handling and the ARIA tab pattern.
- Real assets: the portrait, four Jangora screens, and the approved PharmaCompare splash.
- **The PharmaCompare confidentiality note.** It's honest and professional and should stay.
- The OKLCH token approach.

## 4. Content inventory (real content only)

| Item | Source | Status |
|---|---|---|
| Name | "Neba Precious Ngeh" (site), "Neba Precious" (brief) | Use **Neba Precious** for display and keep "Ngeh" in structured data. Please confirm. |
| Location | Douala, Cameroon | ✅ |
| Email | preciousngehneba@gmail.com | ✅ (public in the current site) |
| Socials | github.com/NebaPrecious, linkedin.com/in/nebaprecious | ✅ (others: none known) |
| Portrait | `public/neba-precious-profile.png` | ✅ |
| Projects | Jangora (in development), PharmaCompare (team, company-owned) | No repo or demo URLs |
| Skills | Frontend 8, Backend 6, Tools 5, Creative 5 (Canva, Photoshop·learning, CapCut, …) | ✅ seeded into the DB |
| Creative work | **None real** | Needs your uploads |
| CV PDF | **Missing** | Needs your upload |
| Brand names | "Dev Pre_elite", "Preelite Visual Creatives" | New, from the brief |

## 5. Reference research — principles taken (not copied)

- **Bruno Simon:** the site *is* the proof of skill. Takeaway: one signature interaction you'll remember, not a 3D world. Ours is the hero's "split exposure" (below).
- **Brittany Chiang:** a sticky identity column with scrolling experience, and restrained, readable text. Takeaway: the dev side should feel calm and scannable, with links that are easy to find.
- **Adham Dannaway:** a split designer/coder face. Takeaway: two disciplines can share one hero frame. We do this with typography and a mask, not a literal half-face.
- **Lucas Vallenet:** full-bleed oversized type and a dark, quiet canvas where the motion carries the expression. Takeaway: let type do the art direction.
- **Anthony735 (Kyle Uy):** a video editor's site with a video hero, category pages, and an admin layer so updates don't need redeploys. This is the closest functional match to the Studio plus admin we're building.

## 6. Proposed direction: "Source & Reel"

One person, two disciplines, one editorial spine. **Source** is the code side and **Reel** is the camera side. They share a visual language borrowed from film contact sheets, where **line numbers ≈ frame numbers** and **commit hashes ≈ timecodes**. That metaphor ties both identities together without gimmicks.

**Typography**
- **Archivo** (already loaded) uses the `wdth` axis as the design device. Dev pages set it narrow and precise (≈ 75–87 wdth). Studio display type runs wide and cinematic (≈ 112–125 wdth). Same family, two voices.
- **Geist Mono** (new, `next/font`) for metadata only: indices, timecodes, tech tags, dates. No new runtime dependency.
- Large display sizes with `clamp()`, body copy capped at about 68ch, and tight tracking on display text.

**Colour (OKLCH)**
- *Light ("Paper")*: warm off-white `oklch(0.97 0.01 85)`, ink `oklch(0.2 0.01 60)`.
- *Dark ("Darkroom")*: warm near-black `oklch(0.145 0.008 60)`, bone text `oklch(0.93 0.012 85)`.
- *One signal accent*: **safelight vermilion** `≈ oklch(0.64 0.19 35)`. It doubles as the "REC" dot in the Studio. It replaces the current violet, which reads generic. The change is reversible because it's a single token.
- Studio screening areas (the hero and the full-screen viewer) stay dark in both themes, following the cinema convention. Listing grids follow the theme.
- Default theme: follow the system setting, falling back to light. The choice persists in `localStorage` and a cookie, with an inline pre-hydration script so the page doesn't flash (per the Next 16 *preventing-flash-before-hydration* guide).

**Layout and motion**
- A 12-column editorial grid with asymmetric splits (5/7, 4/8), hairline rules, and frame-number indices (`01 —`).
- A **single responsive render tree** replaces the dual desktop/mobile trees.
- Motion: a split-exposure hero reveal, View Transitions between the grid and project detail (Next 16 guide), hover-to-preview muted video in the Studio, and the `Reveal` component on scroll. No scroll hijacking. Reduced motion turns all of it off.

**Hero concept.** "Neba Precious" in wide Archivo. The portrait sits in a frame that is half "source" (fine monospace annotation, line numbers) and half "reel" (sprocket edge, timecode). Two doors lead out: **Dev Pre_elite →** and **Preelite Visual Creatives →**.

## 7. Information architecture

| Route | Purpose |
|---|---|
| `/` | Hero with both doors, short intro, featured dev work, featured reel, capabilities strip, contact CTA |
| `/about` | Story, approach to engineering, approach to visual work, what you're open to |
| `/work` | **Dev Pre_elite**: project index with category filter |
| `/work/[slug]` | Short project page: screens, stack, repo and demo links (only when they exist) |
| `/studio` | **Preelite Visual Creatives**: cinematic intro, categories (Video editing, Videography, Social creatives) |
| `/studio/[slug]` | Full viewer: video or embed, credits, tools |
| `/creatives` | **308 redirect → `/studio`** to keep existing links and SEO |
| `/contact` | Enquiry form (stored in the DB and emailed) |
| `/cv` | Redirects to the current CV file managed in the admin |
| `/admin/**` | Private dashboard: overview, projects, studio, skills, profile, CV, inbox |
| `/journal` | **Deferred.** There are no posts yet, and an empty journal looks worse than none. The schema is designed so it can be added later without a migration rewrite. |

## 8. Proposed technical architecture

**Decided by engineering judgement (no account or cost involved)**
- **ORM:** Drizzle ORM plus drizzle-kit SQL migrations. It's TypeScript-first with no binary engine and works with any Postgres. The driver is `postgres` (postgres.js), which works the same against local Postgres 16 and any hosted Postgres.
- **Validation:** `zod`, on the server for every action and handler, and reused client-side for UX only.
- **Auth:** built in-house following the Next 16 authentication guide. No paid service and no extra dependency.
  - Passwords are hashed with **scrypt** from `node:crypto`.
  - **Database sessions** use a random 256-bit token, store only its SHA-256 hash, and support revocation.
  - The cookie is `HttpOnly; Secure; SameSite=Lax; Path=/`, with sliding expiry.
  - `proxy.ts` does a fast cookie-presence redirect for `/admin`, but the **real** check is `requireAdmin()` in a `server-only` data access layer, called by every admin page and action.
  - Login is rate-limited per IP plus username through a DB table with exponential lockout.
  - There is **no registration page**. The first admin is created with `npm run admin:create` (a CLI that prompts for the password and never logs it).
  - CSRF protection comes from Server Actions' built-in Origin check, plus an explicit Origin check in the upload-signing route handler.
- **Data model:** `admin_users`, `sessions`, `login_attempts`, `profile` (singleton, with titles, bios, availability and socials), `categories` (scoped dev/studio), `projects`, `project_technologies`, `skills`, `creative_projects`, `media_assets`, `enquiries`, `settings`. Each content table has `status` (draft/published), `featured` and `sort_order`.
- **Seed:** current real content (both projects, all skills, bios, socials) goes into the DB so nothing is lost. Creative work starts empty, with honest empty states.
- **Caching:** public pages read through cached DAL functions tagged per entity, and admin mutations revalidate those tags. Public pages stay fast and mostly static.
- **Contact:** each enquiry is **always written to the DB first** and then sent as an email notification. Spam defences are a honeypot field, a minimum fill-time, and a per-IP rate limit. A failed email never loses the message, because it's in the admin inbox.

**Needs your decision (accounts, providers, possible cost)**

| Decision | Recommendation | Why | Cost / limits |
|---|---|---|---|
| Hosted database | **Neon Postgres** | Serverless Postgres, branches for previews, available through the Vercel Marketplace, and nothing ties you to Vercel | Free: 0.5 GB storage, autosuspend. Paid plans start around $19/mo |
| Media storage | **Cloudinary** | Already allow-listed. Signed **direct browser uploads**, so large videos never pass through a serverless function. Automatic video posters, adaptive streaming, image transforms | Free: 25 credits/mo (≈25 GB storage or bandwidth combined). Videos use the quota fastest |
| Email | **Resend** | A simple REST API (no SDK needed). The free tier covers a portfolio easily | Free: 3,000 emails/mo, 100/day. A verified domain is needed to send *from* your own domain |
| Hosting | **Vercel Hobby** for now | Zero config for Next 16, and you already use it | Free, but the Hobby terms are non-commercial. Move to Pro ($20/mo) or self-host on a VPS if you take paid client work through the site. Nothing in the code is Vercel-specific |

Local development needs **no accounts**. It uses your local Postgres 16, and media and email have dev fallbacks that are clearly labelled and refuse to run in production.

**New dependencies (all justified):** `drizzle-orm`, `postgres`, `zod`, `server-only`; dev: `drizzle-kit`, `tsx` (for the seed and admin CLI scripts). Cloudinary signing and Resend use `fetch` plus `node:crypto`, so there are no SDKs.

## 9. Implementation phases

Work happens on a `redesign` branch with one commit per coherent step. `npm run check` must pass at every commit.

1. **Foundation:** tokens for both themes, typography, theme switcher, a single render tree, layout primitives, fixes for the 404s, and removal of the sample media.
2. **Data layer:** schema, migrations, seed, DAL. Public pages read from the DB.
3. **Public site:** home, about, work, studio, contact, CV, 404/error pages, SEO updates (per-route metadata, JSON-LD for `CreativeWork` and `SoftwareSourceCode`, sitemap from the DB).
4. **Auth:** admin CLI, login, sessions, proxy, rate limiting.
5. **Admin:** overview, CRUD and reorder for projects, studio, skills, profile, CV and inbox, plus uploads.
6. **QA:** every route, form, CRUD path and theme at 375, 768, 1024, 1440 and 1920 widths. Keyboard and axe passes. Lighthouse.
7. **Docs:** README, `.env.example`, setup guides, and the remaining-items checklist.

## 10. What I need from you

**Blocking (before phase 2 goes beyond local dev):** the four service decisions in §8.

**Content checklist (not blocking; everything can be filled in from the admin later):**
- [ ] CV PDF
- [ ] Creative work: video files or YouTube/Vimeo/TikTok/Instagram links, cover images, titles, short descriptions, tools used, and which category each belongs to
- [ ] Jangora: public repo URL? Demo URL? Is "AI-assisted" accurate today?
- [ ] PharmaCompare: the correct tech stack (PHP/MySQL, or Node.js/MySQL?)
- [ ] Any other dev projects you want listed
- [ ] Display name: "Neba Precious" or "Neba Precious Ngeh"?
- [ ] Longer bio, your journey so far, what you're open to (full-time, freelance, remote)
- [ ] Any other socials (Instagram, TikTok, YouTube, Behance for Preelite?)
- [ ] Custom domain, if you have one
- [ ] To use local Postgres in dev, run once: `sudo -u postgres createuser --createdb neba-precious`
