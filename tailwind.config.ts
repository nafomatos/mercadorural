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
        verde: {
          DEFAULT: "#2d6a4f",
          claro: "#52b788",
          escuro: "#1b4332",
        },
        terra: {
          DEFAULT: "#a0522d",
          claro: "#c8713f",
        },
        palha: "#f5e6c8",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
