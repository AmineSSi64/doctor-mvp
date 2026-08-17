"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface TabNavItem<T extends string> {
  key: T;
  label: string;
  icon?: LucideIcon;
}

/**
 * Generic tab bar with a refined active-state transition (color + underline
 * both animate on `transition-colors`/border, no layout-shifting JS-measured
 * sliding indicator needed for a handful of text tabs). Kept content-agnostic
 * so it's reusable anywhere the app needs tabs, not just the patient profile.
 */
export function PremiumTabNav<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly TabNavItem<T>[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive ? "text-primary" : "text-ink-muted hover:text-ink"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-brand transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
