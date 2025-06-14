/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      
      boxShadow: {
        'custom-purple': '0 10px 30px rgba(128, 0, 128, 0.5)', 
        'custom-purple-lg': '0 20px 60px rgba(128, 0, 128, 0.7)', 
        'glow': '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)', 
      },
      animation: {
        'gradient-shift': 'gradient-shift 10s ease infinite alternate', 
        'text-shine': 'text-shine 3s ease-in-out infinite alternate', 
        'bounce-icon': 'bounce-icon 0.3s ease-in-out', 
      },
      keyframes: {
        'gradient-shift': {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' },
        },
        'text-shine': {
          '0%': { 'text-shadow': 'none' },
          '50%': { 'text-shadow': '0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)' },
          '100%': { 'text-shadow': 'none' },
        },
        'bounce-icon': {
          '0%, 100%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
    },
  },
  plugins: [],
}