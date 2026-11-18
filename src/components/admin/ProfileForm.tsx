"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import MediaField from "./MediaField";
import { CharCount, SubmitButton, useFormAction } from "./ui";
import { saveProfile } from "@/server/actions/admin/profile";
import type { Media, SocialLink } from "@/lib/types";

export type ProfileValues = {
  displayName: string;
  fullName: string;
  devBrand: string;
  studioBrand: string;
  titles: string[];
  heroIntro: string;
  shortBio: string;
  longBio: string;
  engineeringApproach: string;
  creativeApproach: string;
  openTo: string[];
  location: string;
  email: string;
  availability: "available" | "limited" | "unavailable";
  availabilityNote: string;
  socials: SocialLink[];
  portrait: Media | null;
};

type Field = keyof ProfileValues | "portraitId";

export default function ProfileForm({ values }: { values: ProfileValues }) {
  const { state, pending, onSubmit } = useFormAction(saveProfile, { status: "idle" });
  const [socials, setSocials] = useState<SocialLink[]>(values.socials.length ? values.socials : [{ label: "", url: "" }]);
  const errors: Partial<Record<Field, string>> = state.status === "error" ? (state.fields ?? {}) : {};
  const err = (f: Field) => (errors[f] ? <p className="field-error">{errors[f]}</p> : null);

  const text = (name: keyof ProfileValues, label: string, opts: { rows?: number; max: number; hint?: string; type?: string } = { max: 120 }) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {opts.rows ? (
        <textarea id={name} name={name} rows={opts.rows} maxLength={opts.max} defaultValue={values[name] as string} aria-invalid={Boolean(errors[name])} />
      ) : (
        <input id={name} name={name} type={opts.type ?? "text"} maxLength={opts.max} defaultValue={values[name] as string} aria-invalid={Boolean(errors[name])} />
      )}
      {opts.rows && opts.max >= 300 && <CharCount targetId={name} max={opts.max} />}
      {opts.hint && <p className="field-hint">{opts.hint}</p>}
      {err(name)}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="admin-form" noValidate>
      {state.status !== "idle" && state.message && (
        <div className="form-alert" role={state.status === "error" ? "alert" : "status"} data-tone={state.status === "success" ? "success" : undefined}>
          {state.message}
        </div>
      )}

      <div className="admin-form-layout">
        <div className="admin-form">
          <section className="panel admin-form" aria-label="Identity">
            <div className="panel-head">
              <h2>Identity</h2>
            </div>
            <div className="form-row">
              {text("displayName", "Display name", { max: 80, hint: "Used in the header, hero and titles." })}
              {text("fullName", "Full name", { max: 120, hint: "Used in structured data and the footer." })}
            </div>
            <div className="form-row">
              {text("devBrand", "Development brand", { max: 80 })}
              {text("studioBrand", "Studio brand", { max: 80 })}
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="title1">Title 1</label>
                <input id="title1" name="title1" defaultValue={values.titles[0] ?? ""} maxLength={60} />
              </div>
              <div className="field">
                <label htmlFor="title2">Title 2</label>
                <input id="title2" name="title2" defaultValue={values.titles[1] ?? ""} maxLength={60} />
              </div>
            </div>
            {err("titles")}
          </section>

          <section className="panel admin-form" aria-label="Story">
            <div className="panel-head">
              <h2>Story</h2>
            </div>
            {text("heroIntro", "Hero introduction", { rows: 3, max: 400, hint: "The sentence under your name on the home page." })}
            {text("shortBio", "Short biography", { rows: 3, max: 400, hint: "Home page statement and About intro." })}
            {text("longBio", "Longer biography", { rows: 8, max: 6000, hint: "About page. Blank line between paragraphs." })}
            {text("engineeringApproach", "Approach to engineering", { rows: 3, max: 1200 })}
            {text("creativeApproach", "Approach to visual work", { rows: 3, max: 1200 })}
            <div className="field">
              <label htmlFor="openTo">Open to</label>
              <input id="openTo" name="openTo" defaultValue={values.openTo.join(", ")} placeholder="Freelance projects, Full-time roles, Remote collaboration" />
              <p className="field-hint">Comma-separated. Hidden on the site when empty.</p>
            </div>
          </section>

          <section className="panel admin-form" aria-label="Social links">
            <div className="panel-head">
              <h2>Social links</h2>
              <button
                type="button"
                className="tool"
                onClick={() => setSocials((s) => (s.length < 10 ? [...s, { label: "", url: "" }] : s))}
              >
                <Plus size={14} aria-hidden="true" /> Add link
              </button>
            </div>
            {socials.map((s, i) => (
              <div className="form-row" key={i} style={{ gridTemplateColumns: "minmax(0,0.6fr) minmax(0,1fr) auto", alignItems: "end" }}>
                <div className="field">
                  <label htmlFor={`socialLabel-${i}`}>Label</label>
                  <input
                    id={`socialLabel-${i}`}
                    name="socialLabel"
                    value={s.label}
                    maxLength={40}
                    placeholder="Instagram"
                    onChange={(e) => setSocials((list) => list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`socialUrl-${i}`}>URL</label>
                  <input
                    id={`socialUrl-${i}`}
                    name="socialUrl"
                    type="url"
                    value={s.url}
                    placeholder="https://"
                    onChange={(e) => setSocials((list) => list.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                  />
                </div>
                <button type="button" className="tool tool-danger" aria-label={`Remove link ${i + 1}`} onClick={() => setSocials((list) => list.filter((_, j) => j !== i))}>
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
            {err("socials")}
          </section>
        </div>

        <aside className="admin-form-side">
          <section className="panel admin-form" aria-label="Contact & availability">
            {text("location", "Location", { max: 120 })}
            {text("email", "Public email", { max: 254, type: "email", hint: "Shown on the site and used in mailto links." })}
            <div className="field">
              <label htmlFor="availability">Availability</label>
              <select id="availability" name="availability" defaultValue={values.availability}>
                <option value="available">Available for work</option>
                <option value="limited">Limited availability</option>
                <option value="unavailable">Not taking new work</option>
              </select>
            </div>
            {text("availabilityNote", "Availability note", { max: 200 })}
          </section>
          <section className="panel">
            <MediaField name="portraitId" kind="image" label="Portrait" initial={values.portrait} help="Square or 4:5 works best. Used in the hero, About page and structured data." />
          </section>
        </aside>
      </div>

      <div className="form-footer">
        <span className="field-hint">Changes go live as soon as you save.</span>
        <SubmitButton pending={pending}>Save profile</SubmitButton>
      </div>
    </form>
  );
}
