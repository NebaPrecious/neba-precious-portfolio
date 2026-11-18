import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import RefreshSiteButton from "@/components/admin/RefreshSiteButton";
import { getOverview } from "@/server/dal/admin";
import { getServiceStatus } from "@/server/env";
import { enquiryTypes } from "@/lib/validation";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Overview" };

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li>
      {ok ? (
        <CheckCircle2 className="ok" size={16} aria-label="Done" />
      ) : (
        <AlertTriangle className="todo" size={16} aria-label="Needs attention" />
      )}
      <span>{children}</span>
    </li>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Douala", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function OverviewPage() {
  const data = await getOverview();
  const services = getServiceStatus();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Overview</h1>
          <p>Everything on the public site is managed from here.</p>
        </div>
        <div className="admin-page-actions">
          <Link className="btn btn-sm" href="/admin/projects/new">
            <Plus size={15} aria-hidden="true" /> New project
          </Link>
          <Link className="btn btn-accent btn-sm" href="/admin/studio/new">
            <Plus size={15} aria-hidden="true" /> New studio work
          </Link>
        </div>
      </div>

      <div className="stats">
        <Link className="stat" href="/admin/projects">
          <span className="stat-value">{data.projects.total}</span>
          <span className="stat-label">Development projects</span>
          <span className="stat-sub">{data.projects.published} published</span>
        </Link>
        <Link className="stat" href="/admin/studio">
          <span className="stat-value">{data.creative.total}</span>
          <span className="stat-label">Studio entries</span>
          <span className="stat-sub">{data.creative.published} published</span>
        </Link>
        <Link className="stat" href="/admin/inbox">
          <span className="stat-value">{data.enquiries.unread}</span>
          <span className="stat-label">Unread enquiries</span>
          <span className="stat-sub">{data.enquiries.total} total</span>
        </Link>
        <Link className="stat" href="/admin/media">
          <span className="stat-value">{data.mediaCount}</span>
          <span className="stat-label">Media files</span>
          <span className="stat-sub">images, video &amp; documents</span>
        </Link>
      </div>

      <div className="admin-grid-2">
        <section className="panel" aria-labelledby="recent-title">
          <div className="panel-head">
            <h2 id="recent-title">Recent enquiries</h2>
            <Link className="link-arrow" href="/admin/inbox">
              Open inbox
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="muted">No enquiries yet. Messages from the contact form will appear here.</p>
          ) : (
            <div className="rows">
              {data.recent.map((e) => (
                <div className="row" key={e.id} data-unread={e.status === "new"} style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
                  <div className="row-main">
                    <div className="row-title">
                      <Link href={`/admin/inbox/${e.id}`}>{e.subject}</Link>
                    </div>
                    <p className="row-sub">
                      {e.name} · {enquiryTypes.find((t) => t.value === e.type)?.label}
                    </p>
                  </div>
                  <span className="mono muted" style={{ fontSize: "var(--step--2)" }}>
                    {dateFmt.format(e.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <section className="panel" aria-labelledby="todo-title">
            <div className="panel-head">
              <h2 id="todo-title">Content checklist</h2>
            </div>
            <ul className="checklist">
              <Check ok={data.checklist.hasCv}>
                {data.checklist.hasCv ? "CV uploaded." : <>No CV yet — <Link className="link-arrow" href="/admin/cv">upload a PDF</Link>. Download buttons stay hidden until then.</>}
              </Check>
              <Check ok={data.checklist.hasStudioWork}>
                {data.checklist.hasStudioWork ? "Studio work is published." : <>The studio shows an “in the edit” slate — <Link className="link-arrow" href="/admin/studio/new">add your first piece</Link>.</>}
              </Check>
              <Check ok={data.checklist.projectsWithoutLinks === 0}>
                {data.checklist.projectsWithoutLinks === 0
                  ? "Every published project has a repo or demo link."
                  : `${data.checklist.projectsWithoutLinks} published project(s) have no repository or demo link (fine for private work).`}
              </Check>
              <Check ok={data.checklist.hasOpenTo}>
                {data.checklist.hasOpenTo ? "“Open to” is filled in." : <>Say what you’re open to (freelance, full-time…) in your <Link className="link-arrow" href="/admin/profile">profile</Link>.</>}
              </Check>
            </ul>
          </section>

          <section className="panel" aria-labelledby="services-title">
            <div className="panel-head">
              <h2 id="services-title">Services</h2>
            </div>
            <ul className="checklist">
              <Check ok={services.database}>Database connected.</Check>
              <Check ok={services.media === "cloudinary"}>
                {services.media === "cloudinary"
                  ? "Cloudinary media storage configured."
                  : services.media === "local-dev"
                    ? "Using local dev uploads — configure Cloudinary before deploying."
                    : "Media storage not configured — uploads are disabled."}
              </Check>
              <Check ok={services.email}>
                {services.email
                  ? "Email notifications (Resend) configured."
                  : "Email not configured — enquiries are saved to the inbox only."}
              </Check>
              <Check ok={services.appSecret}>
                {services.appSecret ? "APP_SECRET set." : "APP_SECRET missing — required in production."}
              </Check>
            </ul>
            <RefreshSiteButton />
          </section>
        </div>
      </div>
    </>
  );
}
