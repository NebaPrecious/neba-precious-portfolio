import "server-only";

import { createHash, createHmac, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { getDb, schema } from "@/server/db";
import { getAppSecret } from "@/server/env";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash so stored throttle keys can't be reversed into IPs/emails. */
export function hmacKey(value: string) {
  return createHmac("sha256", getAppSecret()).update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limiter stored in Postgres (no extra infrastructure).
 * Returns whether the action is allowed and when to retry.
 */
export async function rateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const key = hmacKey(`${scope}:${identifier}`);
  const db = getDb();
  const windowInterval = `${Math.ceil(windowMs / 1000)} seconds`;

  const [row] = await db
    .insert(schema.rateLimits)
    .values({ key, count: 1, windowStart: new Date() })
    .onConflictDoUpdate({
      target: schema.rateLimits.key,
      set: {
        count: sql`case when ${schema.rateLimits.windowStart} < now() - ${windowInterval}::interval then 1 else ${schema.rateLimits.count} + 1 end`,
        windowStart: sql`case when ${schema.rateLimits.windowStart} < now() - ${windowInterval}::interval then now() else ${schema.rateLimits.windowStart} end`,
      },
    })
    .returning();

  const elapsed = Date.now() - row.windowStart.getTime();
  return {
    allowed: row.count <= limit,
    retryAfterMs: Math.max(0, windowMs - elapsed),
  };
}

/** Same-origin check for route handlers (Server Actions do this automatically). */
export async function assertSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) throw new Error("Missing origin");
  if (new URL(origin).host !== host) throw new Error("Cross-origin request blocked");
}
