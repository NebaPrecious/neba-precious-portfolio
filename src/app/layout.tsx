import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import { siteUrl, THEME_COOKIE } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = "Neba Precious — Software Engineer & Visual Creative";
const description =
  "Neba Precious is a software engineer (Dev Pre_elite) and visual creative (Preelite Visual Creatives) based in Douala, Cameroon — building practical digital products and telling stories through video.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Neba Precious",
  },
  description,
  applicationName: "Neba Precious",
  authors: [{ name: "Neba Precious Ngeh", url: siteUrl }],
  creator: "Neba Precious Ngeh",
  publisher: "Neba Precious Ngeh",
  category: "technology",
  keywords: [
    "Neba Precious",
    "Neba Precious Ngeh",
    "Dev Pre_elite",
    "Preelite Visual Creatives",
    "Software Engineer",
    "Full-Stack Developer",
    "Video Editor",
    "Videographer",
    "Social Media Creatives",
    "Douala",
    "Cameroon",
    "Angular",
    "Ionic",
    "NestJS",
    "TypeScript",
    "Jangora",
    "PharmaCompare",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Neba Precious",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
  themeColor: "#0b1a30",
};

/**
 * Runs before first paint: applies the saved theme (cookie, default dark),
 * and marks JS as available so reveal animations can run.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.remove("no-js");try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);d.setAttribute("data-theme",m?m[1]:"dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`no-js ${archivo.variable} ${geistMono.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
