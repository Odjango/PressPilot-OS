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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        cream: "#F9F9F5",
        black: "#000000",
        dark: "#333333",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      animation: {
        'draw': 'draw 1s forwards',
      },
      keyframes: {
        draw: {
          '0%': { width: '0%', opacity: '0' },
          '100%': { width: '100%', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
