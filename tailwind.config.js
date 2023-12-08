/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./tailwind-token-library.js')],
  content: [
    './components/**/*.js',
    './components/**/*.liquid',
    './templates/*.liquid',
    './layout/*.liquid',
  ],
  theme: {
    container: {
      center: true,
      screens: {
        DEFAULT: 'none',
      },
    },
    extend: {
      backgroundImage: {
        close: 'var(--close)',
        next: 'var(--next)',
        prev: 'var(--prev)',
      },
      colors: {
        default: '#000000',
        inverse: '#FFFFFF',
      },
      fontFamily: {
        regular: ['example_regular', 'ui-sans-serif', 'system-ui'],
      },
      minHeight: {
        150: '9.375rem',
        200: '12.5rem',
        250: '15.625rem',
        300: '18.75rem',
        350: '21.875rem',
        400: '25rem',
        450: '28.125rem',
        500: '31.25rem',
        550: '34.375rem',
        600: '37.5rem',
        700: '43.75rem',
      },
      maxWidth: {
        panel: '18.75rem',
        container: '90rem',
      },
      minWidth: {
        auto: 'auto',
      },

      opacity: {
        unset: 'unset',
      },
      zIndex: {
        1: 1,
        2: 2,
        3: 3,
        10: 10,
        30: 30,
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
