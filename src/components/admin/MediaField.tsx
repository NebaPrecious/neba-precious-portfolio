"use client";

import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImagePlus, Library, Trash2, Upload, X } from "lucide-react";
import { listMediaForPicker } from "@/server/actions/admin/media";
import { ACCEPT, formatBytes, uploadFile, type Kind } from "./upload";
import type { Media } from "@/lib/types";

function Preview({ media, kind }: { media: Media | null; kind: Kind }) {
  if (!media) {
    return <div className="media-preview">{kind === "document" ? "No file" : "No media selected"}</div>;
  }
  if (media.kind === "document") {
    return (
      <div className="media-preview media-preview-doc">
        <span style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--text)" }}>
          <FileText size={18} aria-hidden="true" /> {media.originalFilename ?? "Document"}
        </span>
        <span className="mono">{formatBytes(media.bytes)}</span>
        <a className="link-arrow" href={media.url} target="_blank" rel="noopener noreferrer">
          Open file
        </a>
      </div>
    );
  }
  if (media.kind === "video") {
    return (
      <div className="media-preview">
        <video src={media.url} poster={media.posterUrl ?? undefined} controls preload="metadata" muted playsInline />
      </div>
    );
  }
  return (
    <div className="media-preview">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary sizes */}
      <img src={media.url} alt={media.alt || "Selected image"} />
    </div>
  );
}

/** Lets the admin pick an existing upload of the given kind. */
function MediaPicker({ kind, onPick }: { kind: Kind; onPick: (m: Media) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<(Media & { usage: number })[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    ref.current?.showModal();
    setError(null);
    try {
      setItems(await listMediaForPicker(kind));
    } catch {
      setError("Could not load the library.");
    }
  }

  return (
    <>
      <button type="button" className="tool" onClick={open}>
        <Library size={14} aria-hidden="true" /> Library
      </button>
      <dialog ref={ref} className="dialog dialog-wide" aria-label="Choose from library">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <h2>Choose from library</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => ref.current?.close()}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {error && <p className="field-error">{error}</p>}
        {items === null && !error && <p className="muted">Loading…</p>}
        {items?.length === 0 && <p className="muted">Nothing uploaded yet.</p>}
        {items && items.length > 0 && (
          <div className="picker-grid">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className="picker-item"
                onClick={() => {
                  onPick(m);
                  ref.current?.close();
                }}
              >
                <Preview media={m.kind === "video" ? { ...m, url: m.posterUrl ?? m.url, kind: m.posterUrl ? "image" : "video" } : m} kind={kind} />
                <span className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.originalFilename ?? m.alt ?? "Untitled"}
                </span>
              </button>
            ))}
          </div>
        )}
      </dialog>
    </>
  );
}

function useUploader(kind: Kind, onDone: (m: Media) => void) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const media = await uploadFile(file, kind, setProgress);
      onDone(media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }
  return { progress, error, handle };
}

const hints: Record<Kind, string> = {
  image: "JPG, PNG, WebP, AVIF or GIF · max 10 MB",
  video: "MP4, MOV or WebM · max 100 MB",
  document: "PDF · max 10 MB",
};

/** Single media value stored in a hidden input (`name`) as the media id. */
export default function MediaField({
  name,
  kind,
  label,
  initial,
  help,
  error,
  onChange,
}: {
  name: string;
  kind: Kind;
  label: string;
  initial: Media | null;
  help?: string;
  error?: string;
  onChange?: (m: Media | null) => void;
}) {
  const id = useId();
  const [media, setMedia] = useState<Media | null>(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const set = (m: Media | null) => {
    setMedia(m);
    onChange?.(m);
  };
  const { progress, error: uploadError, handle } = useUploader(kind, set);

  return (
    <div className="field media-field">
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <Preview media={media} kind={kind} />
      {progress !== null && (
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="media-actions">
        <button type="button" className="tool" onClick={() => inputRef.current?.click()} disabled={progress !== null}>
          <Upload size={14} aria-hidden="true" /> {media ? "Replace" : "Upload"}
        </button>
        <MediaPicker kind={kind} onPick={set} />
        {media && (
          <button type="button" className="tool tool-danger" onClick={() => set(null)}>
            <Trash2 size={14} aria-hidden="true" /> Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        hidden
        aria-labelledby={`${id}-label`}
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input type="hidden" name={name} value={media?.id ?? ""} />
      <p className="field-hint">{help ?? hints[kind]}</p>
      {(uploadError || error) && (
        <p className="field-error" role="alert">
          {uploadError ?? error}
        </p>
      )}
    </div>
  );
}

/** Ordered list of images stored as a JSON array of ids in `name`. */
export function GalleryField({ name, initial, label }: { name: string; initial: Media[]; label: string }) {
  const [items, setItems] = useState<Media[]>(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (m: Media) => setItems((list) => (list.some((x) => x.id === m.id) ? list : [...list, m].slice(0, 24)));
  const { progress, error, handle } = useUploader("image", add);

  const move = (i: number, dir: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="field media-field">
      <span className="field-label">{label}</span>
      {items.length > 0 ? (
        <div className="gallery-field">
          {items.map((m, i) => (
            <div className="gallery-item" key={m.id}>
              <Preview media={m} kind="image" />
              <div className="gallery-item-actions">
                <button type="button" className="tool" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                  <ArrowLeft size={13} aria-hidden="true" />
                </button>
                <button type="button" className="tool tool-danger" onClick={() => setItems((l) => l.filter((x) => x.id !== m.id))} aria-label="Remove from gallery">
                  <X size={13} aria-hidden="true" />
                </button>
                <button type="button" className="tool" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later">
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="media-preview" style={{ aspectRatio: "auto", padding: "1.5rem" }}>
          No screenshots yet
        </div>
      )}
      {progress !== null && (
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="media-actions">
        <button type="button" className="tool" onClick={() => inputRef.current?.click()} disabled={progress !== null}>
          <ImagePlus size={14} aria-hidden="true" /> Add screenshot
        </button>
        <MediaPicker kind="image" onPick={add} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.image}
        hidden
        aria-label="Add screenshot"
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input type="hidden" name={name} value={JSON.stringify(items.map((m) => m.id))} />
      <p className="field-hint">Shown in this order on the project page. Phone screenshots are fanned on a plate.</p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
