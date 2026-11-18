"use client";

import Link from "next/link";
import { useState } from "react";
import MediaField from "./MediaField";
import { CharCount, SubmitButton, useFormAction } from "./ui";
import { saveCreative } from "@/server/actions/admin/creative";
import { parseVideoUrl } from "@/lib/embed";
import { slugify } from "@/lib/validation";
import type { Media } from "@/lib/types";

export type CreativeFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  categoryId: string | null;
  cover: Media | null;
  video: Media | null;
  externalUrl: string | null;
  aspect: "landscape" | "portrait" | "square";
  tools: string[];
  year: number | null;
  featured: boolean;
  status: "draft" | "published";
};

type Field =
  | "title"
  | "slug"
  | "summary"
  | "body"
  | "categoryId"
  | "coverId"
  | "videoId"
  | "externalUrl"
  | "aspect"
  | "year"
  | "status"
  | "tools";

export default function CreativeForm({
  values,
  categories,
}: {
  values: CreativeFormValues;
  categories: { id: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useFormAction(saveCreative, { status: "idle" });
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.id));
  const [externalUrl, setExternalUrl] = useState(values.externalUrl ?? "");
  const embed = parseVideoUrl(externalUrl);

  const errors: Partial<Record<Field, string>> = state.status === "error" ? (state.fields ?? {}) : {};
  const err = (f: Field) =>
    errors[f] ? (
      <p className="field-error" id={`${f}-error`}>
        {errors[f]}
      </p>
    ) : null;
  const invalid = (f: Field) => ({ "aria-invalid": Boolean(errors[f]), "aria-describedby": errors[f] ? `${f}-error` : undefined });

  return (
    <form onSubmit={onSubmit} className="admin-form" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state.status === "error" && state.message && (
        <div className="form-alert" role="alert">
          {state.message}
        </div>
      )}

      <div className="admin-form-layout">
        <div className="admin-form">
          <section className="panel admin-form">
            <div className="form-row">
              <div className="field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  defaultValue={values.title}
                  maxLength={120}
                  required
                  {...invalid("title")}
                  onChange={(e) => {
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
                {err("title")}
              </div>
              <div className="field">
                <label htmlFor="slug">URL slug</label>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  maxLength={80}
                  required
                  {...invalid("slug")}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                />
                <p className="field-hint mono">/studio/{slug || "…"}</p>
                {err("slug")}
              </div>
            </div>

            <div className="field">
              <label htmlFor="summary">Short description</label>
              <textarea id="summary" name="summary" defaultValue={values.summary} rows={3} maxLength={400} required {...invalid("summary")} />
              <CharCount targetId="summary" max={400} />
              {err("summary")}
            </div>

            <div className="field">
              <label htmlFor="body">Notes / process (optional)</label>
              <textarea id="body" name="body" defaultValue={values.body} rows={5} maxLength={10000} />
              <p className="field-hint">Plain text. Leave a blank line between paragraphs.</p>
            </div>

            <div className="field">
              <label htmlFor="tools">Tools used</label>
              <input id="tools" name="tools" defaultValue={values.tools.join(", ")} placeholder="CapCut, Canva" />
              <p className="field-hint">Comma-separated.</p>
            </div>

            <div className="field">
              <label htmlFor="externalUrl">External video link (optional)</label>
              <input
                id="externalUrl"
                name="externalUrl"
                type="url"
                inputMode="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=… or a TikTok / Instagram link"
                {...invalid("externalUrl")}
              />
              <p className="field-hint">
                {embed
                  ? embed.provider === "external"
                    ? `Detected ${embed.label} — visitors get a “Watch on ${embed.label}” button over your cover image.`
                    : `Detected ${embed.provider === "youtube" ? "YouTube" : "Vimeo"} — it will play on the page (privacy-enhanced embed).`
                  : "YouTube and Vimeo play inline. Other platforms open in a new tab."}
              </p>
              {err("externalUrl")}
            </div>
          </section>

          <section className="panel">
            <MediaField
              name="videoId"
              kind="video"
              label="Video file (optional)"
              initial={values.video}
              error={errors.videoId}
              help="MP4, MOV or WebM · max 100 MB. Uploaded video takes priority over an external link. A poster frame is generated automatically on Cloudinary."
            />
          </section>
        </div>

        <aside className="admin-form-side">
          <section className="panel admin-form">
            <div className="field">
              <label htmlFor="status">Visibility</label>
              <select id="status" name="status" defaultValue={values.status}>
                <option value="draft">Draft — hidden from the site</option>
                <option value="published">Published — visible</option>
              </select>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="featured" defaultChecked={values.featured} /> Feature on the home page
            </label>
            <div className="field">
              <label htmlFor="categoryId">Discipline</label>
              <select id="categoryId" name="categoryId" defaultValue={values.categoryId ?? ""}>
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="aspect">Frame</label>
              <select id="aspect" name="aspect" defaultValue={values.aspect}>
                <option value="landscape">Landscape 16:9 (YouTube, events)</option>
                <option value="portrait">Portrait 9:16 (Reels, TikTok, Shorts)</option>
                <option value="square">Square 1:1 (feed posts)</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="year">Year</label>
              <input id="year" name="year" inputMode="numeric" defaultValue={values.year ?? ""} placeholder="2026" {...invalid("year")} />
              {err("year")}
            </div>
          </section>

          <section className="panel">
            <MediaField
              name="coverId"
              kind="image"
              label="Cover image"
              initial={values.cover}
              error={errors.coverId}
              help="A frame or thumbnail from this piece of work. Required to publish unless you upload the video."
            />
          </section>
        </aside>
      </div>

      <div className="form-footer">
        <Link className="btn btn-outline btn-sm" href="/admin/studio">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{values.id ? "Save changes" : "Create entry"}</SubmitButton>
      </div>
    </form>
  );
}
