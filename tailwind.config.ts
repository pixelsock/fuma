import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './mdx-components.tsx',
    './node_modules/fumadocs-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors for backward compatibility
        black: 'var(--black)',
        'midnight-blue': 'var(--midnight-blue)',
        'light-grey': 'var(--light-grey)',
        white: 'var(--white)',
        teal: 'var(--teal)',
        'sandy-brown': 'var(--sandy-brown)',
        'dim-grey': 'var(--dim-grey)',
        'slate-blue': 'var(--slate-blue)',
        // Charlotte UDO theme colors using new Fumadocs variables
        charlotte: {
          blue: 'hsl(var(--charlotte-blue))',
          purple: 'hsl(var(--charlotte-purple))',
          teal: 'hsl(var(--charlotte-teal))',
          green: 'hsl(var(--charlotte-green))',
          orange: 'hsl(var(--charlotte-orange))',
          'light-blue': 'hsl(var(--charlotte-light-blue))',
          'blue-gray': 'hsl(var(--charlotte-blue-gray))',
          'dark-gray': 'hsl(var(--charlotte-dark-gray))',
          'light-gray': 'hsl(var(--charlotte-light-gray))',
        },
      },
      borderRadius: {
        lg: 'var(--fd-radius)',
        md: 'calc(var(--fd-radius) - 2px)',
        sm: 'calc(var(--fd-radius) - 4px)',
      },
      spacing: {
        'fd-xs': 'var(--fd-spacing-xs)',
        'fd-sm': 'var(--fd-spacing-sm)',
        'fd-md': 'var(--fd-spacing-md)',
        'fd-lg': 'var(--fd-spacing-lg)',
        'fd-xl': 'var(--fd-spacing-xl)',
        'fd-2xl': 'var(--fd-spacing-2xl)',
        'fd-3xl': 'var(--fd-spacing-3xl)',
      },
      fontSize: {
        'fd-xs': 'var(--fd-font-size-xs)',
        'fd-sm': 'var(--fd-font-size-sm)',
        'fd-base': 'var(--fd-font-size-base)',
        'fd-lg': 'var(--fd-font-size-lg)',
        'fd-xl': 'var(--fd-font-size-xl)',
        'fd-2xl': 'var(--fd-font-size-2xl)',
        'fd-3xl': 'var(--fd-font-size-3xl)',
        'fd-4xl': 'var(--fd-font-size-4xl)',
        'fd-5xl': 'var(--fd-font-size-5xl)',
      },
      lineHeight: {
        'fd-tight': 'var(--fd-line-height-tight)',
        'fd-normal': 'var(--fd-line-height-normal)',
        'fd-relaxed': 'var(--fd-line-height-relaxed)',
      },
      maxWidth: {
        'fd-layout': 'var(--fd-layout-width)',
      },
      height: {
        'fd-nav': 'var(--fd-nav-height)',
      },
      width: {
        'fd-sidebar': 'var(--fd-sidebar-width)',
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        '.udo-content table, .prose table, table:not(.shadcn-data-table table):not(.shadcn-data-table *)': {
          margin: '0 !important',
          marginTop: '0 !important',
          marginBottom: '0 !important',
        },
      });
    },
  ],
} satisfies Config;