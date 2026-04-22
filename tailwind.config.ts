import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    // Les utilitaires hover: ne s'appliquent que sur les devices qui
    // supportent vraiment le hover (souris/trackpad). Sur mobile/tactile,
    // évite les hover sticky après tap qui font clignoter les cards
    // quand on scrolle : shadow, translate, border et gradient overlays
    // restaient "collés" le temps d'un frame au release du doigt.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rose: {
          DEFAULT: "#c2185b",
          50: "#fce4ec",
          100: "#f8bbd0",
          500: "#e91e63",
          600: "#c2185b",
          700: "#ad1457",
          800: "#880e4f",
        },
        orange: {
          DEFAULT: "#ea580c",
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
        },
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "Nunito", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #c2185b 0%, #ea580c 100%)",
        "gradient-brand-subtle": "linear-gradient(135deg, rgba(194,24,91,0.08) 0%, rgba(234,88,12,0.08) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
