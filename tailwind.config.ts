import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

/**
 * ASJ Catalog — Tailwind CSS configuration.
 *
 * Only semantic tokens declared in `src/styles/globals.css` should be
 * consumed by components. Bootstrap and legacy CSS Modules have been
 * removed (Phase 10.6); preflight is enabled and dark mode is
 * scaffolded through the `class` strategy.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Standard Tailwind breakpoints (documented for reference).
    // sm: 640, md: 768, lg: 1024, xl: 1280, 2xl: 1536.
    extend: {
      /* --- Colors (semantic tokens) ---------------------------- */
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "foreground-muted": "hsl(var(--foreground-muted) / <alpha-value>)",

        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          hover: "hsl(var(--surface-hover) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },

        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",

        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        overlay: "hsl(var(--overlay) / <alpha-value>)",

        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },

        input: {
          DEFAULT: "hsl(var(--input) / <alpha-value>)",
          border: "hsl(var(--input-border) / <alpha-value>)",
        },
      },

      /* --- Typography ----------------------------------------- */
      fontFamily: {
        heading: ['"Space Grotesk"', '"Inter"', "system-ui", "sans-serif"],
        body: ['"DM Sans"', '"Inter"', "system-ui", "sans-serif"],
        sans: ['"DM Sans"', '"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["2rem", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.2", fontWeight: "600" }],
        title: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        subtitle: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.55" }],
        body: ["1rem", { lineHeight: "1.5" }],
        small: ["0.875rem", { lineHeight: "1.45" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },

      /* --- Spacing scale (semantic aliases on top of Tailwind) - */
      spacing: {
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "3rem", // 48px
        "3xl": "4rem", // 64px
      },

      /* --- Border radius -------------------------------------- */
      borderRadius: {
        sm: "0.25rem", // 4px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        full: "9999px",
      },

      /* --- Shadows -------------------------------------------- */
      boxShadow: {
        sm: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
        md: "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.04)",
        lg: "0 12px 24px -8px rgb(15 23 42 / 0.12), 0 4px 8px -4px rgb(15 23 42 / 0.06)",
        xl: "0 24px 48px -12px rgb(15 23 42 / 0.18)",
      },

      /* --- Z-index -------------------------------------------- */
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        overlay: "1040",
        modal: "1050",
        toast: "1080",
        tooltip: "1090",
      },

      /* --- Motion --------------------------------------------- */
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "180ms",
        slow: "280ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        entrance: "cubic-bezier(0, 0, 0.2, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      },

      /* --- Keyframes / animations (microinteractions) --------- */
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms cubic-bezier(0, 0, 0.2, 1) both",
        "scale-in": "scale-in 180ms cubic-bezier(0.2, 0, 0, 1) both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config;
