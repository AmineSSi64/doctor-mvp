/**
 * Groups related fields under a small uppercase section label with a
 * divider — used across every multi-field form (patient, consultation,
 * appointment) so long forms read as a sequence of clear steps instead of
 * one flat, undifferentiated stack of inputs.
 */
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
