"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";

const statusSchema = z.enum(["new", "read", "handled"]);

export async function setEnquiryStatus(id: string, status: "new" | "read" | "handled") {
  await requireAdmin();
  const parsedId = z.uuid().parse(id);
  const parsedStatus = statusSchema.parse(status);
  await getDb()
    .update(schema.enquiries)
    .set({ status: parsedStatus, handledAt: parsedStatus === "handled" ? new Date() : null })
    .where(eq(schema.enquiries.id, parsedId));
  refresh();
}

/** Called once when an enquiry is opened (client effect, not on prefetch). */
export async function markEnquiryRead(id: string) {
  await requireAdmin();
  const parsedId = z.uuid().parse(id);
  const db = getDb();
  const [row] = await db.select({ status: schema.enquiries.status }).from(schema.enquiries).where(eq(schema.enquiries.id, parsedId));
  if (row?.status === "new") {
    await db.update(schema.enquiries).set({ status: "read" }).where(eq(schema.enquiries.id, parsedId));
    refresh();
  }
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  await getDb().delete(schema.enquiries).where(eq(schema.enquiries.id, z.uuid().parse(id)));
  redirect("/admin/inbox?notice=deleted");
}
