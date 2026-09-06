"use client";

import type { CreativeItem } from "@/data/creatives";
import CreativeItemCard from "./CreativeItem";

type CreativeGridProps = {
  items: CreativeItem[];
  onSelect: (index: number) => void;
};

export default function CreativeGrid({
  items,
  onSelect,
}: CreativeGridProps) {
  if (items.length === 0) {
    return (
      <div className="creative-empty-state">
        <p>Nothing here yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="creative-masonry">
      {items.map((item, index) => (
        <CreativeItemCard
          item={item}
          onSelect={() => onSelect(index)}
          key={item.id}
        />
      ))}
    </div>
  );
}