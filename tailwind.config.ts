import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nrn: {
          black: "#0A0A0A",
          charcoal: "#1A1A1A",
          surface: "#242424",
          paper: "#F5F3EF",
          paperMuted: "#E8E4DE",
          purple: "#6D28D9",
          purpleLight: "#8B5CF6",
          purpleMuted: "#4C1D95",
          border: "#2E2E2E",
          borderLight: "#E8E4DE",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
