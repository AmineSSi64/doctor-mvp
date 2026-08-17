import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          deep: "rgb(var(--color-primary-deep) / <alpha-value>)",
          soft: "var(--color-primary-soft)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          soft: "var(--color-info-soft)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          soft: "var(--color-danger-soft)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          soft: "var(--color-warning-soft)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          soft: "var(--color-success-soft)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "var(--color-accent-soft)",
        },
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          hover: "var(--color-sidebar-hover)",
          text: "var(--color-sidebar-text)",
          "text-muted": "var(--color-sidebar-text-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "18px",
        "2xl": "22px",
        pill: "999px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(23 21 42 / 0.04)",
        panel: "0 4px 16px -4px rgb(23 21 42 / 0.10), 0 1px 2px 0 rgb(23 21 42 / 0.06)",
        // Purple-tinted elevation for card hover — a tiny lift with a shadow
        // that reads as "brand", not generic gray drop-shadow.
        "card-hover": "0 16px 28px -10px rgb(76 45 199 / 0.20), 0 2px 6px -2px rgb(76 45 199 / 0.10)",
        floating: "0 24px 48px -16px rgb(20 13 43 / 0.35)",
        glow: "0 0 0 4px rgb(109 74 255 / 0.14)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        floatSlower: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(8px) scale(1.03)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "float-slower": "floatSlower 9s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.2s ease-in-out infinite",
        "spin-slow": "spinSlow 40s linear infinite",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
