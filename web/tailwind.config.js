/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [ "./src/**/*.{js,jsx,ts,tsx}", "./public/index.html" ],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  mode: 'jit',
}
