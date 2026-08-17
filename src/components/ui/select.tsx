import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          error ? "border-danger" : "border-border hover:border-ink-soft",
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
