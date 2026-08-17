"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd forward to a logging service.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-ink">Something went wrong.</p>
      <p className="max-w-sm text-sm text-ink-muted">
        Please try again. If the problem continues, check the terminal running{" "}
        <code className="font-mono">npm run dev</code> for details.
      </p>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
