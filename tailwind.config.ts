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
      // Custom container width utilities from design tokens
      maxWidth: {
        'content': 'var(--container-content)',   // 1200px - main content
        'wide': 'var(--container-wide)',         // 1440px - marketing/hero
        'narrow': 'var(--container-narrow)',     // 860px - focused reading
        'section': 'var(--container-section)',   // 1280px - section containers
        'fd-layout': 'var(--fd-layout-width)',   // Fumadocs layout width
      },
      // Custom typography utilities from design tokens
      fontSize: {
        // Heading utilities with font-weight and line-height
        'h1': ['var(--text-h1)', {
          lineHeight: 'var(--text-h1-line-height)',
          fontWeight: 'var(--text-h1-weight)'
        }],
        'h2': ['var(--text-h2)', {
          lineHeight: 'var(--text-h2-line-height)',
          fontWeight: 'var(--text-h2-weight)'
        }],
        'h3': ['var(--text-h3)', {
          lineHeight: 'var(--text-h3-line-height)',
          fontWeight: 'var(--text-h3-weight)'
        }],
        'h4': ['var(--text-h4)', {
          lineHeight: 'var(--text-h4-line-height)',
          fontWeight: 'var(--text-h4-weight)'
        }],
        'h5': ['var(--text-h5)', {
          lineHeight: 'var(--text-h5-line-height)',
          fontWeight: 'var(--text-h5-weight)'
        }],
        'h6': ['var(--text-h6)', {
          lineHeight: 'var(--text-h6-line-height)',
          fontWeight: 'var(--text-h6-weight)'
        }],
        // Fumadocs font sizes
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
      // Custom shadow utilities from design tokens
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
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
      lineHeight: {
        'fd-tight': 'var(--fd-line-height-tight)',
        'fd-normal': 'var(--fd-line-height-normal)',
        'fd-relaxed': 'var(--fd-line-height-relaxed)',
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
    function({ addBase }: { addBase: any }) {
      addBase({
        '.udo-content table, .prose table, table:not(.shadcn-data-table table):not(.shadcn-data-table *)': {
          margin: '0 !important',
          marginTop: '0 !important',
          marginBottom: '0 !important',
        },
      });
    },
    function({ addComponents }: { addComponents: any }) {
      addComponents({
        // Override Fumadocs article max-width from 860px to 1200px
        'article[data-component-name="PageArticle"]': {
          maxWidth: '1200px !important',
        },
        'main article': {
          maxWidth: '1200px !important',
        },
        'article.max-w-\\[860px\\]': {
          maxWidth: '1200px !important',
        },
      });
    },
  ],
} satisfies Config;