import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/feed?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#fbf8f3",
    theme_color: brand.themeColor,
    categories: ["social", "lifestyle", "sports"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Discover gigs", url: "/feed", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "Post a gig", url: "/gigs/new", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "My gigs", url: "/gigs", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
    ],
  };
}
