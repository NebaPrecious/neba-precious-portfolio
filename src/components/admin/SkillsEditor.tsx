"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { ActionButton, ConfirmButton, SubmitButton, useFormAction } from "./ui";
import { createSkill, deleteSkill, moveSkill, toggleSkillVisibility, updateSkill } from "@/server/actions/admin/taxonomy";

type Skill = { id: string; name: string; note: string; visible: boolean; categoryId: string };

function SkillRow({ skill, first, last }: { skill: Skill; first: boolean; last: boolean }) {
  const { state, pending, onSubmit } = useFormAction(updateSkill, { status: "idle" });
  return (
    <form className="skill-row" onSubmit={onSubmit}>
      <input type="hidden" name="id" value={skill.id} />
      <input type="hidden" name="categoryId" value={skill.categoryId} />
      {skill.visible && <input type="hidden" name="visible" value="on" />}
      <input name="name" defaultValue={skill.name} aria-label="Skill name" maxLength={60} required style={skill.visible ? undefined : { opacity: 0.55 }} />
      <input name="note" defaultValue={skill.note} aria-label={`Note for ${skill.name}`} placeholder="Note (e.g. Learning)" maxLength={40} />
      <div className="skill-row-actions">
        <SubmitButton className="tool" pending={pending} pendingLabel="…">
          Save
        </SubmitButton>
        <ActionButton action={() => moveSkill(skill.id, "up")} disabled={first} label={`Move ${skill.name} up`}>
          <ArrowUp size={14} aria-hidden="true" />
        </ActionButton>
        <ActionButton action={() => moveSkill(skill.id, "down")} disabled={last} label={`Move ${skill.name} down`}>
          <ArrowDown size={14} aria-hidden="true" />
        </ActionButton>
        <ActionButton
          action={() => toggleSkillVisibility(skill.id, !skill.visible)}
          label={skill.visible ? `Hide ${skill.name}` : `Show ${skill.name}`}
          pressed={!skill.visible}
        >
          {skill.visible ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
        </ActionButton>
        <ConfirmButton
          action={() => deleteSkill(skill.id)}
          title={`Delete “${skill.name}”?`}
          description="It will be removed from the site. You can hide it instead if you might want it back."
          ariaLabel={`Delete ${skill.name}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </ConfirmButton>
      </div>
      {state.status === "error" && (
        <p className="field-error" style={{ gridColumn: "1 / -1" }} role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}

function AddSkill({ categoryId }: { categoryId: string }) {
  const [state, action] = useActionState(createSkill, { status: "idle" as const });
  return (
    <>
      <form action={action} className="inline-form" style={{ marginTop: "var(--space-3)" }}>
        <input type="hidden" name="categoryId" value={categoryId} />
        <input name="name" placeholder="Add a skill" aria-label="New skill name" maxLength={60} required />
        <input name="note" placeholder="Note (optional)" aria-label="Note" maxLength={40} style={{ flexBasis: "8rem" }} />
        <SubmitButton className="btn btn-outline btn-sm" pendingLabel="Adding…">
          Add
        </SubmitButton>
      </form>
      {state.status === "error" && (
        <p className="field-error" role="alert">
          {state.message}
        </p>
      )}
    </>
  );
}

export default function SkillsEditor({
  groups,
}: {
  groups: { category: { id: string; name: string }; skills: Skill[] }[];
}) {
  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <h3>No skill groups</h3>
        <p>Create a group (e.g. Frontend) on the right, then add skills to it.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {groups.map((g) => (
        <section className="panel" key={g.category.id} aria-label={g.category.name}>
          <div className="panel-head">
            <h2>{g.category.name}</h2>
            <p>
              {g.skills.filter((s) => s.visible).length} visible · {g.skills.length} total
            </p>
          </div>
          {g.skills.map((s, i) => (
            <SkillRow key={s.id} skill={s} first={i === 0} last={i === g.skills.length - 1} />
          ))}
          <AddSkill categoryId={g.category.id} />
        </section>
      ))}
    </div>
  );
}
