export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://neba-precious-portfolio.vercel.app"
).replace(/\/$/, "");

export const THEME_COOKIE = "theme";

/** Primary navigation. `index` is used for the editorial numbering. */
export const navigation = [
  { href: "/work", label: "Work", index: "01" },
  { href: "/studio", label: "Studio", index: "02" },
  { href: "/about", label: "About", index: "03" },
  { href: "/contact", label: "Contact", index: "04" },
] as const;
