import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed-variant": "#2f2ebe",
        "on-error-container": "#93000a",
        "primary-fixed": "#e1e0ff",
        "on-primary": "#ffffff",
        secondary: "#006c49",
        "on-secondary-container": "#00714d",
        "surface-container-low": "#eff4ff",
        "on-surface": "#0b1c30",
        "primary-container": "#2e3192",
        "error-container": "#ffdad6",
        error: "#ba1a1a",
        "secondary-fixed-dim": "#4edea3",
        "outline-variant": "#c7c5d4",
        "secondary-fixed": "#6ffbbe",
        "tertiary-fixed": "#e1e0ff",
        "tertiary-container": "#2421b6",
        "surface-bright": "#f8f9ff",
        "on-primary-container": "#9da1ff",
        background: "#f8f9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-tint": "#4f54b4",
        "secondary-container": "#6cf8bb",
        "on-surface-variant": "#464652",
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        "inverse-on-surface": "#eaf1ff",
        "surface-variant": "#d3e4fe",
        "tertiary-fixed-dim": "#c0c1ff",
        "on-tertiary-fixed": "#07006c",
        "on-tertiary-container": "#9ea1ff",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed-variant": "#373a9b",
        "on-background": "#0b1c30",
        tertiary: "#0c0092",
        "on-primary-fixed": "#04006d",
        "inverse-primary": "#c0c1ff",
        "surface-dim": "#cbdbf5",
        "surface-container-high": "#dce9ff",
        "on-tertiary": "#ffffff",
        primary: "#15157d",
        "inverse-surface": "#213145",
        "on-secondary-fixed": "#002113",
        "surface-container": "#e5eeff",
        outline: "#777683",
        "primary-fixed-dim": "#c0c1ff",
        "on-secondary-fixed-variant": "#005236",
        surface: "#f8f9ff"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        lg: "1.5rem",
        sm: "0.5rem",
        base: "4px",
        "max-width": "1440px",
        xs: "0.25rem",
        gutter: "1.5rem",
        md: "1rem",
        margin: "2rem",
        xl: "2rem"
      },
      fontFamily: {
        h1: ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        h3: ["Inter", "sans-serif"],
        h2: ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"]
      },
      fontSize: {
        h1: ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.03em", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: [forms]
};
