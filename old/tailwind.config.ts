import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    colors: {
      active: '#007ace',
      transparent: 'transparent',
      danger: '#eb3011',
      warning: '#dece22',
      success: '#23a76b',
      primary1: '#7551FF',
      primary2: '#130160',
      primary3: '#000000',
      primary4: '#ffffff',
      secondary1: '#5F5391',
      secondary2: '#BEAFFE',
      secondary3: '#D6CDFE',
      secondary4: '#0D0140',
      secondary5: '#524B6B',
      secondary6: '#DEE1E7',
      tertiary1: '#AAA6B9',
      tertiary2: '#A0A7B1',
      grad1start: '#FBFBFB',
      grad1end: '#FBECFB',
      grad2start: '#140C16',
      grad2end: '#16071B'
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
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans]
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require('tailwindcss-themer')({
      themes: [
        {
          name: 'light',
          extend: {
            // colors: {}
          }
        },
        {
          name: 'dark',
          extend: {
            // colors: {}
          }
        }
      ]
    }),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-hero-patterns'),
    require('tailwindcss-safe-area')
  ]
} satisfies Config;
