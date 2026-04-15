import type { Currency } from '@/types'
import { CURRENCIES } from './constants'

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  if (currency === 'BTC') return `₿ ${amount.toFixed(8)}`
  if (currency === 'ETH') return `Ξ ${amount.toFixed(6)}`

  const noDecimals = currency === 'UYU' || currency === 'ARS'
  const locale = currency === 'UYU' || currency === 'ARS' ? 'es-UY' : 'en-US'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    }).format(amount)
  } catch {
    const sym = CURRENCIES.find(c => c.value === currency)?.symbol ?? currency
    return `${sym} ${amount.toLocaleString('es-UY')}`
  }
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatUnits(units: number, decimals = 4): string {
  if (units >= 1000) return units.toLocaleString('es-UY', { maximumFractionDigits: 2 })
  return units.toFixed(decimals).replace(/\.?0+$/, '')
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-UY', { day: '2-digit', month: 'short' })
}

export function formatLargeNumber(amount: number, currency: Currency = 'USD'): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const sym = CURRENCIES.find(c => c.value === currency)?.symbol ?? currency

  if (currency === 'BTC' || currency === 'ETH') return formatCurrency(amount, currency)

  if (abs >= 1_000_000_000) return `${sign}${sym} ${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}${sym} ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${sym} ${(abs / 1_000).toFixed(1)}K`
  return formatCurrency(amount, currency)
}
