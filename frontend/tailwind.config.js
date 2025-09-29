/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd8ff',
          300: '#8fbaff',
          400: '#5b97ff',
          500: '#316fff',
          600: '#1f52e6',
          700: '#1a43b8',
          800: '#193d95',
          900: '#183777'
        }
      }
    }
  },
  plugins: []
}
