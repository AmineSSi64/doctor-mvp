import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "info" | "success" | "warning" | "danger" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-bg text-ink-muted border-border",
  primary: "bg-primary-soft text-primary border-transparent",
  info: "bg-info-soft text-info border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  accent: "bg-accent-soft text-accent border-transparent",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

/**
 * Maps appointment statuses to a consistent color tone across the app.
 * Each status is a genuinely distinct hue (not shades of the brand color)
 * so they're distinguishable without reading the label — see
 * components/appointments/status-badge.tsx for the icon+label pairing
 * that uses this. Scheduled uses the brand's electric-blue "info" tone so
 * it still reads as native to the purple/blue palette.
 */
export function statusTone(status: string): Tone {
  switch (status) {
    case "SCHEDULED":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "NO_SHOW":
      return "warning";
    default:
      return "neutral";
  }
}
