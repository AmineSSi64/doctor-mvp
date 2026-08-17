"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/** Debounced search input that updates the ?q= URL param, driving the server-rendered list. */
export function PatientSearchBar({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="group relative max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft transition-colors duration-200 group-focus-within:text-primary" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, ID, or phone..."
        aria-label="Search patients"
        className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm shadow-subtle placeholder:text-ink-soft transition-all duration-200 hover:border-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
      />
    </div>
  );
}
