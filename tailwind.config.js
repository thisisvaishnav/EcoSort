/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          green: '#16a34a',
          emerald: '#10b981',
          lime: '#84cc16',
          blue: '#0284c7',
          cyan: '#06b6d4',
          yellow: '#facc15',
          amber: '#f59e0b',
          orange: '#f97316',
          coral: '#fb923c',
          red: '#ef4444',
          rose: '#f43f5e',
          cream: '#fbf9f4',
          paper: '#f5f2e9',
          dark: '#0f172a',
          card: '#1e293b'
        }
      },
      fontFamily: {
        /* Manrope replaces Inter as the approved body font (landing-page-design skill B1) */
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        fun: ['Fredoka', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px #0f172a',
        'retro': '4px 4px 0px #0f172a',
        'retro-md': '5px 5px 0px #0f172a',
        'retro-lg': '6px 6px 0px #0f172a',
        'retro-xl': '8px 8px 0px #0f172a',
        'retro-2xl': '12px 12px 0px #0f172a',
        'retro-white': '4px 4px 0px #ffffff',
      },
      transitionTimingFunction: {
        /* Emil Kowalski animation curves */
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'strong-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'strong-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}
