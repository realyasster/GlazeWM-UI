/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glaze: {
          dark: '#0f1117',
          darker: '#090a0f',
          card: '#161922',
          cardHover: '#1d222e',
          border: '#272d3d',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
