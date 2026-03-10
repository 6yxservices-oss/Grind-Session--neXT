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
        psu: {
          navy: "#041E42",
          white: "#FFFFFF",
          blue: "#0a2a5c",
          accent: "#1E88E5",
          dark: "#021029",
          light: "#1a3a6a",
          gold: "#c5b358",
          steel: "#9EA2A2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
