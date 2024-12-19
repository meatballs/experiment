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
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        secondary: '#1F2937',
        background: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        surface: {
          light: '#F3F4F6',
          dark: '#1F2937',
        },
        text: {
          light: '#1F2937',
          dark: '#F9FAFB',
        },
        muted: {
          light: '#6B7280',
          dark: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
