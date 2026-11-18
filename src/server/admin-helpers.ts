import "server-only";

import { z } from "zod";

export type FormState<F extends string = string> = {
  status: "idle" | "success" | "error";
  message?: string;
  fields?: Partial<Record<F, string>>;
};

export const idleState: FormState = { status: "idle" };

export function zodFieldErrors<F extends string>(error: z.ZodError): Partial<Record<F, string>> {
  const out: Partial<Record<F, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "") as F;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Postgres unique-violation detection (e.g. duplicate slug). */
export function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/* ---- FormData coercion ---------------------------------------------------- */

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/** "a, b\nc" → ["a","b","c"], trimmed, de-duplicated (case-insensitive). */
export function list(value: string, { max = 30, maxLength = 60 } = {}) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(/[\n,]/)) {
    const item = raw.trim().slice(0, maxLength);
    const key = item.toLowerCase();
    if (item && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
    if (out.length >= max) break;
  }
  return out;
}

export const uuidOrNull = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.uuid({ error: "Invalid selection." }).nullable());

export const yearField = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .pipe(z.number().int().min(1990, { error: "Enter a valid year." }).max(2100, { error: "Enter a valid year." }).nullable());

export function uuidList(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return z.array(z.uuid()).max(24).parse(parsed);
  } catch {
    return [];
  }
}
