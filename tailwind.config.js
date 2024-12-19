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
        // Polar Night
        nord0: '#2E3440',
        nord1: '#3B4252',
        nord2: '#434C5E',
        nord3: '#4C566A',
        // Snow Storm
        nord4: '#D8DEE9',
        nord5: '#E5E9F0',
        nord6: '#ECEFF4',
        // Frost
        nord7: '#8FBCBB',
        nord8: '#88C0D0',
        nord9: '#81A1C1',
        nord10: '#5E81AC',
        // Aurora
        nord11: '#BF616A',
        nord12: '#D08770',
        nord13: '#EBCB8B',
        nord14: '#A3BE8C',
        nord15: '#B48EAD',
        // Aliases for semantic usage
        primary: {
          DEFAULT: '#88C0D0', // nord8
          dark: '#81A1C1', // nord9
        },
        secondary: '#2E3440', // nord0
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
