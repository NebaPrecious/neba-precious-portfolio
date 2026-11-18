import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import EnquiryActions from "@/components/admin/EnquiryActions";
import { getEnquiry } from "@/server/dal/admin";
import { enquiryTypes } from "@/lib/validation";

/** Session-gated admin page: allowed to block on navigation. */
export const instant = false;

export const metadata = { title: "Message" };

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Douala", dateStyle: "full", timeStyle: "short" });

export default async function EnquiryPage({ params }: PageProps<"/admin/inbox/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const e = await getEnquiry(id);
  if (!e) notFound();

  const replyHref = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <Link className="admin-crumb" href="/admin/inbox">
            <ArrowLeft size={13} aria-hidden="true" /> Inbox
          </Link>
          <h1>{e.subject}</h1>
        </div>
        <EnquiryActions id={e.id} status={e.status} replyHref={replyHref} />
      </div>

      <div className="admin-grid-2">
        <article className="panel">
          <p className="message-body">{e.message}</p>
        </article>
        <aside className="panel">
          <dl className="kv">
            <dt>From</dt>
            <dd>{e.name}</dd>
            <dt>Email</dt>
            <dd>
              <a className="link-arrow" href={`mailto:${e.email}`}>
                {e.email}
              </a>
            </dd>
            <dt>Type</dt>
            <dd>{enquiryTypes.find((t) => t.value === e.type)?.label}</dd>
            <dt>Received</dt>
            <dd>{dateFmt.format(e.createdAt)}</dd>
            <dt>Status</dt>
            <dd style={{ textTransform: "capitalize" }}>{e.status === "new" ? "Unread" : e.status}</dd>
            <dt>Email copy</dt>
            <dd>{e.emailDelivered ? "Delivered to your inbox" : "Not emailed (stored here only)"}</dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
