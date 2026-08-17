"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, CalendarDays, Stethoscope, Pill } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appts", icon: CalendarDays },
  { href: "/consultations", label: "Visits", icon: Stethoscope },
  { href: "/prescriptions", label: "Rx", icon: Pill },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface md:hidden print:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200",
              active ? "text-primary" : "text-ink-soft"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
