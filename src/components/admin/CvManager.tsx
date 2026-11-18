"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import MediaField from "./MediaField";
import { setCv } from "@/server/actions/admin/profile";
import type { Media } from "@/lib/types";

export default function CvManager({ initial }: { initial: Media | null }) {
  const [current, setCurrent] = useState<Media | null>(initial);
  const [selected, setSelected] = useState<Media | null>(initial);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = (selected?.id ?? null) !== (current?.id ?? null);

  return (
    <div className="admin-form">
      {message && (
        <div className="form-alert" role={message.tone === "error" ? "alert" : "status"} data-tone={message.tone === "success" ? "success" : undefined}>
          {message.text}
        </div>
      )}
      <MediaField name="cvId" kind="document" label="CV (PDF)" initial={initial} onChange={setSelected} />
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-accent"
          disabled={!dirty || pending}
          onClick={() =>
            start(async () => {
              const result = await setCv(selected?.id ?? null);
              if (result.error) setMessage({ tone: "error", text: result.error });
              else {
                setCurrent(selected);
                setMessage({
                  tone: "success",
                  text: selected ? "CV published. Download buttons now point to this file." : "CV removed. Download buttons are hidden.",
                });
              }
            })
          }
        >
          {pending && <LoaderCircle className="spin" size={16} aria-hidden="true" />}
          {selected ? "Publish this CV" : "Remove CV from site"}
        </button>
        {current && (
          <a className="link-arrow" href="/cv" target="_blank" rel="noopener">
            Test the public /cv link
          </a>
        )}
      </div>
    </div>
  );
}
