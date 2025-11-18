import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind CSS v4 uses CSS-based configuration via @theme in globals.css
  // This file exists for compatibility with tools that expect a config file
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

