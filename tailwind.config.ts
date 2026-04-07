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
        haas: {
          black: "#1a1a2e",
          red: "#E10600",
          white: "#FFFFFF",
          dark: "#0d0d1a",
          gray: "#2a2a3e",
          light: "#3a3a4e",
          accent: "#E10600",
          silver: "#B0B0B0",
        },
        alpine: {
          pink: "#FF69B4",
          blue: "#0090FF",
          dark: "#0a1628",
          navy: "#0c1e3a",
          accent: "#FF69B4",
          cyan: "#00D4FF",
        },
        asu: {
          maroon: "#8C1D40",
          gold: "#FFC627",
          dark: "#1a0a14",
          black: "#1a1020",
          gray: "#2a1a2e",
          light: "#3a2a3e",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
