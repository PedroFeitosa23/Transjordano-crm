import defaultTheme from 'tailwindcss/defaultTheme'
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'transjordano-blue': { DEFAULT: '#1c2841', 50: '#f3f5f9', 100: '#e4e8f1', 200: '#c9d1e2', 300: '#9eacc9', 400: '#6e82ab', 500: '#4c6290', 600: '#3a4b75', 700: '#2f3d5e', 800: '#25314d', 900: '#1c2841', 950: '#121a2c' },
        'transjordano-green': { DEFAULT: '#a3c339', 50: '#f7fae9', 100: '#eef4d0', 200: '#dde9a5', 300: '#c7da6f', 400: '#b3cd48', 500: '#a3c339', 600: '#7f9b27', 700: '#617621', 800: '#4d5e1f', 900: '#42501e' },
      },
      fontFamily: { sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans] },
      boxShadow: { card: '0 1px 2px rgb(16 24 40 / 0.05), 0 1px 3px rgb(16 24 40 / 0.08)', pop: '0 8px 24px rgb(16 24 40 / 0.12)' },
    },
  },
  plugins: [],
}
