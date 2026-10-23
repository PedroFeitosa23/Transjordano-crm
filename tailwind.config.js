/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Essencial para o toggle funcionar
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        border: 'var(--border-color)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        brand: {
          blue: '#002b5c',
          green: '#A3C43B',
        }
      },
    },
  },
  plugins: [],
}
