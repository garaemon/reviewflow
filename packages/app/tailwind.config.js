/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/ui/index.html",
    "./src/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'diff-add': '#22c55e',
        'diff-delete': '#ef4444',
        'diff-context': '#64748b',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        '3xs': ['9px', '12px'],
        '4xs': ['8px', '11px'],
        '5xs': ['7px', '10px'],
      },
      spacing: {
        '0.25': '1px',
        '0.75': '3px',
      },
      lineHeight: {
        'extra-tight': '1.1',
        'super-tight': '1.0',
      },
    },
  },
  plugins: [],
}