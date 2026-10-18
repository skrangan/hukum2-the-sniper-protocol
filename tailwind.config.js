/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tanglish: {
          gold: "#FACC15",
          cyan: "#38BDF8",
          dark: "#0F172A",
          accent: "#EF4444"
        }
      },
      fontFamily: {
        display: ['Impact', 'Trebuchet MS', 'sans-serif'],
        dialogue: ['Rajdhani', 'Segoe UI', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' }
        }
      }
    },
  },
  plugins: [],
}
