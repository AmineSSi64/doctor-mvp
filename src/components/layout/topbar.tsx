"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

const SECTION_TITLES: { prefix: string; label: string }[] = [
  { prefix: "/dashboard", label: "Dashboard" },
  { prefix: "/patients", label: "Patients" },
  { prefix: "/appointments", label: "Appointments" },
  { prefix: "/consultations", label: "Consultations" },
  { prefix: "/prescriptions", label: "Prescriptions" },
  { prefix: "/settings", label: "Settings" },
];

function sectionTitleFor(pathname: string): string {
  return SECTION_TITLES.find((s) => pathname.startsWith(s.prefix))?.label ?? "";
}

export function Topbar({ userName }: { userName: string }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const sectionTitle = sectionTitleFor(pathname);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(`/patients?q=${encodeURIComponent(query)}`);
    });
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 md:px-6 print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        {sectionTitle && (
          <span className="hidden shrink-0 text-sm font-semibold text-ink md:inline">
            {sectionTitle}
          </span>
        )}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            aria-label="Search patients"
            className={cn(
              "h-9 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft",
              "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:bg-surface"
            )}
          />
        </form>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-200 hover:bg-bg"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar firstName={userName.split(" ")[0] ?? ""} lastName={userName.split(" ")[1] ?? ""} size="sm" />
          <span className="hidden text-sm font-medium text-ink sm:inline">{userName}</span>
          <ChevronDown className={cn("h-4 w-4 text-ink-soft transition-transform duration-200", menuOpen && "rotate-180")} />
        </button>

        {menuOpen && (
          <>
            <button
              aria-label="Close menu"
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setMenuOpen(false)}
              tabIndex={-1}
            />
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-44 animate-scale-in origin-top-right rounded-md border border-border bg-surface py-1 shadow-panel"
            >
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-bg"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
