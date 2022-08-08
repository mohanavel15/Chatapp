/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [ "./src/**/*.{js,jsx,ts,tsx}", "./public/index.html" ],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray : {
          900: "#202225",
          800: "#292b2f",
          700: "#2f3136",
          600: "#36393f",
          500: "#41454c",
          400: "#84868a",
        },
      },
    },
  },
  plugins: [],
  mode: 'jit',
}
