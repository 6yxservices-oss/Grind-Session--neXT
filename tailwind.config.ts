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
        eybl: {
          navy: "#1a1a2e",
          blue: "#16213e",
          accent: "#e94560",
          gold: "#f5a623",
          dark: "#0f0f1a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
