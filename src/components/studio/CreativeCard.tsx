"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import Tilt from "@/components/animations/Tilt";
import MediaImage from "@/components/media/MediaImage";
import { formatDuration } from "@/lib/embed";
import type { CreativeDTO } from "@/lib/types";

/**
 * Studio card. Uploaded videos preview silently on hover/focus (desktop,
 * motion allowed); nothing is downloaded until then (`preload="none"`).
 */
export default function CreativeCard({
  item,
  index,
  sizes = "(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw",
}: {
  item: CreativeDTO;
  index: number;
  sizes?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMotionVideo = item.video?.kind === "video";
  const cover = item.cover ?? (item.video?.posterUrl ? item.video : null);
  const duration = formatDuration(item.video?.durationSeconds);
  const isMedia = Boolean(item.video || item.externalUrl);

  // Touch screens have no hover: play muted while the card is mostly in view.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = "auto";
          video.play().then(() => video.classList.add("is-playing")).catch(() => {});
        } else {
          video.pause();
          video.classList.remove("is-playing");
        }
      },
      { threshold: 0.65 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    video.play().catch(() => {});
  }

  function stop() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  return (
    <Link
      href={`/studio/${item.slug}`}
      className="creative-card"
      data-aspect={item.aspect}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
    >
      <Tilt className="creative-card-tilt">
      <span className="creative-card-media">
        {cover ? (
          <MediaImage media={cover} fill sizes={sizes} alt={cover.alt || item.title} />
        ) : (
          <span className="creative-card-nocover mono">{item.title}</span>
        )}
        {hasMotionVideo && item.video && (
          <video
            ref={videoRef}
            className="creative-card-video"
            src={item.video.url}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        {isMedia && (
          <span className="creative-card-play" aria-hidden="true">
            <Play size={16} fill="currentColor" />
          </span>
        )}
      </span>
      </Tilt>

      <span className="creative-card-meta mono">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{item.category?.name ?? "Studio"}</span>
        {duration && <span>{duration}</span>}
        {item.isSample && <span className="sample-badge">Sample</span>}
      </span>
      <span className="creative-card-title">{item.title}</span>
      <span className="creative-card-summary">{item.summary}</span>
    </Link>
  );
}
