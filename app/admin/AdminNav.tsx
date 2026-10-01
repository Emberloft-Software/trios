"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Handshake,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  ScanFace,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/verifications", label: "Face verification", icon: ScanFace, count: "verifications" },
  { href: "/admin/photos", label: "Profile photos", icon: ImageIcon, count: "photos" },
  { href: "/admin/reports", label: "Reports", icon: Flag, count: "reports" },
  { href: "/admin/flags", label: "Red flags", icon: TriangleAlert },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/gigs", label: "Gigs", icon: CalendarDays },
  { href: "/admin/venues", label: "Venues", icon: MapPin },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
] as const;

export function AdminNav({ counts }: { counts: Record<"verifications" | "photos" | "reports", number> }) {
  const path = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(`${href}/`));

  return (
    <aside className="bg-hero sticky top-0 z-30 text-white lg:h-dvh lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[calc(0.75rem+var(--safe-top))] lg:block lg:px-5 lg:pt-6">
        <div className="flex items-center gap-2">
          <Logo href="/admin" tone="white" size="sm" />
          <span className="rounded-full bg-sun px-2 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wider text-plum">Admin</span>
        </div>
        <Link href="/feed" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-white/70 hover:text-white lg:mt-4">
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-4 lg:flex-col lg:px-3">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const n = "count" in l ? counts[l.count] : 0;
          const on = active(l.href, "exact" in l ? l.exact : false);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={on ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] font-semibold transition ${
                on ? "bg-white text-plum" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">{l.label}</span>
              {n > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ${on ? "bg-coral text-white" : "bg-coral text-white"}`}>{n}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
