/**
 * Password hashing with Node's built-in scrypt (memory-hard, no native deps).
 * Format: scrypt$<N>$<r>$<p>$<salt b64url>$<hash b64url>
 * Shared by the app and the `admin:create` CLI, so no `server-only` import.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 2 ** 16;
const r = 8;
const p = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 256 * 1024 * 1024;

export const PASSWORD_MIN_LENGTH = 12;

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize("NFKC"), salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: MAX_MEM });
  return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, rr, pp, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64url");
  const key = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length, {
    N: Number(n),
    r: Number(rr),
    p: Number(pp),
    maxmem: MAX_MEM,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Used when the email doesn't exist so response time doesn't reveal it. */
let dummyHash: Promise<string> | null = null;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(24).toString("hex"));
  return dummyHash;
}
