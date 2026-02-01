/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zara-like premium palette
        brand: {
          offwhite: '#FAFAFA',
          white: '#FFFFFF',
          black: '#1A1A1A',
          darkgray: '#2A2A2A',
          gray: '#6B6B6B',
          lightgray: '#E5E5E5',
          border: '#D4D4D4',
        },
        accent: {
          red: '#CC0000',
          sale: '#E63946',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Typography scale
        'micro': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }], // 10px - uppercase labels
        'caption': ['0.75rem', { lineHeight: '1rem' }], // 12px
        'body': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }], // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['2rem', { lineHeight: '2.5rem' }], // 32px
        '4xl': ['2.5rem', { lineHeight: '3rem' }], // 40px
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
