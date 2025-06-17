/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a', 
        'brand-blue': '#2563eb', 
        'brand-accent': '#0ea5e9', 
      },
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        outfit: ['Outfit', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [],
};
