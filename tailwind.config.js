/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        accent: "#6C5CE7",
        signal: {
          green: "#22C55E",
          amber: "#F2A93B",
          red: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
