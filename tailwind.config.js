/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.scss",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--color-black)",
        foreground: "hsl(var(--foreground))",
        border: "rgb(255 255 255 / 0.1)",
        input: "rgb(255 255 255 / 0.05)",
        ring: "rgb(255 255 255 / 0.2)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-down": {
          "0%": { transform: "translateY(-100%) translateX(-50%)", opacity: 0 },
          "100%": { transform: "translateY(0) translateX(-50%)", opacity: 1 }
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 }
        },
        "heart-like": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        "heart-like": "heart-like 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
}