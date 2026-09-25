/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          forest: '#075B2A',
          'forest-dark': '#064D25',
          natural: '#0B7A36',
          leaf: '#5FAF45',
          accent: '#84CC16',
          bg: '#F7FAF5',
          'bg-light': '#F5F8F3',
          card: '#FFFFFF',
          text: '#123524',
          secondary: '#66756B',
          border: '#DDE8DF',
          'border-light': '#EBF2ED',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(7, 91, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(18, 53, 36, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -4px rgba(7, 91, 42, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
