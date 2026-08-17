/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './src/renderer/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },
      colors: {
        cinema: {
          black:        '#0a0a0f',
          surface:      '#13131a',
          'surface-hover': '#1a1a24',
          border:       '#1e1e2e',
          muted:        '#6b7280',
          gold:         '#f5c518',
          'gold-dark':  '#d4a10a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinema': 'linear-gradient(135deg, #0a0a0f 0%, #13131a 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(245,197,24,0.15)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
