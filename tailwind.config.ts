import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ces couleurs utilisent les CSS variables — elles changent avec le theme
        navy: {
          '500': 'var(--navy-500)',
          '600': 'var(--navy-600)',
          '700': 'var(--navy-700)',
          '800': 'var(--navy-800)',
          '900': 'var(--navy-900)',
        },
        // Couleurs semantiques
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-input': 'var(--bg-input)',
        'border-theme': 'var(--border)',
        orange: {
          DEFAULT: 'var(--orange)',
          400: '#FF8A60',
          500: 'var(--orange)',
          600: 'var(--orange-deep)',
        },
      },
      fontFamily: {
        display: ['var(--font-rajdhani)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
