import { CheckCircle2 } from "lucide-react";

const messages: Record<string, string> = {
  created: "Created. Published items appear on the live site immediately.",
  saved: "Saved. The live site is updated.",
  deleted: "Deleted.",
};

/** Shows a one-line confirmation after a redirecting server action. */
export default async function Notice({ searchParams }: { searchParams: Promise<{ notice?: string | string[] }> }) {
  const { notice } = await searchParams;
  const key = Array.isArray(notice) ? notice[0] : notice;
  if (!key || !messages[key]) return null;
  return (
    <p className="notice-bar" role="status">
      <CheckCircle2 size={16} aria-hidden="true" style={{ color: "var(--success)" }} />
      {messages[key]}
    </p>
  );
}
