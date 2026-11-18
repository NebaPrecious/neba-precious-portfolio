"use server";

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb, schema } from "@/server/db";
import { sendEnquiryNotification } from "@/server/mail";
import { clientIp, rateLimit } from "@/server/security";
import { enquirySchema, fieldErrors, type EnquiryInput, type FieldErrors } from "@/lib/validation";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fields?: FieldErrors<EnquiryInput>;
      values?: Partial<Record<keyof EnquiryInput, string>>;
    };

const MIN_FILL_MS = 3000;

export async function submitEnquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    type: String(formData.get("type") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Spam traps: a hidden honeypot field and a minimum time-to-fill.
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("startedAt") ?? 0);
  if (honeypot.length > 0 || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    // Pretend success so bots learn nothing.
    return { status: "success" };
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fields: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const ip = await clientIp();
  const limit = await rateLimit("contact", ip, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterMs / 60000);
    return {
      status: "error",
      message: `You've sent several messages recently. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or email directly.`,
      values: raw,
    };
  }

  try {
    const [enquiry] = await getDb().insert(schema.enquiries).values(parsed.data).returning();

    // Email after the response is sent; the enquiry is already safe in the inbox.
    after(async () => {
      const delivered = await sendEnquiryNotification(enquiry);
      if (delivered) {
        await getDb()
          .update(schema.enquiries)
          .set({ emailDelivered: true })
          .where(eq(schema.enquiries.id, enquiry.id));
      }
    });

    return { status: "success" };
  } catch {
    console.error("[contact] Failed to store enquiry");
    return {
      status: "error",
      message: "Something went wrong on my side and your message was not sent. Please try again or email directly.",
      values: raw,
    };
  }
}
