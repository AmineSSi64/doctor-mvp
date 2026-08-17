import { cn, initials } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarTone = "primary" | "sidebar" | "onGradient";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
};

const TONE_CLASSES: Record<AvatarTone, string> = {
  primary: "bg-primary-soft text-primary",
  sidebar: "bg-white/10 text-sidebar-text",
  // For use on top of the brand-gradient hero card.
  onGradient: "bg-white/15 text-white",
};

/**
 * The one place a patient/doctor's initials-in-a-circle are rendered.
 * Centralized so the dashboard, patient list, patient profile, and app
 * shell (sidebar/topbar) all share the exact same visual treatment instead
 * of five copies of the same span drifting out of sync.
 */
export function Avatar({
  firstName,
  lastName,
  size = "md",
  tone = "primary",
  className,
}: {
  firstName: string;
  lastName: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className
      )}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
