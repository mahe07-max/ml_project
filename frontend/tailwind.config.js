/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agri: {
          green: '#247a52',
          dark: '#173a2b',
          cream: '#f7f8f2',
          accent: '#e5f1e7',
          gold: '#e8b354',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(16, 62, 38, 0.08)',
      },
    },
  },
  plugins: [],
};
