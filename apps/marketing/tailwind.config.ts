
import type { Config } from "tailwindcss"
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9eaff",
          200: "#b9d4ff",
          300: "#8bb8ff",
          400: "#5a95ff",
          500: "#2e74ff", // light blue
          600: "#1f59d6",
          700: "#143faa",
          800: "#0f2d80", // dark blue
          900: "#0b215f"
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(15,45,128,0.08)"
      }
    }
  },
  plugins: []
}
export default config
