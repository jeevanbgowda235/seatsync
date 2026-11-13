/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070d18',
          900: '#0b132b',
          850: '#111c3a',
          800: '#1c2541',
          700: '#27345b',
          600: '#3a4a79',
          500: '#4d5f97'
        },
        accent: {
          cyan: '#38bdf8',
          blue: '#2563eb',
          electric: '#0284c7',
          teal: '#14b8a6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 16px 32px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'glow': '0 0 25px rgba(56, 189, 248, 0.35)'
      }
    },
  },
  plugins: [],
}
