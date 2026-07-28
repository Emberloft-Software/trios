import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { brand } from "@/lib/brand";

/**
 * Times are stored timestamptz (UTC) and always rendered in Asia/Colombo
 * (CLAUDE.md). Never store naive timestamps.
 */
const TZ = brand.timezone; // 'Asia/Colombo'

export function formatGigTime(iso: string): string {
  // e.g. "Sat 2 Aug · 6:30 PM"
  return formatInTimeZone(new Date(iso), TZ, "EEE d MMM · h:mm a");
}

export function formatDay(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "EEE d MMM");
}

/** For <input type="datetime-local"> default value in Colombo local time. */
export function toColomboLocalInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Convert a `datetime-local` value (Colombo wall-time, no offset) to a UTC ISO
 * string. The app timezone is Asia/Colombo regardless of the browser's zone,
 * so we interpret the input as Colombo time rather than the browser's local
 * time (`new Date(value)` would use the browser offset and be wrong abroad).
 * Returns "" for empty input.
 */
export function colomboLocalToUtcISO(local: string): string {
  if (!local) return "";
  return fromZonedTime(local, TZ).toISOString();
}

/** Countdown-ish label to a lock time. */
export function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}
