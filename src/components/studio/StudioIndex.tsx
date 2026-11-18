"use client";

import { useState } from "react";
import CreativeCard from "./CreativeCard";
import type { CategoryDTO, CreativeDTO } from "@/lib/types";

export default function StudioIndex({
  items,
  categories,
}: {
  items: CreativeDTO[];
  categories: CategoryDTO[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? items.filter((i) => i.category?.id === active) : items;

  return (
    <>
      <div className="studio-toolbar">
        <div className="chips" role="group" aria-label="Filter by discipline">
          <button type="button" className="chip" aria-pressed={active === null} onClick={() => setActive(null)}>
            All work <span className="count">{items.length}</span>
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category?.id === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={active === c.id}
                onClick={() => setActive(c.id)}
                disabled={count === 0}
              >
                {c.name} <span className="count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="creative-grid" aria-live="polite">
        {shown.map((item, i) => (
          <CreativeCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </>
  );
}
