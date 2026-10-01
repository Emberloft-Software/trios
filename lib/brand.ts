/**
 * Brand constants. The product name appears here and in lib/copy.ts only.
 */
export const brand = {
  name: "Tremigos",
  shortName: "Tremigos",
  tagline: "Plans need people. Find your crew.",
  description:
    "Post a plan (futsal, coffee, a hike) and meet people in Sri Lanka who are up for the same thing. Groups of three or more, always in public.",
  city: "Colombo",
  country: "Sri Lanka",
  timezone: "Asia/Colombo",
  supportEmail: "hello@tremigos.app",
  safetyEmail: "safety@tremigos.app",
  privacyEmail: "privacy@tremigos.app",
  legalEntity: "Tremigos",
  themeColor: "#ff3450",
} as const;

/** Palette as TS constants, mirroring the @theme block in globals.css. */
export const colors = {
  coral: "#FF3450",
  sun: "#FFBA30",
  plum: "#360253",
  cream: "#FBF8F3",
  mint: "#12A26B",
} as const;
