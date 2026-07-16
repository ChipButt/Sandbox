import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#171717",
          900: "#222222",
          800: "#2d2f31",
          700: "#3d4145",
          500: "#6a7078",
          300: "#b2b8c1",
          100: "#edf0f3",
        },
        steel: {
          700: "#2f4b5f",
          500: "#47718c",
          300: "#9db7c7",
        },
        signal: {
          blue: "#2563eb",
          cyan: "#0891b2",
          green: "#15803d",
          amber: "#b45309",
          red: "#dc2626",
        },
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,.8) inset, 0 10px 28px rgba(15,23,42,.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
