/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2dd4bf', // Teal 400
          DEFAULT: '#0f766e', // Teal 700 (Deep Medical Teal)
          dark: '#115e59', // Teal 800
        },
        secondary: {
          light: '#bae6fd', // Sky 200
          DEFAULT: '#0ea5e9', // Sky 500
          dark: '#0369a1', // Sky 700
        },
        accent: {
          light: '#ecfeff', // Cyan 50
          DEFAULT: '#cffafe', // Cyan 100
        },
        danger: '#ef4444', // Red 500
        success: '#10b981', // Emerald 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }
    },
  },
  plugins: [],
}
