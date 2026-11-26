/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/main/resources/static/**/*.html',
    './src/main/resources/static/js/**/*.js'
  ],
  theme: { extend: {} },
  plugins: []
};
