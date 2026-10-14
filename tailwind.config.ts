import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF781E",
          blue: "#1B4594",
          purple: "#7952B3",
          red: "#ED1C24",
          lavender: "#9E80D2",
          charcoal: "#222222",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        bangla: ["var(--font-bangla)", "Noto Sans Bengali", "sans-serif"],
        display: ["var(--font-display)", "Baloo Da 2", "cursive"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #7952B3 0%, #1B4594 55%, #FF781E 100%)",
        "math-grid":
          "radial-gradient(circle at 1px 1px, rgba(158,128,210,0.35) 1px, transparent 0)",
      },
      boxShadow: {
        bubble: "0 10px 30px -12px rgba(27,69,148,0.45)",
        card: "0 6px 24px -10px rgba(34,34,34,0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        marquee: "marquee 24s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
