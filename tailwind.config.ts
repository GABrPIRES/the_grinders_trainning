// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* ===== DESIGN TOKENS — THE GRINDERS =====
         * Referenciam as CSS variables de globals.css.
         * Use SEMPRE esses tokens nos componentes.
         * Nunca use cores brutas do Tailwind (red-700, neutral-900, etc.).
         * Para mudar o tema: edite apenas globals.css.
         */

        /* Cor principal da marca */
        brand: {
          DEFAULT: 'rgb(var(--tg-brand) / <alpha-value>)',
          hover:   'rgb(var(--tg-brand-hover) / <alpha-value>)',
          glow:    'rgb(var(--tg-brand-glow) / <alpha-value>)',
          surface: 'rgb(var(--tg-brand-surface) / <alpha-value>)',
        },

        /* Fundos */
        surface: {
          app:           'rgb(var(--tg-bg-app) / <alpha-value>)',
          page:          'rgb(var(--tg-bg-page) / <alpha-value>)',
          subtle:        'rgb(var(--tg-bg-subtle) / <alpha-value>)',
          elevated:      'rgb(var(--tg-bg-elevated) / <alpha-value>)',
          sidebar:       'rgb(var(--tg-bg-sidebar) / <alpha-value>)',
          'sidebar-hover': 'rgb(var(--tg-bg-sidebar-hover) / <alpha-value>)',
        },

        /* Textos */
        content: {
          primary:   'rgb(var(--tg-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--tg-text-secondary) / <alpha-value>)',
          tertiary:  'rgb(var(--tg-text-tertiary) / <alpha-value>)',
          muted:     'rgb(var(--tg-text-muted) / <alpha-value>)',
          'on-brand':'rgb(var(--tg-text-on-brand) / <alpha-value>)',
          sidebar:   'rgb(var(--tg-text-sidebar) / <alpha-value>)',
        },

        /* Bordas */
        line: {
          DEFAULT: 'rgb(var(--tg-border) / <alpha-value>)',
          input:   'rgb(var(--tg-border-input) / <alpha-value>)',
        },

        /* Semânticos */
        semantic: {
          'success-bg':     'rgb(var(--tg-success-bg) / <alpha-value>)',
          'success-text':   'rgb(var(--tg-success-text) / <alpha-value>)',
          'success-border': 'rgb(var(--tg-success-border) / <alpha-value>)',

          'warning-bg':     'rgb(var(--tg-warning-bg) / <alpha-value>)',
          'warning-text':   'rgb(var(--tg-warning-text) / <alpha-value>)',
          'warning-border': 'rgb(var(--tg-warning-border) / <alpha-value>)',

          'error-bg':       'rgb(var(--tg-error-bg) / <alpha-value>)',
          'error-text':     'rgb(var(--tg-error-text) / <alpha-value>)',
          'error-border':   'rgb(var(--tg-error-border) / <alpha-value>)',

          'info-bg':        'rgb(var(--tg-info-bg) / <alpha-value>)',
          'info-text':      'rgb(var(--tg-info-text) / <alpha-value>)',
          'info-border':    'rgb(var(--tg-info-border) / <alpha-value>)',
        },
      },

      borderRadius: {
        DEFAULT: 'var(--tg-radius)',
        lg:      'var(--tg-radius)',
        md:      'calc(var(--tg-radius) - 2px)',
        sm:      'calc(var(--tg-radius) - 4px)',
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in":       "fade-in 1s ease-out forwards",
        "skeleton-pulse":"skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
