// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        secondary: "#a0aec0", // warna tambahan yang kita pakai
      },
    },
  },
  plugins: [],
}
