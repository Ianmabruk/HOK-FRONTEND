/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        'warm-white': '#FEFCF8',
        sage: '#8B9E7E',
        'dark-sage': '#6B7E5E',
        charcoal: '#2C2C2C',
        'light-charcoal': '#4A4A4A',
        terracotta: '#C4785A',
        gold: '#B8960C',
        'soft-gold': '#D4AF37',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' },
    },
  },
  plugins: [],
}

