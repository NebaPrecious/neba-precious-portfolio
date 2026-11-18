export type Embed =
  | { provider: "youtube" | "vimeo"; embedUrl: string; watchUrl: string }
  | { provider: "external"; embedUrl: null; watchUrl: string; label: string };

const externalLabels: [RegExp, string][] = [
  [/(^|\.)tiktok\.com$/i, "TikTok"],
  [/(^|\.)instagram\.com$/i, "Instagram"],
  [/(^|\.)facebook\.com$/i, "Facebook"],
  [/(^|\.)behance\.net$/i, "Behance"],
  [/(^|\.)drive\.google\.com$/i, "Google Drive"],
];

/**
 * Turns a pasted video link into a privacy-friendly embed when the platform
 * allows iframes (YouTube via youtube-nocookie, Vimeo with dnt=1).
 * Other platforms open externally rather than loading their tracking scripts.
 */
export function parseVideoUrl(raw: string | null | undefined): Embed | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");

  let youtubeId: string | null = null;
  if (host === "youtu.be") youtubeId = url.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") youtubeId = url.searchParams.get("v");
    const m = url.pathname.match(/^\/(shorts|embed|live)\/([\w-]{6,})/);
    if (m) youtubeId = m[2];
  }
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = url.pathname.match(/(\d{6,})/);
    if (m) {
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${m[1]}?dnt=1&title=0&byline=0`,
        watchUrl: `https://vimeo.com/${m[1]}`,
      };
    }
  }

  const label = externalLabels.find(([re]) => re.test(host))?.[1] ?? host;
  return { provider: "external", embedUrl: null, watchUrl: url.toString(), label };
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
