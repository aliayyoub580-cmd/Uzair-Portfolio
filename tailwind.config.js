/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0A0F1E',
        neon: '#4CC9F0',
        violet: '#7C3AED',
        cyan: '#22D3EE',
      },
      boxShadow: {
        glow: '0 0 60px rgba(76, 201, 240, 0.25)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
