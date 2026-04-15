import type { InvestmentType, Currency } from '@/types'

export const INVESTMENT_TYPES: Record<InvestmentType, {
  label: string
  emoji: string
  color: string
  tailwind: string
  description: string
}> = {
  liquidity_fund: {
    label: 'Fondo de Liquidez',
    emoji: '💧',
    color: '#60a5fa',
    tailwind: 'text-type-liquidity bg-blue-500/10 border-blue-500/20',
    description: 'Fondos money market y de liquidez inmediata',
  },
  crypto: {
    label: 'Cripto',
    emoji: '₿',
    color: '#f59e0b',
    tailwind: 'text-type-crypto bg-amber-500/10 border-amber-500/20',
    description: 'Bitcoin, Ethereum y otras criptomonedas',
  },
  stock: {
    label: 'Acciones',
    emoji: '📈',
    color: '#34d399',
    tailwind: 'text-type-stock bg-emerald-500/10 border-emerald-500/20',
    description: 'Acciones de empresas en bolsa',
  },
  etf: {
    label: 'ETF',
    emoji: '🏦',
    color: '#a78bfa',
    tailwind: 'text-type-etf bg-violet-500/10 border-violet-500/20',
    description: 'Exchange-Traded Funds (índices, sectores)',
  },
  savings: {
    label: 'Cuenta de Ahorro',
    emoji: '🏛️',
    color: '#38bdf8',
    tailwind: 'text-type-savings bg-sky-500/10 border-sky-500/20',
    description: 'Cajas de ahorro, plazos fijos, cuentas remuneradas',
  },
}

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'ARS', label: 'Peso Argentino', symbol: '$' },
  { value: 'USD', label: 'Dólar Estadounidense', symbol: 'US$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'BTC', label: 'Bitcoin', symbol: '₿' },
  { value: 'ETH', label: 'Ethereum', symbol: 'Ξ' },
]

export const TRANSACTION_TYPES: Record<string, { label: string; color: string }> = {
  buy: { label: 'Compra', color: 'text-gain' },
  sell: { label: 'Venta', color: 'text-loss' },
  deposit: { label: 'Depósito', color: 'text-gain' },
  withdrawal: { label: 'Retiro', color: 'text-loss' },
  dividend: { label: 'Dividendo', color: 'text-brand' },
}

export const CHART_COLORS = [
  '#60a5fa', // liquidity - blue
  '#f59e0b', // crypto - amber
  '#34d399', // stock - green
  '#a78bfa', // etf - violet
  '#38bdf8', // savings - sky
]
