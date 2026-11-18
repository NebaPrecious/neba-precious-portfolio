import Image from "next/image";
import type { Media } from "@/lib/types";

type Props = {
  media: Media;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Fill the parent (parent must be positioned and sized). */
  fill?: boolean;
  alt?: string;
};

/** next/image wrapper that always has dimensions (no layout shift) and alt text. */
export default function MediaImage({ media, sizes, priority, className, fill, alt }: Props) {
  const src = media.kind === "video" ? media.posterUrl : media.url;
  if (!src) return null;
  const altText = alt ?? media.alt;

  if (fill || !media.width || !media.height) {
    return (
      <Image
        src={src}
        alt={altText}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={altText}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

export function isPortrait(media: Media | null | undefined) {
  return Boolean(media?.width && media?.height && media.height > media.width * 1.2);
}
