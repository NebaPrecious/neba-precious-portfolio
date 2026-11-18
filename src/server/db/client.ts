/**
 * Database client shared by the app and CLI scripts.
 * Deliberately has no `server-only` import so `tsx` scripts can use it;
 * app code should import from `@/server/db` instead.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and configure it (see README → Database).",
    );
  }
  return url;
}

type Db = ReturnType<typeof createDb>;

function createDb() {
  const client = postgres(requireDatabaseUrl(), {
    max: process.env.NODE_ENV === "production" ? 5 : 3,
    // Required for transaction-mode poolers (e.g. Neon's pooled endpoint).
    prepare: false,
    idle_timeout: 20,
  });
  return Object.assign(drizzle(client, { schema, casing: "snake_case" }), { $client: client });
}

const globalForDb = globalThis as unknown as { __portfolioDb?: Db };

/** Lazily created so importing this module never needs a DB at build-analysis time. */
export function getDb(): Db {
  if (!globalForDb.__portfolioDb) {
    globalForDb.__portfolioDb = createDb();
  }
  return globalForDb.__portfolioDb;
}

export { schema };
