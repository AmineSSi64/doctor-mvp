export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <div className="h-7 w-48 animate-pulse rounded-md bg-border" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
    </div>
  );
}
