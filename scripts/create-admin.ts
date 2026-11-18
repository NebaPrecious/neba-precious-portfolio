/**
 * Provision (or reset) the administrator account. There is no public sign-up.
 *
 *   npm run admin:create                 # interactive prompts
 *   npm run admin:create -- --reset      # reset an existing admin's password
 *
 * Non-interactive (CI / first deploy): set ADMIN_EMAIL, ADMIN_NAME and
 * ADMIN_PASSWORD in the environment for this one command only.
 * The password is never printed or logged.
 */
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/server/db/client";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/server/auth/password";

const reset = process.argv.includes("--reset");

function ask(question: string, { hidden = false } = {}): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    muted = hidden;
  });
}

async function main() {
  const db = getDb();

  const email = (process.env.ADMIN_EMAIL ?? (await ask("Admin email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email is required.");

  const [existing] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (existing && !reset) {
    throw new Error(`An admin with ${email} already exists. Use --reset to change the password.`);
  }
  if (!existing && reset) {
    throw new Error(`No admin with ${email} exists.`);
  }

  const name = existing?.name ?? process.env.ADMIN_NAME ?? ((await ask("Display name: ")) || "Admin");

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await ask(`Password (min ${PASSWORD_MIN_LENGTH} chars, hidden): `, { hidden: true });
    const confirm = await ask("Confirm password: ", { hidden: true });
    if (password !== confirm) throw new Error("Passwords do not match.");
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    await db.update(schema.adminUsers).set({ passwordHash }).where(eq(schema.adminUsers.id, existing.id));
    // Sign out every existing session after a reset.
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, existing.id));
    console.log(`Password reset for ${email}. All sessions were signed out.`);
  } else {
    await db.insert(schema.adminUsers).values({ email, name, passwordHash });
    console.log(`Admin ${email} created. Sign in at /admin/login.`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDb().$client.end();
  });
