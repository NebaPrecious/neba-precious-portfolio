/** Suspense boundary for every admin page so navigations render instantly. */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="admin-page-head">
        <div>
          <div style={{ width: "14rem", height: "2rem", borderRadius: 6, background: "var(--surface-2)" }} />
          <div style={{ width: "22rem", maxWidth: "70vw", height: "0.9rem", marginTop: "0.75rem", borderRadius: 4, background: "var(--surface)" }} />
        </div>
      </div>
      <div className="rows">
        {[0, 1, 2].map((i) => (
          <div className="row" key={i} style={{ gridTemplateColumns: "auto 1fr" }}>
            <div className="row-thumb" />
            <div style={{ height: "1rem", width: `${60 - i * 10}%`, borderRadius: 4, background: "var(--surface-2)" }} />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
