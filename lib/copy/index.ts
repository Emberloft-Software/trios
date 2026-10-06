/**
 * Every user-facing string lives here, split by area. Voice: warm, plain, a
 * little playful, never cute about safety. Sentence case.
 */
import { appCopy } from "./app";
import { authCopy } from "./auth";
import { gigsCopy } from "./gigs";
import { chatCopy } from "./chat";
import { verificationCopy } from "./verification";
import { errorsCopy } from "./errors";
import { marketingCopy } from "./marketing";
import { discoverCopy } from "./discover";

export const copy = {
  ...appCopy,
  ...authCopy,
  ...gigsCopy,
  ...chatCopy,
  ...verificationCopy,
  ...errorsCopy,
  ...marketingCopy,
  ...discoverCopy,
} as const;
/** Map a thrown Postgres exception message to friendly copy. */
export function errorCopy(code: string | undefined | null): string {
  if (!code) return copy.errors.generic;
  return copy.errors[code] ?? copy.errors.generic;
}
