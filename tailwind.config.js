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
        // Base colors
        black: "#1a1a1a",
        white: "#ffffff",
        background: "#1a1a1a",
        foreground: "hsl(var(--foreground))",
        border: "rgba(255, 255, 255, 0.02)",
        input: "rgb(255 255 255 / 0.05)",
        ring: "rgb(255 255 255 / 0.2)",

        // Gray scale
        gray: {
          100: "#f0f0f0",
          200: "#e0e0e0",
          300: "#c9c9c9",
          400: "#a3a3a3",
          500: "#6b6b6b",
          600: "#474747",
          700: "#2e2e2e",
          800: "#242424",
          900: "#1f1f1f",
        },

        // Brand colors
        loud: {
          DEFAULT: "#cfff31",
          light: "#ecffae",
          dark: "#b8f000",
          30: "rgba(207, 255, 49, 0.3)",
        },

        // Semantic colors
        surface: {
          DEFAULT: "#242424",
          dark: "#2e2e2e",
        },
        text: {
          DEFAULT: "#ffffff",
          secondary: "#a3a3a3",
          tertiary: "#6b6b6b",
        },
        accent: {
          DEFAULT: "#cfff31",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Component specific
        card: {
          DEFAULT: "#242424",
          foreground: "hsl(var(--card-foreground))",
          'gradient-start': "rgba(38, 38, 38, 0)",
          'gradient-middle': "rgba(38, 38, 38, 0.8)",
          'gradient-end': "#242424",
        },
        pill: {
          DEFAULT: "rgba(32, 32, 32, 0.6)",
          border: "rgba(0, 0, 0, 0.05)",
        },
        'genre-pill': {
          DEFAULT: "rgba(255, 255, 255, 0.3)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        divider: "rgba(255, 255, 255, 0.06)",
        
        // Original shadcn colors
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "#E9074F",
        },
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