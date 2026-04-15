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
          primary: '#080b14',
          secondary: '#0f1424',
          card: '#131929',
          elevated: '#1a2035',
          border: 'rgba(255,255,255,0.07)',
        },
        brand: {
          DEFAULT: '#00c27c',
          dark: '#009e64',
          light: '#33d494',
          muted: 'rgba(0,194,124,0.12)',
        },
        gain: '#22c55e',
        'gain-muted': 'rgba(34,197,94,0.12)',
        loss: '#ef4444',
        'loss-muted': 'rgba(239,68,68,0.12)',
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        type: {
          liquidity: '#60a5fa',
          crypto: '#f59e0b',
          stock: '#34d399',
          etf: '#a78bfa',
          savings: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,194,124,0.2)',
        glow: '0 0 20px rgba(0,194,124,0.15)',
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
