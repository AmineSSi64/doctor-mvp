import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-ink-soft",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          error ? "border-danger" : "border-border hover:border-ink-soft",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
