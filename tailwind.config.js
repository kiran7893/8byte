/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./styles/**/*.{css}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Work Sans'", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#111318",
          800: "#1b1f27",
          700: "#2a303b",
          600: "#3a4252",
          500: "#4b5563",
          200: "#d1d5db",
          100: "#f3f4f6"
        },
        mint: {
          500: "#39f2b2",
          600: "#21d79a"
        },
        sand: {
          50: "#f7f3ef",
          100: "#f0e7df",
          200: "#e6d6c7"
        },
        coral: {
          500: "#ff6b4a",
          600: "#f2512c"
        }
      },
      boxShadow: {
        glass: "0 20px 60px rgba(17, 19, 24, 0.2)",
        card: "0 12px 36px rgba(17, 19, 24, 0.12)"
      }
    }
  },
  plugins: []
};
