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
        // Master Veloura Luxury Palette
        'espresso': 'var(--color-espresso, #2A1A12)',
        'deep-walnut': 'var(--color-deep-walnut, #4A2C1A)',
        'walnut': 'var(--color-walnut, #765236)',
        'caramel': 'var(--color-caramel, #A9794F)',
        'sand': 'var(--color-sand, #D8B486)',
        'cream': 'var(--color-cream, #F4E8D7)',
        'ivory': 'var(--color-ivory, #FAF7F2)',
        'taupe': 'var(--color-taupe, #B9AA99)',
        'charcoal': 'var(--color-charcoal, #211915)',

        // Backward compatibility mappings
        'primary-brown': 'var(--color-caramel, #8B5A2B)',
        'deep-brown': 'var(--color-deep-walnut, #4A2C1A)',
        'warm-cream': 'var(--color-cream, #F4E8D7)',
        'soft-beige': 'var(--color-sand, #EADBC8)',
        neutral: {
          0: 'var(--color-neutral-0, #FFFFFF)',
          50: 'var(--color-neutral-50, #FAF7F2)',
          100: 'var(--color-neutral-100, #F4E8D7)',
          200: 'var(--color-neutral-200, #EADBC8)',
          300: 'var(--color-neutral-300, #D8B486)',
          400: 'var(--color-neutral-400, #B9AA99)',
          500: 'var(--color-neutral-500, #765236)',
          600: 'var(--color-neutral-600, #514A43)',
          700: 'var(--color-neutral-700, #4A2C1A)',
          800: 'var(--color-neutral-800, #2A1A12)',
          900: 'var(--color-neutral-900, #211915)',
        },
        success: 'var(--color-success, #557A5A)',
        warning: 'var(--color-warning, #A47A45)',
        error: 'var(--color-error, #A6544D)',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'var(--font-playfair)', '"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['var(--font-cormorant)', 'var(--font-playfair)', '"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        body: ['var(--font-dmsans)', 'var(--font-manrope)', '"DM Sans"', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-dmsans)', 'var(--font-manrope)', '"DM Sans"', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 10px rgba(33, 25, 21, 0.05)',
        'soft-md': '0 8px 24px rgba(33, 25, 21, 0.08)',
        'soft-lg': '0 16px 48px rgba(33, 25, 21, 0.12)',
        'soft-xl': '0 24px 72px rgba(33, 25, 21, 0.16)',
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
