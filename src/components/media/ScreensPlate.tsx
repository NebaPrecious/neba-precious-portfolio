import MediaImage, { isPortrait } from "./MediaImage";
import type { Media } from "@/lib/types";

/**
 * Presents project screenshots on a neutral plate.
 * Phone-shaped images are fanned in a row; wide images show as a single frame.
 */
export default function ScreensPlate({
  images,
  label,
  priority = false,
}: {
  images: Media[];
  label: string;
  priority?: boolean;
}) {
  if (images.length === 0) {
    return (
      <div className="plate plate-empty" aria-hidden="true">
        <span className="mono">No preview</span>
      </div>
    );
  }

  const phones = images.filter(isPortrait);

  if (phones.length >= 2) {
    const shown = phones.slice(0, 3);
    return (
      <div className="plate plate-phones" data-count={shown.length} role="group" aria-label={`${label} screens`}>
        {shown.map((m, i) => (
          <div className="plate-phone" key={m.id} style={{ "--i": i } as React.CSSProperties}>
            <MediaImage media={m} sizes="(max-width: 900px) 30vw, 14vw" priority={priority && i === 0} />
          </div>
        ))}
      </div>
    );
  }

  const first = phones[0] ?? images[0];
  return (
    <div className={`plate ${isPortrait(first) ? "plate-single-phone" : "plate-single"}`}>
      <div className={isPortrait(first) ? "plate-phone" : "plate-wide"}>
        <MediaImage media={first} sizes="(max-width: 900px) 80vw, 40vw" priority={priority} />
      </div>
    </div>
  );
}
