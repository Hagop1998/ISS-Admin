/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    preflight: false, // Disable Tailwind's preflight to avoid conflicts with antd
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#e8d5ff',
          200: '#d4b3ff',
          300: '#b886ff',
          400: '#9a5aff',
          500: '#7c3aff',
          600: '#3C0056',
          700: '#2d0040',
          800: '#1f002b',
          900: '#120019',
        },
        dark: {
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
    },
  },
  plugins: [],
}

