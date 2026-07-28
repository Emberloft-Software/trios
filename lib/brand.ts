/**
 * Brand constants. Trio is a working codename — rename here before launch
 * (CLAUDE.md: the name appears only in this file and copy files).
 */
export const brand = {
  name: "Trio",
  tagline: "Post a plan. Three people minimum. Go do the thing.",
  city: "Colombo",
  timezone: "Asia/Colombo",
  supportEmail: "hello@trio.lk",
  appealsEmail: "appeals@trio.lk",
} as const;

/** Palette as TS constants, mirroring the @theme block in globals.css. */
export const colors = {
  court: "#E7EDE4",
  chalk: "#FFFFFF",
  ink: "#1B1A16",
  tape: "#FF5E3A",
  line: "#FFD23F",
  net: "#12706B",
  dust: "#9A9B8F",
} as const;
