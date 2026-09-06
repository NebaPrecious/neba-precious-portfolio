"use client";

import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import type { CreativeItem } from "@/data/creatives";

type CreativeItemProps = {
  item: CreativeItem;
  onSelect: () => void;
};

export default function CreativeItemCard({
  item,
  onSelect,
}: CreativeItemProps) {
  const isVideo = item.type === "video";

  return (
    <button
      type="button"
      className="creative-card"
      onClick={onSelect}
      aria-label={`Open ${item.title}`}
    >
      <span className={`creative-card-media creative-card-${item.aspectRatio}`}>
        <Image
          className="creative-card-image"
          src={item.src}
          alt={item.title}
          fill
          sizes="(max-width: 700px) 90vw, (max-width: 1200px) 45vw, 30vw"
        />
      </span>

      <span className="creative-card-overlay">
        <span className="creative-card-copy">
          <strong>{item.title}</strong>
          <span>{item.description}</span>
        </span>

        {isVideo ? (
          <span className="creative-play-button" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </span>
        ) : (
          <span className="creative-open-button" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        )}
      </span>
    </button>
  );
}