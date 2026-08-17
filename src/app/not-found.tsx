import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-4 text-center">
      <p className="text-3xl font-semibold text-ink">404</p>
      <p className="text-sm text-ink-muted">This page doesn&apos;t exist.</p>
      <Link href="/dashboard">
        <Button size="sm">Back to dashboard</Button>
      </Link>
    </div>
  );
}
