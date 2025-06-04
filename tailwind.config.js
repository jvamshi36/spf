/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path based on your project structure
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#1D4ED8",
        secondary: "#F59E0B",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        muted: "#6B7280",
      },
    },
  },
  plugins: [],
}

