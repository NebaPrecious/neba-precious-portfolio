import { defineConfig } from "drizzle-kit";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File is optional; env may come from the shell or the host.
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
