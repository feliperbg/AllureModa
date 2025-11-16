const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'allure-beige': '#F7F3EF', // Fundo principal
        'allure-black': '#1A1A1A', // Texto principal e fundos escuros
        'allure-gold': '#BFA181',  // Destaques de luxo (ex: no footer)
        'allure-grey': '#6B7280', // Texto secundário
      },
      fontFamily: {
        // Fonte serifada para títulos e o logo (ALLURE)
        serif: ['"Playfair Display"', ...fontFamily.serif],
        // Fonte sans-serif para corpo de texto (legibilidade)
        sans: ['Inter', ...fontFamily.sans],
        // Fonte cursiva para destaques (como "Nossa Missão")
        cursive: ['"Dancing Script"', ...fontFamily.serif],

        sansSerif: ['"Open Sans"', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
