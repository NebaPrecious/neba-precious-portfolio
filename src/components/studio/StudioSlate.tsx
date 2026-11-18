/**
 * Honest empty state for the studio: a film slate instead of fake work.
 * Shown to visitors until real studio work is published from the admin.
 */
export default function StudioSlate({ compact = false }: { compact?: boolean }) {
  return (
    <div className="slate" data-compact={compact}>
      <div className="slate-bar" aria-hidden="true" />
      <dl className="slate-grid mono">
        <div>
          <dt>Production</dt>
          <dd>Preelite Visual Creatives</dd>
        </div>
        <div>
          <dt>Scene</dt>
          <dd>01</dd>
        </div>
        <div>
          <dt>Take</dt>
          <dd>01</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>In the edit</dd>
        </div>
      </dl>
      <p className="slate-text">
        The reel is being cut. Selected video edits, videography and social creatives will be
        published here soon.
      </p>
    </div>
  );
}
