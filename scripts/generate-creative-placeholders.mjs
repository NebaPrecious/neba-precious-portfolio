import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "creatives", "visuals");
mkdirSync(outDir, { recursive: true });

const visualSeeds = [
  { id: "neon-retreat", from: "#7c3aed", to: "#1e1b4b", size: [600, 800], label: "NEON RETREAT" },
  { id: "summit-brand", from: "#0ea5e9", to: "#0c4a6e", size: [800, 600], label: "SUMMIT BRAND" },
  { id: "event-highlight-thumb", from: "#f59e0b", to: "#431407", size: [700, 700], label: "EVENT HIGHLIGHTS" },
  { id: "product-launch", from: "#f472b6", to: "#500724", size: [600, 800], label: "PRODUCT LAUNCH" },
  { id: "studio-reel-cover", from: "#10b981", to: "#064e3b", size: [800, 600], label: "STUDIO REEL" },
  { id: "campaign-banner", from: "#ef4444", to: "#450a0a", size: [800, 500], label: "CAMPAIGN BANNER" },
];

const contextSvg = (from, to, size, label) => {
  const [w, h] = size;
  const r = Math.round(Math.min(w, h) * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${Math.round(w * 0.82)}" cy="${Math.round(h * 0.16)}" r="${r}" fill="rgba(255,255,255,0.08)"/>
  <rect x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.52)}" width="${Math.round(w * 0.3)}" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
  <text x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.92)}" font-family="Arial, sans-serif" font-size="${Math.round(Math.min(w, h) * 0.05)}" font-weight="700" letter-spacing="3" fill="rgba(255,255,255,0.85)">${label}</text>
</svg>
`;
};

for (const seed of visualSeeds) {
  writeFileSync(
    join(outDir, `${seed.id}.svg`),
    contextSvg(seed.from, seed.to, seed.size, seed.label),
  );
}

const posterPath = join(process.cwd(), "public", "creatives", "video-poster.svg");
writeFileSync(
  posterPath,
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img" aria-label="Video preview">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#18181b"/>
      <stop offset="1" stop-color="#3f3f46"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <rect x="372" y="201" width="56" height="48" rx="14" fill="rgba(255,255,255,0.92)"/>
  <polygon points="384,215 384,235 400,225" fill="#18181b"/>
</svg>
`,
);

console.log(`Wrote ${visualSeeds.length} visual placeholders + poster to public/creatives/`);