# Local Development

This project is a full-stack Next.js 16 portfolio (App Router, React 19, TypeScript, PostgreSQL + Drizzle). **Database, admin and service setup are documented in `README.md`** — you need a reachable `DATABASE_URL` before `npm run dev` or `npm run build`.

## Confirmed local toolchain

Verified on this machine:

- Node.js: v24.19.0
- npm: 11.17.0
- Next.js: 16.4.6

Next.js 16 requires Node.js 20.9 or newer.

## First-time setup

Use npm because this repo has a `package-lock.json`.

```bash
npm install
```

## Run the local development server

```bash
npm run dev
```

Open:

```text
http://localhost:3005
```

The project dev script is pinned to port 3005:

```bash
npm run dev
```

If port 3005 is already in use, choose another port:

```bash
PORT=3006 npx next dev
```

## Local testing and verification

Run the full local check before committing or deploying:

```bash
npm run check
```

That command runs:

```bash
npm run lint
npm run typecheck
npm run build
```

You can also run each step individually while developing.

## Production preview locally

After a successful build:

```bash
npm run build
npm run start
```

Then open `http://localhost:3000` (`next start` uses port 3000 unless you pass `-p`).

## Notes

- Next.js 16 uses Turbopack by default for `next dev` and `next build`.
- Next.js was upgraded to 16.4.6 (security fixes, including an `ImageResponse` RCE advisory). `npm audit --omit=dev` reports zero vulnerabilities; remaining advisories are in dev-only tooling.
