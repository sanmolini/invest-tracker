'use client'

import { useState, useMemo } from 'react'
import { saveMultipleSnapshots } from '@/app/actions/snapshots'
import { TypeBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits } from '@/lib/formatting'
import type { InvestmentWithData } from '@/types'
import { INVESTMENT_TYPES } from '@/lib/constants'
import clsx from 'clsx'

interface Props {
  investments: InvestmentWithData[]
}

// price key: ticker (uppercase) for unit-based-with-ticker, else investment id
function priceKey(inv: InvestmentWithData): string {
  return inv.is_unit_based && inv.ticker ? inv.ticker.toUpperCase() : inv.id
}

export function PriceUpdateForm({ investments }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    investments.forEach(inv => {
      const k = priceKey(inv)
      if (m[k]) return // already set by another investment sharing the same ticker
      if (inv.is_unit_based) {
        m[k] = inv.current_unit_price ? inv.current_unit_price.toFixed(4) : ''
      } else {
        m[k] = inv.current_value > 0 ? inv.current_value.toFixed(2) : ''
      }
    })
    return m
  })

  const setPrice = (key: string, value: string) =>
    setPrices(prev => ({ ...prev, [key]: value }))

  function buildSnapshots() {
    return investments.flatMap(inv => {
      const k = priceKey(inv)
      const raw = parseFloat(prices[k] ?? '')
      if (isNaN(raw) || raw <= 0) return []
      if (inv.is_unit_based) {
        if (!inv.total_units) return []
        return [{ investment_id: inv.id, date, unit_price: raw, total_value: inv.total_units * raw }]
      }
      return [{ investment_id: inv.id, date, total_value: raw }]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const snapshots = buildSnapshots()
    if (!snapshots.length) { setError('Ingresá al menos un valor'); return }
    setLoading(true)
    setError('')
    try {
      await saveMultipleSnapshots(snapshots)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const byType = useMemo(() =>
    Object.entries(INVESTMENT_TYPES).reduce<Record<string, InvestmentWithData[]>>(
      (acc, [type]) => {
        const invs = investments.filter(i => i.type === type)
        if (invs.length) acc[type] = invs
        return acc
      }, {}
    ), [investments])

  // Within a type, group unit-based-with-ticker by ticker; rest are solo rows
  function splitGroup(invs: InvestmentWithData[]) {
    const tickerMap: Record<string, InvestmentWithData[]> = {}
    const solos: InvestmentWithData[] = []
    invs.forEach(inv => {
      if (inv.is_unit_based && inv.ticker) {
        const t = inv.ticker.toUpperCase()
        if (!tickerMap[t]) tickerMap[t] = []
        tickerMap[t].push(inv)
      } else {
        solos.push(inv)
      }
    })
    return { tickerMap, solos }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div className="card p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
          Fecha de actualización
        </label>
        <input
          type="date"
          className="input-base max-w-xs"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {Object.entries(byType).map(([type, invs]) => {
        const { tickerMap, solos } = splitGroup(invs)
        return (
          <div key={type} className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-bg-border bg-bg-secondary">
              <TypeBadge type={type as any} />
            </div>
            <div className="divide-y divide-bg-border">

              {/* ── Ticker groups: one price input propagates to all positions ── */}
              {Object.entries(tickerMap).map(([ticker, tickerInvs]) => {
                const up = parseFloat(prices[ticker] ?? '')
                const hasPrice = !isNaN(up) && up > 0

                return (
                  <div key={ticker} className="px-5 py-4">
                    {/* Ticker header + price input */}
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="font-mono font-bold text-text-primary">{ticker}</div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {tickerInvs.length} posición{tickerInvs.length > 1 ? 'es' : ''}
                        </div>
                      </div>
                      <div>
                        <label className="label-base">Precio por unidad</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="input-base font-mono w-44"
                          placeholder="0.00"
                          value={prices[ticker] ?? ''}
                          onChange={e => setPrice(ticker, e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sub-rows per investment, computed total is read-only */}
                    <div className="mt-3 space-y-2.5 pl-4 border-l-2 border-bg-border">
                      {tickerInvs.map(inv => {
                        const computed = hasPrice && inv.total_units != null
                          ? inv.total_units * up
                          : null
                        const pnl = computed != null && inv.total_invested > 0
                          ? ((computed - inv.total_invested) / inv.total_invested) * 100
                          : null

                        return (
                          <div key={inv.id} className="flex items-center justify-between gap-3 text-sm flex-wrap">
                            <div>
                              <span className="font-medium text-text-primary">{inv.name}</span>
                              <span className="text-xs text-text-muted ml-2">
                                {inv.total_units != null ? `${formatUnits(inv.total_units)} u · ` : ''}
                                inv: {formatCurrency(inv.total_invested, inv.currency)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {computed != null && (
                                <span className="font-mono text-sm text-text-primary">
                                  = {formatCurrency(computed, inv.currency)}
                                </span>
                              )}
                              {pnl != null && (
                                <span className={clsx(
                                  'text-xs font-mono font-semibold',
                                  pnl >= 0 ? 'text-gain' : 'text-loss'
                                )}>
                                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* ── Solo rows: individual price inputs ── */}
              {solos.map(inv => {
                const k = inv.id
                const raw = parseFloat(prices[k] ?? '')
                const computed = inv.is_unit_based && inv.total_units != null && !isNaN(raw) && raw > 0
                  ? inv.total_units * raw
                  : null
                const displayTotal = computed ?? (!isNaN(raw) && raw > 0 ? raw : null)
                const pnl = displayTotal != null && inv.total_invested > 0
                  ? ((displayTotal - inv.total_invested) / inv.total_invested) * 100
                  : null

                return (
                  <div key={inv.id} className="px-5 py-4">
                    <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-text-primary">{inv.name}</div>
                        <div className="text-xs text-text-muted mt-1">
                          Invertido: <span className="font-mono">{formatCurrency(inv.total_invested, inv.currency)}</span>
                          {inv.current_value > 0 && (
                            <> · Anterior: <span className="font-mono">{formatCurrency(inv.current_value, inv.currency)}</span></>
                          )}
                          {inv.total_units != null && (
                            <> · {formatUnits(inv.total_units)} unidades</>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="label-base">
                          {inv.is_unit_based ? 'Precio/Unidad' : `Valor Total (${inv.currency})`}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className={clsx(
                            'input-base font-mono w-36',
                            pnl != null && pnl >= 0 && 'border-gain/30',
                            pnl != null && pnl < 0 && 'border-loss/30',
                          )}
                          placeholder="0.00"
                          value={prices[k] ?? ''}
                          onChange={e => setPrice(k, e.target.value)}
                        />
                      </div>

                      {pnl != null && (
                        <div className="text-right self-end pb-0.5 min-w-[80px]">
                          <div className={clsx(
                            'text-sm font-mono font-semibold',
                            pnl >= 0 ? 'text-gain' : 'text-loss'
                          )}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                          </div>
                          {displayTotal != null && (
                            <div className="text-xs text-text-muted">
                              {formatCurrency(displayTotal, inv.currency)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        )
      })}

      {error && (
        <div className="text-loss text-sm bg-loss-muted border border-loss/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-gain text-sm bg-gain-muted border border-gain/20 rounded-lg px-4 py-3">
          ✓ Precios actualizados correctamente. El dashboard ya refleja los nuevos valores.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? 'Guardando...' : 'Guardar Actualizaciones'}
      </button>
    </form>
  )
}
