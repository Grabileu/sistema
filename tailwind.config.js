/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B3FFF',
        secondary: '#FFD700',
        dark: '#1a1a1a',
      }
    },
  },
  plugins: [],
}
