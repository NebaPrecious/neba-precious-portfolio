"use client";

import { useState } from "react";
import {
  visualDesigns,
  videoCreatives,
  type CreativeItem,
} from "@/data/creatives";
import CreativeGrid from "./CreativeGrid";
import CreativeModal from "./CreativeModal";

type Tab = "visuals" | "videos";

const tabs: { id: Tab; label: string }[] = [
  { id: "visuals", label: "Visual design" },
  { id: "videos", label: "Video creatives" },
];

export default function CreativesClient() {
  const [activeTab, setActiveTab] = useState<Tab>("visuals");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const items: CreativeItem[] =
    activeTab === "visuals" ? visualDesigns : videoCreatives;

  return (
    <>
      <div
        className="creative-tabs"
        role="tablist"
        aria-label="Creative work categories"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              type="button"
              role="tab"
              id={`creative-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="creative-tabpanel"
              tabIndex={selected ? 0 : -1}
              className={selected ? "creative-tab is-active" : "creative-tab"}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIndex(null);
              }}
              onKeyDown={(event) => {
                const current = tabs.findIndex((t) => t.id === activeTab);
                let next = current;

                if (event.key === "ArrowRight") {
                  next = (current + 1) % tabs.length;
                } else if (event.key === "ArrowLeft") {
                  next = (current - 1 + tabs.length) % tabs.length;
                }

                if (next !== current) {
                  event.preventDefault();
                  setActiveTab(tabs[next].id);
                  setSelectedIndex(null);
                  document
                    .getElementById(`creative-tab-${tabs[next].id}`)
                    ?.focus();
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="creative-tabpanel"
        id="creative-tabpanel"
        role="tabpanel"
        aria-labelledby={`creative-tab-${activeTab}`}
      >
        <CreativeGrid
          items={items}
          onSelect={(index) => setSelectedIndex(index)}
        />
      </div>

      <CreativeModal
        items={items}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={(index) => setSelectedIndex(index)}
      />
    </>
  );
}