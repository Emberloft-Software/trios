import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { brand } from "@/lib/brand";
import { getSiteURL } from "@/lib/site-url";
import { ServiceWorker } from "@/components/pwa/ServiceWorker";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteURL()),
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: brand.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <div className="ambient" aria-hidden>
          <span style={{ width: 520, height: 520, top: -160, right: -120, background: "#ff3450", opacity: 0.22 }} />
          <span style={{ width: 460, height: 460, bottom: -140, left: -140, background: "#ffba30", opacity: 0.28 }} />
          <span style={{ width: 380, height: 380, top: "40%", left: "55%", background: "#6f3f8f", opacity: 0.12 }} />
        </div>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
