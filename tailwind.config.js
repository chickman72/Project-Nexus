/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 10px 30px -18px rgba(12, 58, 109, 0.45)"
      }
    }
  },
  plugins: []
};
