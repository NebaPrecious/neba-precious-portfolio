import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, schema } from "@/server/db";
import { randomToken, sha256 } from "@/server/security";

const isProd = process.env.NODE_ENV === "production";

/** `__Host-` binds the cookie to this exact origin over HTTPS (production). */
export const SESSION_COOKIE = isProd ? "__Host-np_session" : "np_session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // sliding window
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // absolute cap
const RENEW_WHEN_LEFT_MS = 6 * 24 * 60 * 60 * 1000;

export type AdminSession = {
  sessionId: string;
  user: { id: string; email: string; name: string };
};

export async function createSession(userId: string) {
  const token = randomToken(32);
  const now = Date.now();
  await getDb()
    .insert(schema.sessions)
    .values({ id: sha256(token), userId, expiresAt: new Date(now + SESSION_TTL_MS) });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  // Opportunistic cleanup of expired sessions.
  await getDb().delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

/**
 * Validates the session cookie against the database. Memoised per request.
 * This — not the proxy — is the real authorization check.
 */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32 || token.length > 128) return null;

  const id = sha256(token);
  const db = getDb();
  const [row] = await db
    .select({ session: schema.sessions, user: schema.adminUsers })
    .from(schema.sessions)
    .innerJoin(schema.adminUsers, eq(schema.sessions.userId, schema.adminUsers.id))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date())));

  if (!row) return null;

  const now = Date.now();
  if (now - row.session.createdAt.getTime() > SESSION_MAX_AGE_MS) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
    return null;
  }

  // Slide the expiry forward while the admin is active.
  if (row.session.expiresAt.getTime() - now < RENEW_WHEN_LEFT_MS) {
    await db
      .update(schema.sessions)
      .set({ expiresAt: new Date(now + SESSION_TTL_MS) })
      .where(eq(schema.sessions.id, id));
  }

  return {
    sessionId: id,
    user: { id: row.user.id, email: row.user.email, name: row.user.name },
  };
});

/** Call at the top of every admin page, server action and route handler. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  }
  store.delete(SESSION_COOKIE);
}
