"use client";

import Link from "next/link";

/** Public error boundary: never shows stack traces or internals. */
export default function GlobalRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="wrap" style={{ minHeight: "100dvh", display: "grid", alignContent: "center", gap: "var(--space-6)", paddingBlock: "var(--space-9)" }}>
      <p className="eyebrow">
        <span className="eyebrow-index">ERR</span> Something went wrong
      </p>
      <h1 className="display display-wide">The reel jammed.</h1>
      <p className="lede">An unexpected error occurred. Please try again in a moment.</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
