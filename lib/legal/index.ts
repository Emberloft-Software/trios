/**
 * Terms of Service + Privacy Policy content, kept as data so the pages can
 * render a table of contents. Plain language on purpose.
 */
export interface LegalSection {
  id: string;
  title: string;
  body: (string | string[])[]; // a string is a paragraph, a string[] is a bullet list
}

export const LEGAL_UPDATED = "1 October 2026";

export { terms } from "./terms";
export { privacy } from "./privacy";
