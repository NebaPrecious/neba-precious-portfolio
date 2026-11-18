"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import { getDummyHash, verifyPassword } from "@/server/auth/password";
import { clientIp, rateLimit } from "@/server/security";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(512),
});

const GENERIC_ERROR = "Incorrect email or password.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "").slice(0, 254);
  if (!parsed.success) return { error: GENERIC_ERROR, email };

  // Throttle by IP and by account to slow both spraying and targeted guessing.
  const ip = await clientIp();
  const [byIp, byAccount] = await Promise.all([
    rateLimit("login-ip", ip, 20, 15 * 60 * 1000),
    rateLimit("login-account", parsed.data.email, 6, 15 * 60 * 1000),
  ]);
  if (!byIp.allowed || !byAccount.allowed) {
    const ms = Math.max(byIp.retryAfterMs, byAccount.retryAfterMs);
    const minutes = Math.max(1, Math.ceil(ms / 60000));
    return { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, email };
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, parsed.data.email));

  // Always run a hash comparison so timing doesn't reveal which emails exist.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) return { error: GENERIC_ERROR, email };

  await createSession(user.id);
  await db.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, user.id));

  redirect("/admin");
}

export async function logout() {
  if (await getSession()) {
    await destroySession();
  }
  redirect("/admin/login");
}
