# Redesign — Status, Decisions & Handover Checklist

Date: 2026-11-18 · Branch: `redesign`

## What was built

| Area | Status |
|---|---|
| Design system "Source & Reel": OKLCH tokens, Paper (light) and Darkroom (dark) themes, screening-room palette, Archivo width axis plus Geist Mono | ✅ |
| Theme switcher: OS default, cookie persistence, no flash before paint, follows OS changes until a choice is made | ✅ |
| Single responsive render tree, replacing the duplicated desktop and mobile trees | ✅ |
| Home: split-exposure hero, two doors, statement, featured work, studio band, capabilities, footer CTA | ✅ |
| `/work` with category filter, `/work/[slug]` with gallery, links and confidentiality note | ✅ |
| `/studio` with discipline filter, hover video previews and an honest empty slate; `/studio/[slug]` viewer (upload, YouTube/Vimeo embed, or external link) | ✅ |
| `/about`, `/contact` (real form), `/cv` (stable redirect), 404 and error pages | ✅ |
| SEO: per-route metadata and canonicals, OG image, icons, DB-driven sitemap, robots (admin disallowed), JSON-LD for Person, WebSite, SoftwareApplication and VideoObject | ✅ |
| Postgres plus Drizzle schema, migration, idempotent seed of real content | ✅ |
| Auth: scrypt, DB sessions, proxy gate, `requireAdmin` everywhere, login throttling, CLI provisioning | ✅ |
| Admin: overview, projects, studio, skills, categories, profile, CV, inbox, media library | ✅ |
| Uploads: Cloudinary signed direct upload, plus a dev-only local fallback | ✅ code · ⚠️ Cloudinary path not tested (no account yet) |
| Contact: validation, honeypot, time trap, rate limit, saved to DB, then emailed through Resend | ✅ DB path tested · ⚠️ email path not tested (no key yet) |
| Security: Next 16.3.4 → 16.4.6 to fix a critical `next/og` RCE advisory; production audit shows 0 vulnerabilities | ✅ |

### Verified in the browser (local)

- Admin login, wrong-password rejection, and the redirect for signed-out visitors.
- Studio entry lifecycle: create (slug generated automatically), blocked publish
  without a cover, upload, publish, appears live immediately, unpublish, delete.
- Project reordering, the media library (in-use guard, delete removes the file),
  and the inbox (opening marks it read, handled, delete).
- Contact form: validation messages and focus, successful submission stored in the
  DB.
- No horizontal overflow on any route at 320, 375 and 768 px.
- Dark theme persistence.
- `npm run check` passes (lint, typecheck, production build).

### Not yet verified

- Uploads to Cloudinary and the Resend email delivery. Both need your accounts.
- Real-device testing (iOS Safari, Android Chrome) and a Lighthouse run against the
  deployed site.
- The visual pass on the hidden in-app browser was partial; please review the
  design yourself at `npm run dev`.

## Decisions made on your behalf (all reversible)

- **Accent colour (revised 2026-11-18, your choice):** mint on deep navy. The
  colour lives only in the `--accent` / `--accent-text` tokens in
  `src/styles/tokens.css`. The 3D scene reads those tokens at runtime, so
  changing the token recolours it too.
- **Default theme (your choice):** dark. Light mode is one toggle away and is
  remembered with a cookie.
- **Home experience (your choice):**
  - A full-screen interactive physics playground in the spirit of Bruno Simon:
    letter blocks spelling your name, `</>` pieces, a camera, a play prism and
    marbles. Move the pointer to push them, click or tap to bounce them, or press
    "Toss everything".
  - It's lazy-loaded, pauses when scrolled away, and is replaced by a static
    block composition for reduced-motion, low-power or no-WebGL visitors.
  - Below it is a layout in the spirit of Brittany Chiang: a sticky identity
    column, scroll-tracking nav lines, hover cards that dim their neighbours,
    mint pills and a cursor spotlight.
- **Studio** pages use a dark "screening room" palette in both themes, following
  the cinema convention.
- **`/creatives` → `/studio`** with a permanent redirect, so old links keep working.
- **Blog / journal deferred.** With no posts yet, an empty journal would weaken the
  site. It can be added later as a new table and route without touching existing
  data.
- **Removed** the Blender sample videos and generated placeholder "flyers" that sat
  on `/creatives` as if they were your work.
- **PharmaCompare stack:** the old site disagreed with itself. The rendered version
  (Angular, Ionic, Node.js, MySQL, REST APIs) was kept. Correct it in Admin →
  Projects.
- **Display name** is "Neba Precious"; "Neba Precious Ngeh" is kept as the full
  name in structured data and the footer. Change it in Admin → Profile.

## Bruno Simon-style play on every page (added 2026-11-18)

Each main page opens on its own interactive physics "toy box". They all share one
engine (`src/components/play/Playground.tsx`) with a different scene per page:

| Page | Blocks | Props |
| --- | --- | --- |
| Home | NEBA + PRECIOUS | `</>`, camera, play prism, marbles |
| Work | CODE + DEVPRE_ELITE | `</>` ×2, marbles |
| Studio | REEL + ACTION (on a dark screen) | camera, clapperboard, film reels, play prisms |
| About | HELLO | camera, `</>`, play prism, marbles |
| Contact | SAY + HI! | envelopes, marbles |
| 404 | 404 + OOPS | film reel, play prism, marbles |

Project plates and studio cards also tilt in 3D under the pointer, with a glare.
The studio grid is now a masonry layout so 16:9, 9:16 and 1:1 pieces pack
together.


## What I need from you

### Accounts and keys (needed before deploying)

- [ ] **Neon:** create a project and send the pooled `DATABASE_URL` to Vercel env.
- [ ] **Cloudinary:** cloud name, API key and secret. Enable PDF delivery (see
  README).
- [ ] **Resend:** API key, plus the address that should receive enquiries.
- [ ] **APP_SECRET:** generate one for production (command in `.env.example`).
- [ ] Run `npm run admin:create` against the production database with your own
  email and password.
- [ ] Custom domain, if you have one, then set `NEXT_PUBLIC_SITE_URL`.

### Content (all editable in the admin)

- [ ] **CV PDF:** Admin → CV.
- [ ] **Studio work:** your own videos (MP4, MOV or WebM up to 100 MB) or
  YouTube/Vimeo links, plus a cover frame, title, short description, tools and
  discipline for each.
- [ ] **Jangora:** public repo or demo URL? Is "AI-assisted" accurate today?
- [ ] **PharmaCompare:** confirm the tech stack.
- [ ] **Other projects** you want listed.
- [ ] **"Open to"** (freelance, full-time, remote…) and a fuller story for the About
  page.
- [ ] **Other socials,** for example Instagram, TikTok or YouTube for Preelite.

### Housekeeping

- [ ] Delete the local dev admin (`admin@portfolio.test`) if you ever point local
  development at production. It exists only in your local database.
- [ ] Review and commit the `redesign` branch. Nothing has been committed yet.
