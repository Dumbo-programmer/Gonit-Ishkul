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
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(121,82,179,0.12) 0%, rgba(27,69,148,0.08) 55%, rgba(255,120,30,0.12) 100%)",
        "brand-conic":
          "conic-gradient(from 180deg at 50% 50%, #FF781E, #7952B3, #1B4594, #9E80D2, #FF781E)",
        mesh:
          "radial-gradient(at 20% 20%, rgba(255,120,30,0.18) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(121,82,179,0.20) 0px, transparent 50%), radial-gradient(at 75% 80%, rgba(27,69,148,0.18) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(158,128,210,0.20) 0px, transparent 50%)",
        "math-grid":
          "radial-gradient(circle at 1px 1px, rgba(158,128,210,0.35) 1px, transparent 0)",
      },
      boxShadow: {
        bubble: "0 10px 30px -12px rgba(27,69,148,0.45)",
        card: "0 6px 24px -10px rgba(34,34,34,0.25)",
        glow: "0 18px 50px -16px rgba(255,120,30,0.55)",
        "glow-blue": "0 18px 50px -16px rgba(27,69,148,0.55)",
        "glow-purple": "0 18px 50px -16px rgba(121,82,179,0.55)",
        "lift": "0 24px 60px -24px rgba(34,34,34,0.45)",
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
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(24px, -32px) scale(1.08)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.94)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "300% 50%" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        marquee: "marquee 24s linear infinite",
        shimmer: "shimmer 3s linear infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        blob: "blob 12s ease-in-out infinite",
        "pulse-glow": "pulse-glow 5s ease-in-out infinite",
        wiggle: "wiggle 1.2s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
