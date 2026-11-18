"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";
import { ActionButton, ConfirmButton, SubmitButton } from "./ui";
import { createCategory, deleteCategory, moveCategory, renameCategory } from "@/server/actions/admin/taxonomy";

type Cat = { id: string; name: string; usage: number };

function CategoryRow({ cat, first, last, unit }: { cat: Cat; first: boolean; last: boolean; unit: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="row" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
      <div className="row-main">
        {editing ? (
          <div className="inline-form">
            <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Category name" maxLength={60} />
            <ActionButton
              label="Save name"
              action={async () => {
                const r = await renameCategory(cat.id, name);
                if (r.error) setError(r.error);
                else setEditing(false);
              }}
            >
              <Check size={14} aria-hidden="true" />
            </ActionButton>
            <button type="button" className="tool" aria-label="Cancel" onClick={() => { setEditing(false); setName(cat.name); }}>
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="row-title">
            {cat.name} <span className="badge badge-muted">{cat.usage} {unit}</span>
          </div>
        )}
        {error && <p className="field-error">{error}</p>}
      </div>
      <div className="row-actions" style={{ gridColumn: "auto" }}>
        <ActionButton action={() => moveCategory(cat.id, "up")} disabled={first} label={`Move ${cat.name} up`}>
          <ArrowUp size={14} aria-hidden="true" />
        </ActionButton>
        <ActionButton action={() => moveCategory(cat.id, "down")} disabled={last} label={`Move ${cat.name} down`}>
          <ArrowDown size={14} aria-hidden="true" />
        </ActionButton>
        <button type="button" className="tool" aria-label={`Rename ${cat.name}`} onClick={() => setEditing(true)}>
          <Pencil size={14} aria-hidden="true" />
        </button>
        <ConfirmButton
          action={() => deleteCategory(cat.id)}
          title={`Delete “${cat.name}”?`}
          description={cat.usage > 0 ? `${cat.usage} item(s) use this category. Projects and studio entries become uncategorised; skill groups must be emptied first.` : "This category is not in use."}
          ariaLabel={`Delete ${cat.name}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </ConfirmButton>
      </div>
    </div>
  );
}

export default function CategoryManager({
  scope,
  categories,
  title,
  unit = "items",
}: {
  scope: "dev" | "studio" | "skill";
  categories: Cat[];
  title: string;
  unit?: string;
}) {
  const [state, action] = useActionState(createCategory, { status: "idle" as const });

  return (
    <section className="panel" aria-label={title}>
      <div className="panel-head">
        <h2>{title}</h2>
      </div>
      {categories.length > 0 && (
        <div className="rows" style={{ marginBottom: "var(--space-4)" }}>
          {categories.map((c, i) => (
            <CategoryRow key={c.id} cat={c} first={i === 0} last={i === categories.length - 1} unit={unit} />
          ))}
        </div>
      )}
      <form action={action} className="inline-form">
        <input type="hidden" name="scope" value={scope} />
        <input name="name" placeholder="New category name" aria-label="New category name" maxLength={60} required />
        <SubmitButton className="btn btn-outline btn-sm" pendingLabel="Adding…">
          Add
        </SubmitButton>
      </form>
      {state.status !== "idle" && state.message && (
        <p className={state.status === "error" ? "field-error" : "field-hint"} role="status" style={{ marginTop: "0.5rem" }}>
          {state.message}
        </p>
      )}
    </section>
  );
}
