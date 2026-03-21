/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Mango, Orange, and Green
        mango: '#FDB813', 
        orange: {
          light: '#F97316',
          DEFAULT: '#EA580C',
          dark: '#C2410C',
        },
        green: {
          light: '#4ADE80',
          DEFAULT: '#22C55E',
          dark: '#15803D',
        },
      },
    },
  },
  plugins: [],
}