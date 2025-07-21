/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#DC2626',
          dark: '#991B1B',
          light: '#FEE2E2',
        },
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        'noto-sans-jp': ['var(--font-noto-sans-jp)', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      },
      animation: {
        'vote-bounce': 'vote-bounce 0.3s ease-in-out',
      },
      keyframes: {
        'vote-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}