/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc2fd',
          400: '#36a1fa',
          500: '#0c84eb',
          600: '#0267c7',
          700: '#0352a1',
          800: '#074685',
          900: '#0c3c6f',
          950: '#082649',
        },
        sunset: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glow': '0 0 25px rgba(12, 132, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
