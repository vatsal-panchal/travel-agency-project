/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#172D3A',
          50: '#F2F6F7',
          100: '#E3ECEE',
          200: '#C9D9DD',
          300: '#5C747C',
          400: '#526B73',
          500: '#445E67',
          600: '#354F59',
          700: '#293F49',
          800: '#223944',
          900: '#172D3A',
          950: '#0D202A',
        },
        cream: {
          50: '#FFFFFF',
          100: '#F5F8F8',
          200: '#EAF1F2',
          300: '#DDE8EA',
          400: '#C9D9DC',
        },
        forest: {
          DEFAULT: '#176B70',
          light: '#25858A',
          deep: '#123B47',
        },
        moss: {
          DEFAULT: '#287A68',
          light: '#55A28F',
        },
        clay: {
          50: '#FFF4EF',
          100: '#FCE4DA',
          200: '#F6C8B7',
          300: '#F0A08C',
          400: '#D97459',
          500: '#BB4E39',
          600: '#A94432',
          700: '#84362B',
          800: '#682A24',
          900: '#4C211E',
        },
        sand: '#E4EDF0',
        slate: {
          50: '#F6F8F9',
          100: '#EBF0F1',
          200: '#D9E2E4',
          300: '#C0CED1',
          400: '#96A8AD',
          500: '#72868C',
          600: '#586E75',
          700: '#41575F',
          800: '#2D424B',
          900: '#1D3039',
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
        soft: '0 2px 12px -4px rgba(23, 45, 58, 0.08)',
        card: '0 18px 45px -24px rgba(23, 45, 58, 0.24)',
        lift: '0 30px 70px -30px rgba(23, 45, 58, 0.3)',
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
