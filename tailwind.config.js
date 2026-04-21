/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/**/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './blocks/**/*.liquid',
    './assets/*.js',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    fontFamily: {
      sans: ['Oxygen', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['"Playfair Display"', 'ui-serif', 'system-ui', 'serif'],
    },
    fontSize: {
      '2xs': ['10px', '14px'],
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '26px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '48px'],
      '6xl': ['60px', '60px'],
      '7xl': ['80px', '80px'],
    },
    extend: {
      screens: {
        '3xl': '1680px',
        '4xl': '1920px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
        '11xl': '112rem',
        '12xl': '120rem',
        '13xl': '128rem',
        '14xl': '136rem',
        '15xl': '144rem',
        '16xl': '152rem',
        '17xl': '160rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      colors: {
        clubhouse: {
          green: {
            200: '#E4EEE8',
            600: '#3D7250',
            800: '#234A31',
          },
        },
        taupe: {
          100: '#F6F5F2',
          300: '#EEECE8',
          400: '#E3E1DC',
          600: '#B8B5AA',
          700: '#6D6C64',
          900: '#35342F',
        },
      },
      borderWidth: {
        3: '3px',
      },
      ringWidth: {
        3: '3px',
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
      },
      backgroundImage: {
        facebook: 'linear-gradient(to bottom right, #1877F2, #145DBF)',
        instagram: 'linear-gradient(to bottom right, #F58529, #DD2A7B, #515BD4)',
        x: 'linear-gradient(to bottom right, #000000, #1DA1F2)',
        trendy: 'linear-gradient(to bottom right, #3D7250, #234A31)',
      },
      aspectRatio: {
        mobile: '9 / 16',
        tablet: '11 / 9',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.transition-height': {
          transitionProperty: 'height',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '300ms',
        },
      });
    },
    function ({ addComponents }) {
      addComponents({
        '.container-wide': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '1920px',
          '@screen lg': { paddingLeft: '2rem', paddingRight: '2rem' },
        },
        '.container-narrow': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '960px',
          '@screen lg': { paddingLeft: '2rem', paddingRight: '2rem' },
        },
      });
    },
  ],
};
