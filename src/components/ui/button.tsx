import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "onGradient";
  size?: "sm" | "md";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-brand text-white shadow-subtle hover:shadow-card-hover hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-surface text-ink border border-border hover:border-primary/40 hover:bg-primary-soft/60 hover:text-primary",
  ghost: "bg-transparent text-ink-muted hover:bg-bg hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
  // For use on top of the brand-gradient hero card (e.g. the dashboard's
  // Next Appointment card) — a translucent surface that reads on a colored
  // background instead of the default white secondary surface.
  onGradient: "border border-white/25 bg-white/10 text-white hover:bg-white/20",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
          "disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
