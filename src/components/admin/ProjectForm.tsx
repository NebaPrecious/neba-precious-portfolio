"use client";

import Link from "next/link";
import { useState } from "react";
import MediaField, { GalleryField } from "./MediaField";
import { CharCount, SubmitButton, useFormAction } from "./ui";
import { saveProject } from "@/server/actions/admin/projects";
import { slugify } from "@/lib/validation";
import type { Media } from "@/lib/types";

export type ProjectFormValues = {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  body: string;
  stage: string;
  role: string;
  confidentialityNote: string;
  categoryId: string | null;
  cover: Media | null;
  gallery: Media[];
  technologies: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  year: number | null;
  featured: boolean;
  status: "draft" | "published";
};

type Field =
  | "name"
  | "slug"
  | "summary"
  | "body"
  | "stage"
  | "role"
  | "confidentialityNote"
  | "categoryId"
  | "coverId"
  | "repoUrl"
  | "demoUrl"
  | "year"
  | "status"
  | "technologies";

export default function ProjectForm({
  values,
  categories,
}: {
  values: ProjectFormValues;
  categories: { id: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useFormAction(saveProject, { status: "idle" });
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.id));
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
                <label htmlFor="name">Project name</label>
                <input
                  id="name"
                  name="name"
                  defaultValue={values.name}
                  maxLength={120}
                  required
                  {...invalid("name")}
                  onChange={(e) => {
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
                {err("name")}
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
                <p className="field-hint mono">/work/{slug || "…"}</p>
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
              <label htmlFor="body">Longer write-up (optional)</label>
              <textarea id="body" name="body" defaultValue={values.body} rows={6} maxLength={10000} {...invalid("body")} />
              <p className="field-hint">Plain text. Leave a blank line between paragraphs.</p>
              {err("body")}
            </div>

            <div className="field">
              <label htmlFor="technologies">Technologies</label>
              <input
                id="technologies"
                name="technologies"
                defaultValue={values.technologies.join(", ")}
                placeholder="Angular, NestJS, PostgreSQL"
              />
              <p className="field-hint">Comma-separated, in the order you want them shown.</p>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="repoUrl">Repository URL</label>
                <input id="repoUrl" name="repoUrl" type="url" inputMode="url" defaultValue={values.repoUrl ?? ""} placeholder="https://github.com/…" {...invalid("repoUrl")} />
                {err("repoUrl")}
              </div>
              <div className="field">
                <label htmlFor="demoUrl">Live demo URL</label>
                <input id="demoUrl" name="demoUrl" type="url" inputMode="url" defaultValue={values.demoUrl ?? ""} placeholder="https://…" {...invalid("demoUrl")} />
                {err("demoUrl")}
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="stage">Stage</label>
                <input id="stage" name="stage" defaultValue={values.stage} maxLength={80} placeholder="In development, Shipped, Team project…" />
              </div>
              <div className="field">
                <label htmlFor="role">Your role</label>
                <input id="role" name="role" defaultValue={values.role} maxLength={120} placeholder="Full-stack developer" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="confidentialityNote">Confidentiality note (optional)</label>
              <textarea id="confidentialityNote" name="confidentialityNote" defaultValue={values.confidentialityNote} rows={3} maxLength={600} />
              <p className="field-hint">For company-owned or private work — explains why only a preview is shown.</p>
            </div>
          </section>

          <section className="panel">
            <GalleryField name="galleryIds" initial={values.gallery} label="Screenshots" />
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
              <label htmlFor="categoryId">Category</label>
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
              <label htmlFor="year">Year</label>
              <input id="year" name="year" inputMode="numeric" defaultValue={values.year ?? ""} placeholder="2026" {...invalid("year")} />
              {err("year")}
            </div>
          </section>

          <section className="panel">
            <MediaField name="coverId" kind="image" label="Cover image" initial={values.cover} error={errors.coverId} help="Used for social sharing and when there are no screenshots." />
          </section>
        </aside>
      </div>

      <div className="form-footer">
        <Link className="btn btn-outline btn-sm" href="/admin/projects">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{values.id ? "Save changes" : "Create project"}</SubmitButton>
      </div>
    </form>
  );
}
