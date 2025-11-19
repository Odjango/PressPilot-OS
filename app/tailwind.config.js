/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ["system-ui", "ui-sans-serif", "sans-serif"],
        },
        borderRadius: {
          "2xl": "1.25rem",
        },
      },
    },
    plugins: [],
  };
  