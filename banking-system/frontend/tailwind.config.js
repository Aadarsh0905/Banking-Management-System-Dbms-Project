// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdbb74', 400: '#f97316', 500: '#ff6600', // Bright orange
          600: '#ff8000', 700: '#ea580c', 800: '#c2410c', 900: '#7c2d12',
        },
        blue: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdbb74', 400: '#f97316', 500: '#ff6600', // Bright orange
          600: '#ff8000', 700: '#ea580c', 800: '#c2410c', 900: '#7c2d12',
          950: '#431407',
        },
        indigo: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdbb74', 400: '#f97316', 500: '#ff6600', // Bright orange
          600: '#ff8000', 700: '#ea580c', 800: '#c2410c', 900: '#7c2d12',
          950: '#431407',
        },
        cyan: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', // Light blue
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
          950: '#082f49',
        },
        sky: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', // Light blue
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 },                   to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: 0, transform: 'scale(0.8)' },       to: { opacity: 1, transform: 'scale(1)' } },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
