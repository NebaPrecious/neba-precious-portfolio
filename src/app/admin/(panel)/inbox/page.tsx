import Link from "next/link";
import Notice from "@/components/admin/Notice";
import { listEnquiries } from "@/server/dal/admin";
import { getServiceStatus } from "@/server/env";
import { enquiryTypes } from "@/lib/validation";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Inbox" };

const filters = [
  { key: undefined, label: "All" },
  { key: "new", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "handled", label: "Handled" },
] as const;

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Douala", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function InboxPage({ searchParams }: PageProps<"/admin/inbox">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = raw === "new" || raw === "read" || raw === "handled" ? raw : undefined;
  const items = await listEnquiries(status);
  const services = getServiceStatus();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Inbox</h1>
          <p>
            Every contact-form message is stored here first.{" "}
            {services.email ? "A copy is also emailed to you." : "Email notifications are not configured yet."}
          </p>
        </div>
      </div>

      <Notice searchParams={searchParams} />

      <nav className="tabs" aria-label="Filter messages">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/admin/inbox?status=${f.key}` : "/admin/inbox"}
            className="chip"
            aria-current={status === f.key ? "page" : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>{status ? "Nothing here" : "No messages yet"}</h3>
          <p>Enquiries sent from the contact page will appear here.</p>
        </div>
      ) : (
        <div className="rows">
          {items.map((e) => (
            <Link key={e.id} href={`/admin/inbox/${e.id}`} className="row" data-unread={e.status === "new"} style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
              <div className="row-main">
                <div className="row-title">
                  {e.subject}
                  <span className="badge badge-muted">{enquiryTypes.find((t) => t.value === e.type)?.label}</span>
                  {e.status === "handled" && <span className="badge badge-success">Handled</span>}
                </div>
                <p className="row-sub">
                  {e.name} · {e.email} · {e.message.slice(0, 120)}
                </p>
              </div>
              <span className="mono muted" style={{ fontSize: "var(--step--2)", whiteSpace: "nowrap" }}>
                {dateFmt.format(e.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
