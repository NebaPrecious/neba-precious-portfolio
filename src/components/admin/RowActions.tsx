"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Star, Trash2 } from "lucide-react";
import { ActionButton, ConfirmButton } from "./ui";
import { deleteProject, moveProject, setProjectFlag } from "@/server/actions/admin/projects";
import { deleteCreative, moveCreative, setCreativeFlag } from "@/server/actions/admin/creative";

type Props = {
  type: "project" | "creative";
  id: string;
  name: string;
  published: boolean;
  featured: boolean;
  first: boolean;
  last: boolean;
};

export default function RowActions({ type, id, name, published, featured, first, last }: Props) {
  const [error, setError] = useState<string | null>(null);
  const a =
    type === "project"
      ? { flag: setProjectFlag, move: moveProject, remove: deleteProject, edit: `/admin/projects/${id}` }
      : { flag: setCreativeFlag, move: moveCreative, remove: deleteCreative, edit: `/admin/studio/${id}` };

  return (
    <div className="row-actions">
      <ActionButton action={() => a.move(id, "up")} disabled={first} label={`Move ${name} up`}>
        <ArrowUp size={14} aria-hidden="true" />
      </ActionButton>
      <ActionButton action={() => a.move(id, "down")} disabled={last} label={`Move ${name} down`}>
        <ArrowDown size={14} aria-hidden="true" />
      </ActionButton>
      <ActionButton
        action={() => a.flag(id, "featured", !featured)}
        pressed={featured}
        label={featured ? `Unfeature ${name}` : `Feature ${name}`}
      >
        <Star size={14} aria-hidden="true" fill={featured ? "currentColor" : "none"} />
      </ActionButton>
      <ActionButton
        action={() => a.flag(id, "published", !published)}
        label={published ? `Unpublish ${name}` : `Publish ${name}`}
        onError={setError}
      >
        {published ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        {published ? "Unpublish" : "Publish"}
      </ActionButton>
      <Link className="tool" href={a.edit}>
        <Pencil size={14} aria-hidden="true" /> Edit
      </Link>
      <ConfirmButton
        action={() => a.remove(id)}
        title={`Delete “${name}”?`}
        description="This permanently removes the entry from the site. Its uploaded media stays in the library so you can reuse or delete it separately."
        ariaLabel={`Delete ${name}`}
      >
        <Trash2 size={14} aria-hidden="true" />
      </ConfirmButton>
      {error && (
        <p className="field-error" role="alert" style={{ flexBasis: "100%", textAlign: "right" }}>
          {error}
        </p>
      )}
    </div>
  );
}
