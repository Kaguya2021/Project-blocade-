/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blocade: {
          bg: '#171714',
          surface: '#22211D',
          green: '#55C879',
          gold: '#E9C56B',
          text: '#F4F1E8',
          muted: '#AAA69A'
        }
      }
    }
  },
  plugins: []
};
