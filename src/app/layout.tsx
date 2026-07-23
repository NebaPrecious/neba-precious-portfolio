import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Neba Precious | Software Developer and Designer",
    template: "%s | Neba Precious",
  },
  description:
    "Portfolio of Neba Precious Ngeh, a software developer and designer based in Douala, Cameroon.",
  keywords: [
    "Neba Precious",
    "Software Developer",
    "Full-Stack Developer",
    "Web Developer",
    "Designer",
    "Douala",
    "Cameroon",
    "Next.js",
    "Angular",
    "NestJS",
  ],
  authors: [
    {
      name: "Neba Precious Ngeh",
    },
  ],
  creator: "Neba Precious Ngeh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}