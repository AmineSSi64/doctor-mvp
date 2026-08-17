import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft",
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
Textarea.displayName = "Textarea";
