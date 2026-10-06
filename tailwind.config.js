/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#030712",
          900: "#060e22",
          850: "#0a1532",
          800: "#0f1f47",
          700: "#162d66",
          600: "#1e3e8c",
        },
        turf: {
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
        },
        volt: {
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          glow: "#38bdf8",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        amber: {
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Tajawal", "Cairo", "system-ui", "sans-serif"],
        display: ["Cabinet Grotesk", "Tajawal", "sans-serif"],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -3px rgba(56, 189, 248, 0.4)',
        'glow-volt': '0 0 30px -3px rgba(14, 165, 233, 0.5)',
        'glow-gold': '0 0 25px -3px rgba(245, 158, 11, 0.4)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'pitch-pattern': "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, rgba(3, 7, 18, 0.98) 100%)",
        'stadium-gradient': "linear-gradient(to bottom, rgba(6, 14, 34, 0.8) 0%, rgba(3, 7, 18, 0.95) 100%)",
      },
    },
  },
  plugins: [],
}