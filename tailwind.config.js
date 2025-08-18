/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1A202C', // Example primary color
        'secondary': '#74BB76', // Your new secondary color
      },
    },
  },
  plugins: [],
}