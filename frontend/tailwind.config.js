/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        agri: {
          green: '#16a34a',
          dark: '#0f172a',
          accent: '#84cc16',
          warm: '#fef3c7'
        }
      }
    },
  },
  plugins: [],
}
