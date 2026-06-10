/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        merah: "#FC0B12",
        kuning: "#F7CC0C",
        latar: "#121212",
        kartu: "#191919",
      }
    }
  },
  plugins: [],
}
