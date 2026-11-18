"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Film, Trash2 } from "lucide-react";
import { ConfirmButton } from "./ui";
import { deleteMedia, updateMediaAlt } from "@/server/actions/admin/media";
import { formatBytes } from "./upload";
import type { Media } from "@/lib/types";

type Item = Media & { usage: number; provider: "cloudinary" | "local" };

function AltEditor({ item }: { item: Item }) {
  const [alt, setAlt] = useState(item.alt);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (item.kind === "document") return null;
  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await updateMediaAlt(item.id, alt);
          setSaved("error" in r ? r.error : "Saved");
        });
      }}
    >
      <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} placeholder="Describe the image for screen readers" aria-label="Alt text" />
      <button type="submit" className="tool" disabled={pending}>
        Save
      </button>
      {saved && (
        <span className="field-hint" role="status">
          {saved}
        </span>
      )}
    </form>
  );
}

export default function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unused">("all");
  const shown = filter === "unused" ? items.filter((i) => i.usage === 0) : items;

  return (
    <>
      <div className="tabs" role="group" aria-label="Filter media">
        <button type="button" className="chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="count">{items.length}</span>
        </button>
        <button type="button" className="chip" aria-pressed={filter === "unused"} onClick={() => setFilter("unused")}>
          Unused <span className="count">{items.filter((i) => i.usage === 0).length}</span>
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <h3>{filter === "unused" ? "No unused files" : "No media yet"}</h3>
          <p>Files you upload from project, studio, profile or CV forms appear here.</p>
        </div>
      ) : (
        <div className="rows">
          {shown.map((m) => (
            <div className="row" key={m.id}>
              <div className="row-thumb">
                {m.kind === "image" || m.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img src={m.kind === "image" ? m.url : (m.posterUrl as string)} alt="" />
                ) : m.kind === "video" ? (
                  <Film size={18} aria-hidden="true" />
                ) : (
                  <FileText size={18} aria-hidden="true" />
                )}
              </div>
              <div className="row-main">
                <div className="row-title">
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    {m.originalFilename ?? m.url.split("/").pop()}
                  </a>
                  <span className="badge badge-muted">{m.kind}</span>
                  {m.usage === 0 ? <span className="badge badge-warning">Unused</span> : <span className="badge">Used {m.usage}×</span>}
                  {m.provider === "local" && <span className="badge badge-muted">local</span>}
                </div>
                <p className="row-sub">
                  {[m.width && m.height ? `${m.width}×${m.height}` : null, formatBytes(m.bytes), m.durationSeconds ? `${Math.round(m.durationSeconds)}s` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <AltEditor item={m} />
              </div>
              <div className="row-actions">
                <ConfirmButton
                  action={async () => {
                    const r = await deleteMedia(m.id);
                    if ("ok" in r) router.refresh();
                    return r;
                  }}
                  title="Delete this file?"
                  description={
                    m.provider === "cloudinary"
                      ? "It will be permanently deleted from Cloudinary. This can't be undone."
                      : "The record is removed. Files committed to the repository stay on disk."
                  }
                  ariaLabel="Delete file"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
