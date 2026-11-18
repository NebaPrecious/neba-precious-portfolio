# Going live — step by step

Target: **Vercel (Hobby)**, **Neon Postgres**, **Cloudinary** (media) and **Resend**
(email). Every account below has a free tier and none needs a card to start. Plan for
about an hour.

> Keep every key out of git. `.env.local` is gitignored; production values go only
> into Vercel → Project → Settings → Environment Variables.

---

## 1. Commit and push the code

```bash
git add -A
git commit -m "Portfolio redesign: 3D playground, admin dashboard, full-stack backend"
git push -u origin redesign
```

Open a pull request into `main` on GitHub and merge it, or deploy the `redesign`
branch directly in step 5.


## 2. Database: Neon (about 5 minutes)

1. Sign up at neon.tech and create a project, choosing the region closest to your
   visitors.
2. Copy **two** connection strings from the dashboard:
   - **Pooled** (the host contains `-pooler`): this becomes `DATABASE_URL`.
   - **Direct** (no `-pooler`): this becomes `DIRECT_DATABASE_URL`, used only for
     migrations.
3. From your computer, create the tables, load your content and create your login:

```bash
DATABASE_URL="<pooled>" DIRECT_DATABASE_URL="<direct>" npm run db:migrate
DATABASE_URL="<pooled>" npm run db:seed
DATABASE_URL="<pooled>" npm run admin:create
```

Use your real email and a strong password (12+ characters) for `admin:create`. That
is your production login.

## 3. Media: Cloudinary (about 5 minutes)

1. Sign up at cloudinary.com, then open **Settings → API Keys**.
2. Note the **Cloud name**, **API key** and **API secret**.
3. Go to **Settings → Security** and turn on **"Allow delivery of PDF and ZIP
   files"**. Your CV needs this.

## 4. Email: Resend (about 5 minutes)

1. Sign up at resend.com and create an **API key**.
2. Decide where enquiries should arrive (`CONTACT_TO_EMAIL`).
3. Leave `CONTACT_FROM_EMAIL` unset for now. The default `onboarding@resend.dev`
   only delivers to the email your Resend account uses. Once you have a domain,
   verify it in Resend and set `CONTACT_FROM_EMAIL="Neba Precious <hello@yourdomain>"`.

## 5. Hosting: Vercel (about 10 minutes)

1. At vercel.com, choose **Add New → Project** and import
   `NebaPrecious/neba-precious-portfolio`.
2. Framework is detected as Next.js. Leave the build command as is (`next build`)
   and keep the default Node version (24).
3. **Before the first deploy**, add these environment variables to
   **Production** and **Preview**:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** string |
| `DIRECT_DATABASE_URL` | Neon **direct** string |
| `APP_SECRET` | output of `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` (your custom domain later) |
| `CLOUDINARY_CLOUD_NAME` | from step 3 |
| `CLOUDINARY_API_KEY` | from step 3 |
| `CLOUDINARY_API_SECRET` | from step 3 |
| `CLOUDINARY_FOLDER` | `portfolio` |
| `RESEND_API_KEY` | from step 4 |
| `CONTACT_TO_EMAIL` | your inbox |

4. Click **Deploy**. The build reads the database to prerender pages, so it fails
   clearly if `DATABASE_URL` is wrong.

## 6. Smoke test the live site (about 10 minutes)

- [ ] Every page loads, and the 3D scenes play on desktop and on your phone.
- [ ] Sign in at `/admin/login` with the account from step 2.
- [ ] Admin → Overview → **Services** shows four green checks (database,
      Cloudinary, email, APP_SECRET).
- [ ] Upload your **CV** (Admin → CV), then open `/cv`. It should download.
- [ ] Add one real **studio piece** with a video and a cover image, and publish it.
      Check `/studio` and its page. The studio orbit appears once 3 or more pieces
      are published.
- [ ] Send yourself a message from `/contact`. It should appear in Admin → Inbox,
      and an email should arrive.
- [ ] Edit your **Profile**: titles, "open to", socials, and a new portrait if
      you've changed it. The About badge uses the portrait automatically.

## 7. Afterwards

- **Custom domain:** Vercel → Settings → Domains. Then update
  `NEXT_PUBLIC_SITE_URL` and redeploy.
- **Search:** submit `https://<domain>/sitemap.xml` in Google Search Console.
- **Backups:** Neon keeps short-term history. Run an occasional
  `pg_dump "$DATABASE_URL" > backup.sql`.
- **Commercial use:** Vercel Hobby is for non-commercial use. Upgrade to Pro before
  you sell services through the site.
- **After editing the database directly** (scripts, SQL), click **Refresh live
  site** in Admin → Overview.

## Where each 3D idea lives

| Page | Interaction | File |
| --- | --- | --- |
| Home, Contact, 404 | Physics toy box (push, bounce, toss) | `src/components/play/Playground.tsx` |
| Work | Real screenshots on floating devices (drag to spin, click to open) | `src/components/play/scenes/Devices.tsx` |
| Studio | Orbit of your covers (drag to spin, click to watch). Uses the toy box until 3+ pieces exist | `src/components/play/scenes/Orbit.tsx` |
| About | Badge with your portrait on a lanyard (grab and fling) | `src/components/play/scenes/Lanyard.tsx` |
| Everywhere | Hand-drawn scribbles, cursor spotlight, tilt cards, secret block rain (type "play") | `src/components/animations/*`, `src/components/site/*` |
