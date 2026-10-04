/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Refined Master Veloura Palette per veloura-living-typography-color-refinement.md
        'deep-brown': 'var(--color-deep-brown, #3B2418)',
        'dark-brown': 'var(--color-dark-brown, #4A2C1A)',
        'warm-brown': 'var(--color-warm-brown, #7A4E2D)',
        'veloura-brown': 'var(--color-veloura-brown, #8B5A2B)',
        'warm-terracotta': 'var(--color-warm-terracotta, #9A633D)',
        'warm-ivory': 'var(--color-warm-ivory, #FBF8F3)',
        'cream': 'var(--color-cream, #F7F0E7)',
        'soft-beige': 'var(--color-soft-beige, #E8D8C5)',
        'veloura-border': 'var(--color-border, #D8C4AD)',
        'muted-text': 'var(--color-muted-text, #735E4E)',

        // Semantic & Legacy Token Mappings
        'espresso': 'var(--color-deep-brown, #3B2418)',
        'deep-walnut': 'var(--color-dark-brown, #4A2C1A)',
        'walnut': 'var(--color-warm-brown, #7A4E2D)',
        'caramel': 'var(--color-veloura-brown, #8B5A2B)',
        'sand': 'var(--color-soft-beige, #E8D8C5)',
        'ivory': 'var(--color-warm-ivory, #FBF8F3)',
        'taupe': 'var(--color-muted-text, #735E4E)',
        'charcoal': 'var(--color-deep-brown, #3B2418)',

        'primary-brown': 'var(--color-veloura-brown, #8B5A2B)',
        'warm-cream': 'var(--color-cream, #F7F0E7)',

        neutral: {
          0: 'var(--color-neutral-0, #FFFFFF)',
          50: 'var(--color-neutral-50, #FBF8F3)',
          100: 'var(--color-neutral-100, #F7F0E7)',
          200: 'var(--color-neutral-200, #E8D8C5)',
          300: 'var(--color-neutral-300, #D8C4AD)',
          400: 'var(--color-neutral-400, #B9AA99)',
          500: 'var(--color-neutral-500, #7A4E2D)',
          600: 'var(--color-neutral-600, #735E4E)',
          700: 'var(--color-neutral-700, #4A2C1A)',
          800: 'var(--color-neutral-800, #3B2418)',
          900: 'var(--color-neutral-900, #2A1A12)',
        },
        success: 'var(--color-success, #557A5A)',
        warning: 'var(--color-warning, #A47A45)',
        error: 'var(--color-error, #A6544D)',
      },
      fontFamily: {
        display: ['var(--font-instrument-serif)', 'var(--font-cormorant)', 'var(--font-playfair)', '"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['var(--font-instrument-serif)', 'var(--font-cormorant)', 'var(--font-playfair)', '"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['var(--font-instrument-sans)', 'var(--font-dmsans)', 'var(--font-manrope)', '"Instrument Sans"', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-instrument-sans)', 'var(--font-dmsans)', 'var(--font-manrope)', '"Instrument Sans"', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 10px rgba(59, 36, 24, 0.04)',
        'soft-md': '0 8px 24px rgba(59, 36, 24, 0.07)',
        'soft-lg': '0 16px 48px rgba(59, 36, 24, 0.10)',
        'soft-xl': '0 24px 72px rgba(59, 36, 24, 0.14)',
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
