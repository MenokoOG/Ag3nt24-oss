import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { JetBrains_Mono, Orbitron, Rajdhani } from "next/font/google";
import { asset } from "@/lib/asset";
import "@/styles/tokens.css";
import "@/styles/site.css";
import "@/styles/dashboard.css";

// Self-hosted at build time. Weights match the handoff: Orbitron 400/500/700,
// Rajdhani 400/500/600, JetBrains Mono 400/500/700.
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-orbitron", display: "swap" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-rajdhani", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://menokoog.github.io/Ag3nt24-oss/"),
  title: "Ag3nt24 — Agents propose. A human signs.",
  description: "A protocol droid framework with an anti-corruption layer. Adapter roles read the inherited AI estate, a deterministic kernel gates every crossing, and nothing changes state until a person puts their name on it.",
  openGraph: {
    title: "Ag3nt24 — Agents propose. A human signs.",
    images: [asset("/assets/og-card.png")],
  },
  icons: { icon: asset("/assets/hades-mark.png") },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0A0F0A",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The canopy tile is referenced from CSS; the URL is resolved here so it
  // carries the basePath on GitHub Pages.
  const vars = { "--ag-canopy": `url(${asset("/assets/canopy-tile.png")})` } as CSSProperties;
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${jetbrains.variable}`} style={vars}>
      <body>{children}</body>
    </html>
  );
}
