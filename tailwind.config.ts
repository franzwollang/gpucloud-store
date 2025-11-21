/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  darkMode: ['class', 'system'],
  prefix: '',
  content: [
    './components/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    colors: {
      active: '#007ace',
      transparent: 'transparent',
      danger: '#eb3011',
      warning: '#dece22',
      success: '#23a76b'
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-hero-patterns'),
    require('tailwindcss-safe-area')
  ]
} satisfies Config;

export default config;
