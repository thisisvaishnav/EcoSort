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
          green: '#22c55e',
          blue: '#3b82f6',
          red: '#ef4444',
          orange: '#f97316',
          brown: '#a16207',
          cyan: '#06b6d4',
          yellow: '#eab308',
          dark: '#0f172a',
          card: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
