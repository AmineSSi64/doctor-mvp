import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "info" | "success" | "warning" | "accent" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-bg text-ink-muted",
};

/**
 * The shared metric-card shape used across the dashboard (DashboardStatCard
 * usage) and the patient profile (PatientMetricCard usage): a big number,
 * a label, a tinted icon chip, and an optional line of supporting context.
 * One component so both screens' KPI tiles stay visually identical instead
 * of drifting apart over time.
 */
export function MetricCard({
  icon: Icon,
  tone = "primary",
  label,
  value,
  meta,
  className,
  style,
}: {
  icon: LucideIcon;
  tone?: Tone;
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "animate-fade-in-up rounded-lg border border-border bg-surface p-5 shadow-subtle",
        "transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary/20",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", TONE_CLASSES[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
      {meta && <p className="mt-2 text-xs text-ink-soft">{meta}</p>}
    </div>
  );
}
