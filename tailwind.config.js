/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rojoMarca: '#C1121F',
        vino: '#722F37',
        negro: '#111111',
        grisMarca: '#333333',
        grisClaro: '#F8F9FA'
      }
    },
  },
  plugins: [],
}