/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        redhatdisplay: ['"Red Hat Display"', 'sans-serif'],
        heading: ['"Red Hat Display"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        text: {
          default: '#06384D',
          secondary: '#0F8F9E',
          tertiary: '#EB8E89',
        },
        surface: {
          default: '#FFFFFF',
          secondary: '#F7F7F7',
        },
        border: {
          muted: '#E9E9E9',
        },
        button: {
          'bg-primary': '#EB8E89',
          'bg-secondary': '#06384D',
        },
      },
    },
  },
  plugins: [],
}
