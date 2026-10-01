import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { brand } from "@/lib/brand";

/**
 * Times are stored timestamptz (UTC) and always rendered in Asia/Colombo.
 */
const TZ = brand.timezone;

/** "Sat 2 Aug · 6:30 PM" */
export function formatGigTime(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "EEE d MMM · h:mm a");
}

/** "Sat 2 Aug" */
export function formatDay(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "EEE d MMM");
}

/** "6:30 PM" */
export function formatClock(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "h:mm a");
}

/** Calendar tile parts: { dow: "SAT", day: "2", mon: "AUG" } */
export function dateTile(iso: string) {
  const d = new Date(iso);
  return {
    dow: formatInTimeZone(d, TZ, "EEE").toUpperCase(),
    day: formatInTimeZone(d, TZ, "d"),
    mon: formatInTimeZone(d, TZ, "MMM").toUpperCase(),
  };
}

export function toColomboLocalInput(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm");
}

/** A datetime-local value is Colombo wall time — convert to a UTC ISO string. */
export function colomboLocalToUtcISO(local: string): string {
  if (!local) return "";
  return fromZonedTime(local, TZ).toISOString();
}

/** "in 3h", "in 2d", "now" */
export function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `in ${hrs}h`;
  return `in ${Math.round(hrs / 24)}d`;
}

/** "5m ago", "3h ago", "2d ago", or a date */
export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDay(iso);
}

/** Whole years between a YYYY-MM-DD birth date and today. */
export function ageFrom(birthDate: string): number {
  const b = new Date(`${birthDate}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}
