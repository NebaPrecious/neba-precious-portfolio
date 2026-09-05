# Local Development

This project is a Next.js 16 portfolio app using the App Router, React 19, TypeScript, ESLint, Tailwind CSS 4, Motion, Lucide React, and React Icons.

## Confirmed local toolchain

Verified on this machine:

- Node.js: v24.19.0
- npm: 11.17.0
- Next.js: 16.3.4

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

Then open `http://localhost:3005`.

## Notes

- Next.js 16 uses Turbopack by default for `next dev` and `next build`.
- Dependencies have been updated to Next.js 16.3.4 / eslint-config-next 16.3.4 so `npm audit` reports zero vulnerabilities.
