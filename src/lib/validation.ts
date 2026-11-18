import { z } from "zod";

/* ---- Contact ------------------------------------------------------------- */

export const enquiryTypes = [
  { value: "software", label: "Software development" },
  { value: "website", label: "Website or application" },
  { value: "video_editing", label: "Video editing" },
  { value: "videography", label: "Videography" },
  { value: "collaboration", label: "Creative collaboration" },
  { value: "employment", label: "Employment opportunity" },
  { value: "general", label: "General enquiry" },
] as const;

export type EnquiryTypeValue = (typeof enquiryTypes)[number]["value"];

const enquiryTypeValues = enquiryTypes.map((t) => t.value) as [EnquiryTypeValue, ...EnquiryTypeValue[]];

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Please enter your name." })
    .max(120, { error: "That name is too long." }),
  email: z
    .string()
    .trim()
    .max(254, { error: "That email address is too long." })
    .pipe(z.email({ error: "Please enter a valid email address." })),
  subject: z
    .string()
    .trim()
    .min(3, { error: "Please add a short subject." })
    .max(160, { error: "Please keep the subject under 160 characters." }),
  type: z.enum(enquiryTypeValues, { error: "Please choose the type of enquiry." }),
  message: z
    .string()
    .trim()
    .min(20, { error: "Please write at least 20 characters so I can help." })
    .max(5000, { error: "Please keep the message under 5,000 characters." }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function fieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const out: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/* ---- Shared helpers ------------------------------------------------------ */

export const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .transform((v) => (v === "" ? null : v))
  .pipe(z.url({ protocol: /^https?$/, error: "Enter a full URL starting with https://" }).nullable());

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "A slug is required." })
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Use lowercase letters, numbers and hyphens only." });

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
