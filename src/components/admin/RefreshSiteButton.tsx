"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ActionButton } from "./ui";
import { refreshPublicSite } from "@/server/actions/admin/site";

export default function RefreshSiteButton() {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "var(--space-4)", flexWrap: "wrap" }}>
      <ActionButton
        className="btn btn-outline btn-sm"
        action={async () => {
          await refreshPublicSite();
          setDone(true);
        }}
      >
        <RefreshCw size={14} aria-hidden="true" /> Refresh live site
      </ActionButton>
      {done && (
        <span className="field-hint" role="status">
          Done. The public pages now show the latest content.
        </span>
      )}
    </div>
  );
}
