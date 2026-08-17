/**
 * Purely decorative abstract rings — an original, non-anatomical "premium
 * visual anchor" reused as the dashboard's Next Appointment hero and the
 * patient profile's header artwork. Slow, ambient motion only; respects
 * prefers-reduced-motion globally via app/globals.css.
 */
export function AmbientRings({
  light = false,
  className = "pointer-events-none absolute -right-10 -top-10 h-56 w-56 animate-float-slow",
}: {
  light?: boolean;
  className?: string;
}) {
  const stroke = light ? "rgba(255,255,255,0.35)" : "rgb(109 74 255 / 0.18)";
  const strokeDim = light ? "rgba(255,255,255,0.18)" : "rgb(79 70 229 / 0.10)";
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="90" stroke={strokeDim} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="66" stroke={stroke} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="40" stroke={strokeDim} strokeWidth="1.5" />
      <circle cx="168" cy="60" r="4" fill={stroke} />
      <circle cx="34" cy="130" r="3" fill={strokeDim} />
    </svg>
  );
}
