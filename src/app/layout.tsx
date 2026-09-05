import type {
  Metadata,
  Viewport,
} from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});


export const metadata: Metadata = {
  metadataBase: new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    "https://neba-precious-portfolio.vercel.app",
),
  title: {
    default: "Neba Precious | Software Developer and Designer",
    template: "%s | Neba Precious",
  },

  description:
    "Portfolio of Neba Precious Ngeh, a full-stack software developer and designer based in Douala, Cameroon, building practical digital products and creative experiences.",

  applicationName: "Neba Precious Portfolio",

  authors: [
    {
      name: "Neba Precious Ngeh",
    },
  ],

  creator: "Neba Precious Ngeh",
  publisher: "Neba Precious Ngeh",

  category: "technology",

  keywords: [
    "Neba Precious",
    "Neba Precious Ngeh",
    "Software Developer",
    "Full-Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "Mobile App Developer",
    "Software Designer",
    "Douala Developer",
    "Cameroon Developer",
    "Next.js Developer",
    "Angular Developer",
    "Ionic Developer",
    "NestJS Developer",
    "TypeScript Developer",
    "Jangora",
    "PharmaCompare",
  ],

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Neba Precious Portfolio",
    title: "Neba Precious | Software Developer and Designer",
    description:
      "Full-stack software developer and designer building thoughtful digital products with purpose and creativity.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Neba Precious | Software Developer and Designer",
    description:
      "Full-stack software developer and designer building thoughtful digital products with purpose and creativity.",
  },

  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07070a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={archivo.variable}>
        {children}
      </body>
    </html>
  );
}