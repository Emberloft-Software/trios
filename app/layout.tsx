import type { Metadata } from "next";
import { Gabarito, Instrument_Sans, DM_Mono } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

// Display face — rounded, geometric, carries the personality (docs/04 § Type)
const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-gabarito",
  display: "swap",
});

// Body face — clean, holds up at 14px
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

// Data face — counts, codes, timers, LKR amounts only
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${gabarito.variable} ${instrument.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
