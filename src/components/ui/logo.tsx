/**
 * The product's one brand mark: a rounded badge with a single restrained
 * pulse-line, used everywhere the app needs an identity (sidebar, login,
 * favicon). Deliberately not a literal cross or stethoscope — a minimal
 * abstract signal of "clinical" is enough, and it stays legible at 20px.
 * Recolored to the purple → indigo brand gradient; the mark itself is
 * unchanged so the product identity carries over, not reinvented.
 *
 * The product name lives in one place — see APP_NAME below — so renaming
 * the product later is a one-line change, not a find-and-replace.
 */
export const APP_NAME = "Cabinet";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label={`${APP_NAME} logo`}
    >
      <defs>
        <linearGradient id="cabinet-logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D4AFF" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cabinet-logo-gradient)" />
      <path
        d="M6.5 17h3.6l2.1-6.2 3.1 11 2.4-7.8 1.4 3h6.4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
