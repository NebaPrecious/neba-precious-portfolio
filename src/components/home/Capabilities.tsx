import Reveal from "@/components/animations/Reveal";
import type { SkillGroupDTO } from "@/lib/types";

export default function Capabilities({
  groups,
  index = "03",
  title = "Capabilities",
}: {
  groups: SkillGroupDTO[];
  index?: string;
  title?: string;
}) {
  if (groups.length === 0) return null;

  return (
    <section className="section" aria-labelledby="capabilities-title">
      <div className="wrap">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-index">{index}</span> Toolkit
            </p>
            <h2 id="capabilities-title" className="title" style={{ marginTop: "var(--space-4)" }}>
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lede">
              The languages, frameworks and tools I work with today, across code and camera.
            </p>
          </Reveal>
        </div>

        <div className="capabilities">
          {groups.map((group, i) => (
            <Reveal key={group.category.id} delay={i * 0.05} className="capability">
              <h3>
                <span className="mono accent">{String(i + 1).padStart(2, "0")}</span>
                {group.category.name}
              </h3>
              <ul>
                {group.skills.map((s) => (
                  <li key={s.id}>
                    {s.name}
                    {s.note && <span className="tag">{s.note}</span>}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
