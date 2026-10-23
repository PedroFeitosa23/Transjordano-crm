/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        },
        transjordano: {
          blue: {
            50: '#f0f5fa',
            100: '#e1ebf4',
            200: '#c3d7e8',
            300: '#a5c3dc',
            400: '#87afce',
            500: '#699bc0',
            600: '#4b87b2',
            700: '#2d73a4',
            800: '#0f5f96',
            900: '#002b5c',
          },
          green: {
            50: '#f6f9ef',
            100: '#edf3df',
            200: '#dbe7bf',
            300: '#c9db9f',
            400: '#b7cf7f',
            500: '#A3C43B',
            600: '#829d2f',
            700: '#627623',
            800: '#414e17',
            900: '#21270c',
          }
        }
      }
    },
  },
  plugins: [],
}
