/**
 * Data-transfer types shared by server and client components.
 * Never include secrets or internal-only columns here.
 */

export type Media = {
  id: string;
  kind: "image" | "video" | "document";
  url: string;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  alt: string;
  format: string | null;
  bytes: number | null;
  originalFilename: string | null;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
};

export type SocialLink = { label: string; url: string };

export type ProfileDTO = {
  displayName: string;
  fullName: string;
  devBrand: string;
  studioBrand: string;
  titles: string[];
  heroIntro: string;
  shortBio: string;
  longBio: string;
  engineeringApproach: string;
  creativeApproach: string;
  openTo: string[];
  location: string;
  email: string;
  availability: "available" | "limited" | "unavailable";
  availabilityNote: string;
  socials: SocialLink[];
  portrait: Media | null;
  cv: Media | null;
};

export type ProjectDTO = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  body: string;
  stage: string;
  role: string;
  confidentialityNote: string;
  category: CategoryDTO | null;
  cover: Media | null;
  gallery: Media[];
  technologies: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  year: number | null;
  featured: boolean;
  isSample: boolean;
};

export type CreativeDTO = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: CategoryDTO | null;
  cover: Media | null;
  video: Media | null;
  externalUrl: string | null;
  aspect: "landscape" | "portrait" | "square";
  tools: string[];
  year: number | null;
  featured: boolean;
  isSample: boolean;
};

export type SkillGroupDTO = {
  category: CategoryDTO;
  skills: { id: string; name: string; note: string }[];
};
