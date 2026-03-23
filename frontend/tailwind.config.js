/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/*.{html,js}','./src/**/*.{html,js}', './index.html',],
  theme: {
    extend: {
      // Same stacks as indextemp.css `.big_text` / `.small_text` (reliable vs long arbitrary `font-[...]`)
      fontFamily: {
        'info-title': ['"IBM Plex Sans"', '"Open Sans"', '"Lato"', 'sans-serif'],
        'info-body': ['Heebo', 'sans-serif'],
      },
      // Menubar mobile top bar was 120px — use scale token instead of h-[120px]
      spacing: {
        30: '7.5rem',
      },
    },
  },
  plugins: [],
}
