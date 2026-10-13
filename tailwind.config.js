/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'transjordano-green': '#a3c339',
        'transjordano-blue': '#1c2841'
      }
    },
  },
  plugins: [],
}