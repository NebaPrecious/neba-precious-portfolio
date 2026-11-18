"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { submitEnquiry, type ContactState } from "@/server/actions/contact";
import { enquiryTypes } from "@/lib/validation";

const initial: ContactState = { status: "idle" };

/** Remounting with a new key resets the action state for "send another". */
export default function ContactForm({ email }: { email: string }) {
  const [round, setRound] = useState(0);
  return <ContactFormInner key={round} email={email} onReset={() => setRound((r) => r + 1)} />;
}

function ContactFormInner({ email, onReset }: { email: string; onReset: () => void }) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const startedAt = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Time-to-fill spam check: stamped once on the client after mount.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="form-success" ref={successRef} tabIndex={-1} role="status">
        <span className="form-success-icon" aria-hidden="true">
          <Check size={22} />
        </span>
        <h2>Message received.</h2>
        <p>
          Thank you for reaching out. I read every message and will reply to the email address you
          provided, usually within a few days.
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onReset}
        >
          Send another message
        </button>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fields ?? {} : {};
  const values = state.status === "error" ? state.values ?? {} : {};

  const describe = (field: keyof typeof errors) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form
      className="form"
      noValidate
      action={(formData) => {
        formData.set("startedAt", String(startedAt.current));
        action(formData);
      }}
    >
      {state.status === "error" && (
        <div className="form-alert" role="alert" ref={summaryRef} tabIndex={-1}>
          {state.message}
          {!state.fields && (
            <>
              {" "}
              <a href={`mailto:${email}`} className="link-arrow">
                {email}
              </a>
            </>
          )}
        </div>
      )}

      <div className="form-row">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
          />
          {errors.name && (
            <p className="field-error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            defaultValue={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
          />
          {errors.email && (
            <p className="field-error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset className="field">
        <legend>What is this about?</legend>
        <div className="radio-chips" aria-describedby={describe("type")}>
          {enquiryTypes.map((t) => (
            <label key={t.value} className="radio-chip">
              <input
                type="radio"
                name="type"
                value={t.value}
                required
                defaultChecked={values.type === t.value}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p className="field-error" id="type-error">
            {errors.type}
          </p>
        )}
      </fieldset>

      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={160}
          defaultValue={values.subject}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={describe("subject")}
        />
        {errors.subject && (
          <p className="field-error" id="subject-error">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={7}
          required
          minLength={20}
          maxLength={5000}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={["message-hint", describe("message")].filter(Boolean).join(" ")}
        />
        <p className="field-hint" id="message-hint">
          A few lines about the project, role or idea — timelines and links help.
        </p>
        {errors.message && (
          <p className="field-error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>

      {/* Spam traps — hidden from people and assistive tech. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-accent" disabled={pending} aria-disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="spin" size={16} aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send message <ArrowRight className="arrow-right" size={16} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="field-hint">Your details are only used to reply to you.</p>
      </div>
    </form>
  );
}
