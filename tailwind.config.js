/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          // CSS vars use space-separated RGB so Tailwind can inject alpha: rgb(R G B / alpha)
          primary:   'rgb(var(--bg-primary)   / <alpha-value>)',
          secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
          card:      'rgb(var(--bg-card)      / <alpha-value>)',
          elevated:  'rgb(var(--bg-elevated)  / <alpha-value>)',
          border:    'var(--bg-border)',  // already includes alpha, no modifier needed
        },
        brand: {
          DEFAULT: 'rgb(var(--brand)       / <alpha-value>)',
          dark:    'rgb(var(--brand-dark)  / <alpha-value>)',
          light:   'rgb(var(--brand-light) / <alpha-value>)',
          muted:   'rgb(var(--brand)       / 0.12)',
        },
        gain:       'rgb(var(--gain) / <alpha-value>)',
        'gain-muted': 'rgb(var(--gain) / 0.12)',
        loss:       'rgb(var(--loss) / <alpha-value>)',
        'loss-muted': 'rgb(var(--loss) / 0.12)',
        text: {
          primary:   'rgb(var(--text-primary)   / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--text-muted)     / <alpha-value>)',
        },
        // Investment type colors — static, don't change with theme
        type: {
          liquidity: '#60a5fa',
          crypto:    '#f59e0b',
          stock:     '#34d399',
          etf:       '#a78bfa',
          savings:   '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgb(var(--brand) / 0.2)',
        glow:       '0 0 20px rgb(var(--brand) / 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
