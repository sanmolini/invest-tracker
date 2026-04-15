'use client'

import { useState } from 'react'
import { saveMultipleSnapshots } from '@/app/actions/snapshots'
import { TypeBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits } from '@/lib/formatting'
import type { InvestmentWithData, Currency } from '@/types'
import { INVESTMENT_TYPES } from '@/lib/constants'
import clsx from 'clsx'

interface Props {
  investments: InvestmentWithData[]
}

interface PriceEntry {
  investment_id: string
  total_value: string
  unit_price: string
}

export function PriceUpdateForm({ investments }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [prices, setPrices] = useState<Record<string, PriceEntry>>(
    Object.fromEntries(investments.map(inv => [inv.id, {
      investment_id: inv.id,
      total_value: inv.current_value > 0 ? inv.current_value.toFixed(2) : '',
      unit_price: inv.current_unit_price ? inv.current_unit_price.toFixed(4) : '',
    }]))
  )

  function updatePrice(id: string, key: 'total_value' | 'unit_price', value: string) {
    setPrices(prev => {
      const updated = { ...prev, [id]: { ...prev[id], [key]: value } }
      // If unit_price changes and investment has units, auto-compute total
      const inv = investments.find(i => i.id === id)
      if (key === 'unit_price' && inv?.is_unit_based && inv.total_units) {
        const up = parseFloat(value)
        if (!isNaN(up)) {
          updated[id].total_value = (inv.total_units * up).toFixed(2)
        }
      }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const snapshots = Object.values(prices)
      .filter(p => p.total_value && parseFloat(p.total_value) > 0)
      .map(p => ({
        investment_id: p.investment_id,
        date,
        total_value: parseFloat(p.total_value),
        unit_price: p.unit_price ? parseFloat(p.unit_price) : null,
      }))

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

  // Group by type
  const byType = Object.entries(INVESTMENT_TYPES).reduce<Record<string, InvestmentWithData[]>>(
    (acc, [type]) => {
      const inv = investments.filter(i => i.type === type)
      if (inv.length) acc[type] = inv
      return acc
    }, {}
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date selector */}
      <div className="card p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Fecha de actualización</label>
        <input
          type="date"
          className="input-base max-w-xs"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Investment cards by type */}
      {Object.entries(byType).map(([type, invs]) => (
        <div key={type} className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-bg-border bg-bg-secondary">
            <TypeBadge type={type as any} />
          </div>
          <div className="divide-y divide-bg-border">
            {invs.map(inv => {
              const entry = prices[inv.id]
              const newVal = parseFloat(entry?.total_value)
              const pnl = !isNaN(newVal) && inv.total_invested > 0
                ? ((newVal - inv.total_invested) / inv.total_invested) * 100
                : null

              return (
                <div key={inv.id} className="px-5 py-4">
                  <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary">{inv.name}</div>
                      {inv.ticker && (
                        <div className="text-xs font-mono text-text-muted">{inv.ticker}</div>
                      )}
                      <div className="text-xs text-text-muted mt-1">
                        Invertido: <span className="font-mono">{formatCurrency(inv.total_invested, inv.currency)}</span>
                        {inv.current_value > 0 && (
                          <> · Anterior: <span className="font-mono">{formatCurrency(inv.current_value, inv.currency)}</span></>
                        )}
                        {inv.total_units !== null && (
                          <> · {formatUnits(inv.total_units)} unidades</>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex gap-3 flex-wrap">
                      {inv.is_unit_based && (
                        <div className="min-w-[120px]">
                          <label className="label-base">Precio/Unidad</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="input-base font-mono w-32"
                            placeholder="0.00"
                            value={entry?.unit_price ?? ''}
                            onChange={e => updatePrice(inv.id, 'unit_price', e.target.value)}
                          />
                        </div>
                      )}
                      <div className="min-w-[140px]">
                        <label className="label-base">Valor Total ({inv.currency})</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className={clsx(
                            'input-base font-mono w-36',
                            pnl !== null && pnl >= 0 && 'border-gain/30 focus:ring-gain/30',
                            pnl !== null && pnl < 0 && 'border-loss/30 focus:ring-loss/30',
                          )}
                          placeholder="0.00"
                          value={entry?.total_value ?? ''}
                          onChange={e => updatePrice(inv.id, 'total_value', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Projected P&L */}
                    {pnl !== null && (
                      <div className="text-right self-end pb-0.5">
                        <div className={clsx(
                          'text-sm font-mono font-semibold',
                          pnl >= 0 ? 'text-gain' : 'text-loss'
                        )}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                        </div>
                        <div className="text-xs text-text-muted">vs invertido</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

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
