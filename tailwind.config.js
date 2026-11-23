/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Playfair Display — headlines and featured stories
        display: ["'Playfair Display'", "Georgia", "serif"],
        // DM Sans — navigation, body copy, labels
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Sans'", "sans-serif"],
        // Space Grotesk — SIFTNEWS wordmark and category labels
        grotesk: ["'Space Grotesk'", "'DM Sans'", "sans-serif"],
      },
      // Palette (see src/index.css): grey #91A3B0, white #F5F5F5, black #2A3439
      colors: {
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};
