import type { Config } from "tailwindcss";

const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1320px" } },
    extend: {
      colors: {
        bg: c("bg"),
        surface: c("surface"),
        "surface-2": c("surface-2"),
        ink: c("ink"),
        muted: c("muted"),
        faint: c("faint"),
        line: c("line"),
        accent: c("accent"),
        "accent-ink": c("accent-ink"),
        "accent-soft": c("accent-soft"),
        success: c("success"),
        warning: c("warning"),
        danger: c("danger"),
      },
      fontFamily: {
        display: ['"Zodiak"', "Georgia", "serif"],
        sans: ['"Switzer"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)", { lineHeight: "1.4" }],
        sm: ["clamp(0.875rem, 0.84rem + 0.15vw, 0.9375rem)", { lineHeight: "1.5" }],
        base: ["clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)", { lineHeight: "1.6" }],
        lg: ["clamp(1.125rem, 1rem + 0.6vw, 1.375rem)", { lineHeight: "1.35" }],
        xl: ["clamp(1.5rem, 1.2rem + 1.25vw, 2.125rem)", { lineHeight: "1.15" }],
        "2xl": ["clamp(2rem, 1.2rem + 2.8vw, 3.5rem)", { lineHeight: "1.05" }],
        hero: ["clamp(2.75rem, 1rem + 5vw, 5.75rem)", { lineHeight: "0.95" }],
      },
      borderRadius: { sm: "4px", DEFAULT: "6px", md: "8px", lg: "12px", xl: "18px" },
      boxShadow: {
        soft: "0 1px 2px hsl(var(--shadow) / 0.06), 0 4px 16px hsl(var(--shadow) / 0.06)",
        lift: "0 2px 4px hsl(var(--shadow) / 0.08), 0 16px 40px hsl(var(--shadow) / 0.12)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: { shimmer: "shimmer 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
} satisfies Config;
