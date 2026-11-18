import "server-only";

import { getMailConfig } from "@/server/env";
import { enquiryTypes } from "@/lib/validation";
import type { Enquiry } from "@/server/db/schema";

/**
 * Sends an enquiry notification through Resend's REST API.
 * Returns true only when Resend accepted the message.
 */
export async function sendEnquiryNotification(enquiry: Enquiry): Promise<boolean> {
  const config = getMailConfig();
  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[mail] Email not configured — enquiry ${enquiry.id} saved to the admin inbox only.`);
    }
    return false;
  }

  const typeLabel = enquiryTypes.find((t) => t.value === enquiry.type)?.label ?? enquiry.type;
  const text = [
    `New enquiry from your portfolio`,
    ``,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Type: ${typeLabel}`,
    `Subject: ${enquiry.subject}`,
    ``,
    enquiry.message,
    ``,
    `—`,
    `Reply directly to this email to respond. Manage it in /admin/inbox.`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `enquiry-${enquiry.id}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: enquiry.email,
        subject: `[Portfolio] ${typeLabel}: ${enquiry.subject}`.slice(0, 200),
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Log status only — never the visitor's message or address.
      console.error(`[mail] Resend rejected enquiry ${enquiry.id}: HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch {
    console.error(`[mail] Resend request failed for enquiry ${enquiry.id}`);
    return false;
  }
}
