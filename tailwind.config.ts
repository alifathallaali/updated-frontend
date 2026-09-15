import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2B",
        paper: "#F1F4F3",
        teal: {
          DEFAULT: "#1E6F6B",
          dark: "#144E4B",
        },
        line: "#D7DEDC",
        rust: "#B5502E",
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
