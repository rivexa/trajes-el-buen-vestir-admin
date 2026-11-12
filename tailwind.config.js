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
        grisClaro: '#F4F1EC',
        plomoSuave: '#F2F2F2',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(17, 17, 17, 0.04), 0 10px 28px rgba(17, 17, 17, 0.06)',
        sidebar: '4px 0 24px rgba(17, 17, 17, 0.04)',
      },
    },
  },
  plugins: [],
}
