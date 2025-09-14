/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'diff-add': '#22c55e',
        'diff-delete': '#ef4444',
        'diff-context': '#64748b',
      }
    },
  },
  plugins: [],
}