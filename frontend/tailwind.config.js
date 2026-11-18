/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#13211C',
          50: '#F2F5F3',
          100: '#E2E9E5',
          200: '#C4D2CB',
          300: '#9DB2A8',
          400: '#748C81',
          500: '#586E64',
          600: '#455750',
          700: '#384740',
          800: '#26332D',
          900: '#13211C',
          950: '#0A1511',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F3ECDF',
          300: '#EADFCC',
          400: '#DCCDB3',
        },
        forest: {
          DEFAULT: '#1C3A30',
          light: '#2A5142',
          deep: '#0F261F',
        },
        moss: {
          DEFAULT: '#3E6B58',
          light: '#6E9584',
        },
        clay: {
          50: '#FCF2ED',
          100: '#F8E1D6',
          200: '#F0C3AE',
          300: '#E59E81',
          400: '#D97A57',
          500: '#C75B39',
          600: '#AE472A',
          700: '#8C3822',
          800: '#6C2C1C',
          900: '#4C2015',
        },
        sand: '#E7DBC5',
        slate: {
          50: '#F7F8F7',
          100: '#EDEFED',
          200: '#DDE1DF',
          300: '#C3CAC6',
          400: '#99A39E',
          500: '#76817B',
          600: '#5C6B63',
          700: '#45534C',
          800: '#2F3B35',
          900: '#1D2723',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        soft: '0 2px 12px -4px rgba(19, 33, 28, 0.08)',
        card: '0 18px 45px -24px rgba(19, 33, 28, 0.28)',
        lift: '0 30px 70px -30px rgba(19, 33, 28, 0.35)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'draw-check': {
          '100%': { strokeDashoffset: '0' },
        },
        'confetti-pop': {
          '0%': {
            opacity: '0',
            transform: 'translate3d(0, 0, 0) rotate(0deg) scale(0.2)',
          },
          '18%': { opacity: '1' },
          '100%': {
            opacity: '0',
            transform:
              'translate3d(var(--tx), var(--ty), 0) rotate(var(--tr)) scale(1)',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'confetti-pop': 'confetti-pop 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
