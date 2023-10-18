/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./views/*.{ejs,js}'],
    safelist: [
      {
        pattern: /(bg|border|text|accent)-(red|orange|lime|emerald|teal|sky|blue|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800)/,
        variants: ['hover', 'file', 'file:hover', 'placeholder']
      },
    ],
    theme: {
      extend: {
        keyframes: {
          notification: {
            '0%': { opacity: '1'},
            '50%': { opacity: '1'},
            '100%': { opacity: '0'}
          }
        },
        animation: {
          notification: 'notification 3s linear'
        },
      },
    },
    plugins: [],
  }
  
  