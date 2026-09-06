export type CreativeItem = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster?: string;
  aspectRatio: "portrait" | "square" | "landscape";
  type: "image" | "video";
};

export const visualDesigns: CreativeItem[] = [
  {
    id: "neon-retreat",
    title: "Neon Retreat Flyer",
    description:
      "Event flyer concept built around bold typography and a neon color palette.",
    src: "/creatives/visuals/neon-retreat.svg",
    aspectRatio: "portrait",
    type: "image",
  },
  {
    id: "summit-brand",
    title: "Summit Brand Board",
    description:
      "Early brand exploration for a tech summit, pairing a calm blue system with clean type.",
    src: "/creatives/visuals/summit-brand.svg",
    aspectRatio: "landscape",
    type: "image",
  },
  {
    id: "event-highlight-thumb",
    title: "Event Highlights Thumbnail",
    description:
      "YouTube thumbnail direction for event highlight recaps.",
    src: "/creatives/visuals/event-highlight-thumb.svg",
    aspectRatio: "square",
    type: "image",
  },
  {
    id: "product-launch",
    title: "Product Launch Social",
    description:
      "Social media graphic for a product launch, focused on a single bold message.",
    src: "/creatives/visuals/product-launch.svg",
    aspectRatio: "portrait",
    type: "image",
  },
  {
    id: "studio-reel-cover",
    title: "Studio Reel Cover",
    description:
      "Cover design for a studio showreel, kept minimal to let the footage lead.",
    src: "/creatives/visuals/studio-reel-cover.svg",
    aspectRatio: "landscape",
    type: "image",
  },
  {
    id: "campaign-banner",
    title: "Campaign Banner",
    description:
      "Wide banner for a short campaign, with a high-contrast palette and tight copy.",
    src: "/creatives/visuals/campaign-banner.svg",
    aspectRatio: "landscape",
    type: "image",
  },
];

export const videoCreatives: CreativeItem[] = [
  {
    id: "event-highlight-2025",
    title: "Event Highlights 2025",
    description:
      "Fast-cut highlights reel built from event footage, synced to the music track.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
  {
    id: "teaser-this-is-fire",
    title: "Teaser: This is Fire",
    description:
      "Short teaser that builds tension through pacing and cuts before the reveal.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
  {
    id: "creative-showreel",
    title: "Creative Showreel",
    description:
      "A 60-second showreel mixing motion graphics and live clips.",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "/creatives/video-poster.svg",
    aspectRatio: "landscape",
    type: "video",
  },
];