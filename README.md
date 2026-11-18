# Neba Precious — Portfolio

Personal site of **Neba Precious**: software engineer (**Dev Pre_elite**) and visual
creative (**Preelite Visual Creatives**), based in Douala, Cameroon. It has a public
site and a private admin dashboard ("The Desk") for managing every piece of content
without touching code.

- **Public site:** Home, Work (`/work`, `/work/[slug]`), Studio (`/studio`,
  `/studio/[slug]`), About, Contact, and a stable CV link (`/cv`).
- **Admin:** `/admin`. Manage projects, studio work, skills, profile, CV, the
  enquiry inbox and the media library.

Design direction, audit and decisions are recorded in [`docs/redesign/`](docs/redesign/).

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript |
| Styling | Hand-written CSS with OKLCH custom properties (`src/styles/*`); Tailwind 4 is only used for its preflight reset |
| Type | Archivo (variable, width axis) + Geist Mono via `next/font` |
| Motion | CSS animations, `motion` for the menu, View Transitions for the theme switch, a cursor spotlight; everything respects `prefers-reduced-motion` |
| 3D | three.js, `@react-three/fiber`, `@react-three/drei` and `@react-three/rapier` (physics) for the home playground. It's lazy-loaded on capable devices only |
| Data | PostgreSQL · Drizzle ORM · drizzle-kit migrations |
| Validation | Zod (server-side on every action) |
| Auth | In-house: scrypt passwords, database sessions, `proxy.ts` gate and a DAL `requireAdmin()` check |
| Media | Cloudinary (signed direct browser uploads) |
| Email | Resend REST API |
| Hosting | Vercel (Hobby) is the planned target. Nothing in the code is Vercel-specific |

## Deploying to production

Follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). It walks through Neon, Cloudinary, Resend and Vercel step by step.

## Local setup

Requirements: Node 24 (`nvm use 24`), npm, and PostgreSQL 14 or newer.

```bash
npm install
cp .env.example .env.local      # then edit DATABASE_URL and APP_SECRET
npm run db:migrate              # create tables
npm run db:seed                 # load the real portfolio content (idempotent)
npm run admin:create            # create your admin login (interactive)
npm run dev                     # http://localhost:3005
```

### Local database options

- **Use the system Postgres:** create a role once with
  `sudo -u postgres createuser --createdb $USER`, then `createdb portfolio` and set
  `DATABASE_URL=postgres:///portfolio`.
- **A private user-space cluster (no sudo).** This is what the original setup used,
  on port 54329:
  ```bash
  PGBIN=/usr/lib/postgresql/16/bin; D=~/.local/share/neba-portfolio-pg
  $PGBIN/initdb -D $D -U portfolio --auth=trust
  $PGBIN/pg_ctl -D $D -o "-p 54329 -k /tmp -c listen_addresses=localhost" -l $D/server.log start
  $PGBIN/createdb -h localhost -p 54329 -U portfolio portfolio
  # DATABASE_URL=postgres://portfolio@localhost:54329/portfolio
  ```
  Stop it with `pg_ctl -D ~/.local/share/neba-portfolio-pg stop`.

Without Cloudinary keys, uploads in development are saved to `public/uploads/dev`
(gitignored). That fallback is **disabled in production**. Without Resend keys,
enquiries are saved to the inbox only.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3005 |
| `npm run check` | lint → typecheck → production build (run before committing) |
| `npm run db:generate` | Create a SQL migration after editing `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Insert the original real content; never overwrites existing rows |
| `npm run db:studio` | Drizzle Studio (DB browser) |
| `npm run admin:create` | Create the admin account (`-- --reset` changes the password and signs out every session) |

## Admin account

There is no public sign-up. Create the account from a terminal that can reach the
database:

```bash
npm run admin:create
```

For a first production deploy, run it locally with production's `DATABASE_URL`, or
set `ADMIN_EMAIL`, `ADMIN_NAME` and `ADMIN_PASSWORD` for that one command. Passwords
need at least 12 characters and are never printed.

Security model:

- Passwords are hashed with scrypt (N=2¹⁶).
- Sessions are random 256-bit tokens. The database stores only their SHA-256.
- The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` and `__Host-` prefixed in
  production.
- Sessions slide over 7 days with a 30-day absolute cap.
- Login is throttled per IP (20 per 15 minutes) and per account (6 per 15 minutes),
  with generic error messages and constant-time comparisons.
- Every admin page, server action and route handler calls `requireAdmin()`.
  `proxy.ts` is only an early redirect.

## Media storage (Cloudinary)

1. Create a free account at cloudinary.com. From **Settings → API Keys**, copy the
   cloud name, API key and secret into `CLOUDINARY_*`.
2. To serve the CV PDF, turn on **Settings → Security → "Allow delivery of PDF and
   ZIP files"**.
3. Uploads go straight from the browser to Cloudinary with a server-signed request,
   so large videos never pass through a serverless function. The server checks
   Cloudinary's response signature before recording a file.
4. Limits: images 10 MB, video 100 MB (the free-plan cap), PDF 10 MB.
5. Video posters and automatic quality are generated by Cloudinary.

Deleting from **Admin → Media** removes the file from Cloudinary as well. Files still
in use cannot be deleted.

## Email (Resend)

1. Create an account at resend.com and create an API key → `RESEND_API_KEY`.
2. Set `CONTACT_TO_EMAIL` to where you want notifications delivered.
3. Optional: verify your domain in Resend and set `CONTACT_FROM_EMAIL` to an address
   on it. The default `onboarding@resend.dev` only delivers to your Resend account's
   own email.

Every enquiry is written to the database **before** the email is attempted. If
delivery fails, nothing is lost and the inbox shows "Not emailed". Spam defences are
a honeypot field, a minimum time-to-fill, and 5 messages per hour per IP.

## Deploying (Vercel + Neon)

1. Create a Neon project (free tier) and copy the **pooled** connection string →
   `DATABASE_URL`.
2. Run the migrations against it: `DATABASE_URL=… npm run db:migrate`, then
   `npm run db:seed` and `npm run admin:create`.
3. Import the GitHub repo in Vercel and set every variable from `.env.example`.
   `NEXT_PUBLIC_SITE_URL` must be the production URL.
4. Deploy. The build prerenders public pages from the database, so `DATABASE_URL`
   must be available at build time.

Vercel Hobby is free but limited to non-commercial use. Move to Pro, or self-host
(`npm run build && npm start` on Node 24 with Postgres), before selling services
through the site.

**Backups:** Neon keeps a short point-in-time restore window. The length depends on
your plan; check it in the Neon console. For long-term backups, run a periodic
`pg_dump "$DATABASE_URL" > backup.sql`.
Cloudinary keeps your originals.

## Project structure

```
src/
  app/(site)/        public pages (shared header/footer layout)
  app/admin/         login + (panel) dashboard pages
  app/api/admin/     dev-only local upload endpoint
  app/cv/            stable /cv redirect
  components/        site/, home/, work/, studio/, contact/, admin/, media/
  server/            db/ (schema, client), dal/ (cached public + admin reads),
                     actions/ (server actions), auth/, media.ts, mail.ts, env.ts
  styles/            tokens, base, components, page and admin stylesheets
drizzle/             SQL migrations
scripts/             seed.ts, create-admin.ts
```

Public reads use `'use cache'` with tags (`profile`, `projects`, `creative`,
`skills`, `categories`). Admin mutations call `updateTag()`, so the live site updates
as soon as you save.
