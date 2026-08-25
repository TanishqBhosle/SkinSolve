/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE9',
          200: '#D1E0D4',
          300: '#A4C2AB',
          400: '#75A081',
          500: '#4D805D',
          600: '#386647',
          700: '#2D5A43',
          800: '#224433',
          900: '#193326',
        },
        surface: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          muted: '#F5F2EB',
          border: '#E8E4DC',
        },
        charcoal: {
          900: '#141816',
          800: '#1F2623',
          700: '#2D3732',
          600: '#47544E',
          500: '#64746D',
          400: '#8E9E97',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
