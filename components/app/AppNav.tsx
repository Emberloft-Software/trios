"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Compass, Plus, Shield, User, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { copy } from "@/lib/copy";

const tabs = [
  { href: "/feed", label: copy.nav.feed, icon: Compass },
  { href: "/gigs", label: copy.nav.myGigs, icon: CalendarDays, exact: true },
  { href: "/gigs/new", label: copy.nav.newGig, icon: Plus, primary: true },
  { href: "/me/friends", label: copy.nav.friends, icon: Users },
  { href: "/me", label: copy.nav.me, icon: User, exact: true },
];

function isActive(path: string, href: string, exact?: boolean) {
  if (exact) return path === href || (href === "/gigs" && /^\/gigs\/(?!new)[^/]+/.test(path));
  return path === href || path.startsWith(`${href}/`);
}

export function AppNav({
  name,
  avatarUrl,
  isAdmin,
  unread,
}: {
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  unread: number;
}) {
  const path = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="glass-strong sticky top-0 z-30 border-x-0 border-t-0 pt-[var(--safe-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/feed" size="sm" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {tabs
              .filter((t) => !t.primary)
              .map((t) => {
                const active = isActive(path, t.href, t.exact);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-[0.9375rem] font-semibold transition-colors ${
                      active ? "bg-plum text-white" : "text-plum hover:bg-plum/5"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
          </nav>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <Link href="/admin" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.8125rem] font-semibold text-plum hover:bg-plum/5 sm:inline-flex">
                <Shield className="h-4 w-4" /> {copy.nav.admin}
              </Link>
            )}
            <Link
              href="/gigs/new"
              className="hidden h-10 items-center gap-1.5 rounded-full bg-coral px-4 text-[0.875rem] font-semibold text-white shadow-[var(--shadow-coral)] hover:bg-coral-600 md:inline-flex"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> {copy.nav.newGig}
            </Link>
            <Link
              href="/notifications"
              aria-label={`${copy.nav.notifications}${unread ? ` (${unread} new)` : ""}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-plum hover:bg-plum/5"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[0.625rem] font-bold text-white ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link href="/me" aria-label={copy.nav.me} className="hidden rounded-full md:block">
              <Avatar name={name} src={avatarUrl} size={36} />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom tab bar (phones / installed app) */}
      <nav
        aria-label="Main"
        className="glass-strong fixed inset-x-0 bottom-0 z-30 border-x-0 border-b-0 pb-[var(--safe-bottom)] md:hidden"
      >
        <ul className="mx-auto grid h-[4.25rem] max-w-md grid-cols-5 items-center px-2">
          {tabs.map((t) => {
            const active = isActive(path, t.href, t.exact);
            const Icon = t.icon;
            if (t.primary) {
              return (
                <li key={t.href} className="flex justify-center">
                  <Link
                    href={t.href}
                    aria-label={t.label}
                    className="-mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-coral text-white shadow-[var(--shadow-coral)] ring-4 ring-cream transition-transform active:scale-95"
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </Link>
                </li>
              );
            }
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-1 text-[0.6875rem] font-semibold ${active ? "text-coral" : "text-muted"}`}
                >
                  {t.href === "/me" ? (
                    <Avatar name={name} src={avatarUrl} size={24} className={active ? "ring-2 ring-coral" : ""} />
                  ) : (
                    <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
                  )}
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
