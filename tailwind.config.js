/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 🎨 basePalette
        primary: {
          DEFAULT: '#AB1010',
          light: '#C94A4A',
          lighter: '#E28989',
          dark: '#8A0D0D',
          darker: '#690A0A',
        },
        grey: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        white: '#FFFFFF',
        black: '#000000',

        // 🎨 objectPalette
        red: {
          DEFAULT: '#FF595E',
          light: '#FF7D81',
          lightest: '#FFB3B5',
        },
        orange: {
          DEFAULT: '#FF924C',
          light: '#FFAD75',
          lightest: '#FFD1AD',
        },
        amber: {
          DEFAULT: '#FFCA3A',
          light: '#FFD766',
          lightest: '#FFE8A3',
        },
        lime: {
          DEFAULT: '#C5CA30',
          light: '#D6DB5A',
          lightest: '#E9EE9B',
        },
        green: {
          DEFAULT: '#8AC926',
          light: '#A3D94F',
          lightest: '#C7EB94',
        },
        cyan: {
          DEFAULT: '#36949D',
          light: '#5AB0B9',
          lightest: '#9ED5DA',
        },
        blue: {
          DEFAULT: '#1982C4',
          light: '#4D9ED1',
          lightest: '#95C6E3',
        },
        indigo: {
          DEFAULT: '#4267AC',
          light: '#6887C1',
          lightest: '#A3B3D9',
        },
        violet: {
          DEFAULT: '#565AA0',
          light: '#7A7EB7',
          lightest: '#B1B4D6',
        },
        purple: {
          DEFAULT: '#6A4C93',
          light: '#8A71AC',
          lightest: '#B6A2CD',
        },
      },
    },
  },
  plugins: [],
};
