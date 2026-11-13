/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agri: {
          green: '#1f8f5f',
          dark: '#163c2e',
          cream: '#f7f9f4',
          accent: '#dff5e7',
          gold: '#f3b73d',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(16, 62, 38, 0.08)',
      },
    },
  },
  plugins: [],
};
