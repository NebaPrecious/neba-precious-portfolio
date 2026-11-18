"use client";

import { useEffect } from "react";
import { CheckCheck, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { ActionButton, ConfirmButton } from "./ui";
import { deleteEnquiry, markEnquiryRead, setEnquiryStatus } from "@/server/actions/admin/inbox";

export default function EnquiryActions({
  id,
  status,
  replyHref,
}: {
  id: string;
  status: "new" | "read" | "handled";
  replyHref: string;
}) {
  // Mark as read when actually opened (not on link prefetch).
  useEffect(() => {
    if (status === "new") void markEnquiryRead(id);
  }, [id, status]);

  return (
    <div className="admin-page-actions">
      <a className="btn btn-accent btn-sm" href={replyHref}>
        <Reply size={15} aria-hidden="true" /> Reply by email
      </a>
      {status !== "handled" ? (
        <ActionButton className="btn btn-outline btn-sm" action={() => setEnquiryStatus(id, "handled")}>
          <CheckCheck size={15} aria-hidden="true" /> Mark handled
        </ActionButton>
      ) : (
        <ActionButton className="btn btn-outline btn-sm" action={() => setEnquiryStatus(id, "read")}>
          <MailOpen size={15} aria-hidden="true" /> Reopen
        </ActionButton>
      )}
      <ActionButton className="btn btn-outline btn-sm" action={() => setEnquiryStatus(id, "new")}>
        <Mail size={15} aria-hidden="true" /> Mark unread
      </ActionButton>
      <ConfirmButton
        className="btn btn-outline btn-sm"
        action={() => deleteEnquiry(id)}
        title="Delete this message?"
        description="It will be permanently removed from the inbox. This can't be undone."
      >
        <Trash2 size={15} aria-hidden="true" /> Delete
      </ConfirmButton>
    </div>
  );
}
