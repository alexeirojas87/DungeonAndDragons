import type { Metadata } from "next";
import { IBM_Plex_Mono, EB_Garamond, Cinzel } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-narrative",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Gauntlet — A Living Fantasy RPG",
  description: "A browser-based fantasy RPG where the terminal is the window into the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${ebGaramond.variable} ${cinzel.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">{children}</body>
    </html>
  );
}
