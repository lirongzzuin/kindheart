import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * KindHeart 디자인 시스템 v2 — 딥틸/테라코타 프리미엄 팔레트.
 * 타이포는 rem 기반 → globals.css 의 html font-size 스케일(접근성 글씨크기)이 실제로 동작.
 */

// 타이포 역할 토큰(rem). `font-<역할>`·`text-<역할>` 둘 다 동일 스타일 생성.
const TYPO: Record<string, Record<string, string>> = {
  "headline-xl": { fontSize: "2.5rem", lineHeight: "1.18", letterSpacing: "-0.01em", fontWeight: "800" }, // 40
  "headline-lg": { fontSize: "2rem", lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }, // 32
  "headline-lg-mobile": { fontSize: "1.75rem", lineHeight: "1.2", fontWeight: "700" }, // 28
  "headline-md": { fontSize: "1.5rem", lineHeight: "1.3", fontWeight: "700" }, // 24
  "body-lg": { fontSize: "1.125rem", lineHeight: "1.6", fontWeight: "400" }, // 18
  "body-md": { fontSize: "1rem", lineHeight: "1.6", fontWeight: "400" }, // 16
  "label-md": { fontSize: "0.875rem", lineHeight: "1.4", letterSpacing: "0.03em", fontWeight: "600" }, // 14
  "label-sm": { fontSize: "0.875rem", lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "600" }, // 14 (back-compat)
  "button-text": { fontSize: "1.0625rem", lineHeight: "1.2", fontWeight: "700" }, // 17
};

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#002421",
        "primary-container": "#0d3b36",
        "on-primary": "#ffffff",
        "on-primary-container": "#7aa59e",
        "primary-fixed": "#bfece4",
        "primary-fixed-dim": "#a3cfc8",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#234e48",
        secondary: "#8f4c30",
        "secondary-container": "#fda684",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#773a1f",
        "secondary-fixed": "#ffdbce",
        "secondary-fixed-dim": "#ffb598",
        "on-secondary-fixed": "#370e00",
        "on-secondary-fixed-variant": "#72351b",
        tertiary: "#2b1d00",
        "tertiary-container": "#463100",
        "tertiary-fixed": "#ffdea4",
        "tertiary-fixed-dim": "#e8c176",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#bc9851",
        "on-tertiary-fixed": "#261900",
        "on-tertiary-fixed-variant": "#5d4200",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        background: "#f9f9f8",
        "on-background": "#1a1c1b",
        surface: "#f9f9f8",
        "surface-dim": "#d9dad9",
        "surface-bright": "#f9f9f8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f2",
        "surface-container": "#edeeec",
        "surface-container-high": "#e8e8e7",
        "surface-container-highest": "#e2e3e1",
        "on-surface": "#1a1c1b",
        "on-surface-variant": "#404847",
        "surface-variant": "#e2e3e1",
        outline: "#717977",
        "outline-variant": "#c0c8c6",
        "inverse-surface": "#2f3130",
        "inverse-on-surface": "#f0f1ef",
        "inverse-primary": "#a3cfc8",
        "surface-tint": "#3c6660",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        full: "9999px",
      },
      spacing: {
        unit: "8px",
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
        gutter: "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "container-max": "1280px",
        "touch-target-min": "48px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      fontFamily: {
        sans: ["var(--font-atkinson)", "Atkinson Hyperlegible Next", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,36,33,0.05)",
        card: "0 8px 30px rgba(0,36,33,0.05)",
        elevated: "0 24px 48px -12px rgba(0,36,33,0.10)",
        cta: "0 8px 20px rgba(0,36,33,0.22)",
      },
      backgroundImage: {
        "gradient-secondary": "linear-gradient(135deg, #8f4c30 0%, #72351b 100%)",
      },
    },
  },
  plugins: [
    plugin(({ addComponents }) => {
      const comps: Record<string, Record<string, string>> = {};
      for (const [name, style] of Object.entries(TYPO)) {
        comps[`.font-${name}`] = style;
        comps[`.text-${name}`] = style;
      }
      addComponents(comps);
    }),
  ],
};

export default config;
