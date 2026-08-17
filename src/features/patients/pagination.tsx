import Link from "next/link";
import { cn } from "@/lib/utils";

export function PatientsPagination({
  page,
  pageCount,
  query,
}: {
  page: number;
  pageCount: number;
  query?: string;
}) {
  function hrefFor(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", String(p));
    return `/patients?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all duration-200",
            p === page
              ? "bg-gradient-brand text-white shadow-subtle"
              : "text-ink-muted hover:-translate-y-px hover:bg-primary-soft hover:text-primary"
          )}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}
