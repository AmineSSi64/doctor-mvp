import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

type Tone = "success" | "danger" | "warning";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-soft text-success border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
};

const toneIcon: Record<Tone, typeof AlertCircle> = {
  success: CheckCircle2,
  danger: AlertCircle,
  warning: AlertTriangle,
};

export function Alert({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const Icon = toneIcon[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm animate-fade-in-up",
        toneClasses[tone]
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}
