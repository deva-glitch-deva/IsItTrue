import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        cream: "rgb(var(--cream) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        true: "#1fae6a",
        "true-deep": "#0c6e42",
        false: "#ef4444",
        "false-deep": "#9d1c1c",
        misleading: "#f5a623",
        "misleading-deep": "#9a5d00",
        unverified: "#8b949b",
        "unverified-deep": "#4d565c",
        hot: "#ff6a3d",
        mint: "#8ee4b8",
        butter: "#ffe28a",
        sky: "#83c7ff",
        candy: "#ff8fa3",
      },
      fontFamily: {
        display: ["Bricolage Grotesque Variable", "Impact", "sans-serif"],
        body: ["Manrope Variable", "system-ui", "sans-serif"],
      },
      boxShadow: {
        clay: "0 8px 0 rgb(var(--line) / 0.16), 0 18px 36px rgb(0 0 0 / 0.12)",
        "clay-sm":
          "0 4px 0 rgb(var(--line) / 0.14), 0 8px 18px rgb(0 0 0 / 0.1)",
        "clay-inset":
          "inset 0 2px 0 rgb(255 255 255 / 0.55), inset 0 -3px 0 rgb(0 0 0 / 0.08)",
        sticker: "0 3px 0 rgba(0,0,0,.18), 0 10px 18px rgba(0,0,0,.16)",
      },
      borderRadius: {
        blob: "2rem 1.2rem 2.2rem 1rem",
        squish: "1.4rem 1.9rem 1.2rem 2.1rem",
      },
      keyframes: {
        wobble: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".35" },
        },
      },
      animation: {
        wobble: "wobble 4s ease-in-out infinite",
        floaty: "floaty 3.5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        blink: "blink 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
