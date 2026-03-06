/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          soft: '#E8F5E9',
        },
        accent: {
          DEFAULT: '#8BC34A',
        },
        warning: {
          DEFAULT: '#FFC107',
        },
        background: {
          DEFAULT: '#F4FBF4',
        },
        card: {
          DEFAULT: '#FFFFFF',
        },
        text: {
          primary: '#1B5E20',
          secondary: '#4E6E4E',
          muted: '#6B8F6B',
        },
        border: {
          DEFAULT: '#DCEEDC',
          hover: '#E0F2E0',
        },
        // Legacy colors pointing to new theme where appropriate for fallback
        surface: {
          DEFAULT: '#F4FBF4',
          1: '#FFFFFF',
          2: '#F4FBF4',
          3: '#E8F5E9',
          4: '#DCEEDC',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(46, 125, 50, 0.15)',
        'glow-green': '0 0 20px rgba(46, 125, 50, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'fade-slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(46, 125, 50, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
