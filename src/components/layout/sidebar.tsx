"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo, APP_NAME } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Pill,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/consultations", label: "Consultations", icon: Stethoscope },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-gradient-sidebar md:flex print:hidden">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Logo size={30} />
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-text">
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-text-muted">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-200",
                active
                  ? "bg-white/10 text-sidebar-text"
                  : "text-sidebar-text-muted hover:translate-x-0.5 hover:bg-sidebar-hover hover:text-sidebar-text"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-brand" />
              )}
              <Icon
                className={cn("h-[17px] w-[17px] transition-colors", active && "text-primary")}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 px-3 pb-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors duration-200",
            pathname === "/settings"
              ? "bg-white/10 text-sidebar-text"
              : "text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text"
          )}
        >
          <Settings className="h-[17px] w-[17px]" strokeWidth={2} />
          Settings
        </Link>
      </div>

      <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-3.5">
        <Avatar
          firstName={userName.split(" ")[0] ?? ""}
          lastName={userName.split(" ")[1] ?? ""}
          tone="sidebar"
          size="sm"
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-sidebar-text">
          Dr. {userName}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-text-muted transition-colors duration-200 hover:bg-sidebar-hover hover:text-sidebar-text"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
