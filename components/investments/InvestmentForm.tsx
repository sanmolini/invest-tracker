'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { INVESTMENT_TYPES, CURRENCIES } from '@/lib/constants'
import { createInvestment } from '@/app/actions/investments'
import type { InvestmentType, Currency } from '@/types'

export function InvestmentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    type: 'stock' as InvestmentType,
    ticker: '',
    currency: 'ARS' as Currency,
    is_unit_based: false,
    notes: '',
  })

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // Auto-set is_unit_based based on type
  const handleTypeChange = (type: InvestmentType) => {
    const unitBased = type === 'crypto' || type === 'stock' || type === 'etf'
    setForm(prev => ({ ...prev, type, is_unit_based: unitBased }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')
    try {
      const inv = await createInvestment({
        ...form,
        ticker: form.ticker.trim().toUpperCase() || undefined,
        notes: form.notes.trim() || undefined,
      })
      router.push(`/investments/${inv.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {/* Name */}
      <div>
        <label className="label-base">Nombre *</label>
        <input
          type="text"
          className="input-base"
          placeholder="ej: Bitcoin, Apple, S&P 500 ETF..."
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
        />
      </div>

      {/* Type selector */}
      <div>
        <label className="label-base">Tipo de Inversión *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(INVESTMENT_TYPES).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key as InvestmentType)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                form.type === key
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-bg-border bg-bg-secondary text-text-secondary hover:border-bg-elevated hover:text-text-primary'
              }`}
            >
              <span className="text-base">{info.emoji}</span>
              <span className="text-xs leading-tight">{info.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ticker + Currency row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-base">Ticker / Símbolo</label>
          <input
            type="text"
            className="input-base font-mono uppercase"
            placeholder="BTC, AAPL, SPY..."
            value={form.ticker}
            onChange={e => set('ticker', e.target.value)}
          />
        </div>
        <div>
          <label className="label-base">Moneda *</label>
          <select
            className="input-base"
            value={form.currency}
            onChange={e => set('currency', e.target.value as Currency)}
          >
            {CURRENCIES.map(c => (
              <option key={c.value} value={c.value}>{c.symbol} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit-based toggle */}
      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-bg-border">
        <div>
          <div className="text-sm font-medium text-text-primary">Seguimiento por unidades</div>
          <div className="text-xs text-text-muted mt-0.5">
            Para activos con precio por unidad (cripto, acciones, ETF)
          </div>
        </div>
        <button
          type="button"
          onClick={() => set('is_unit_based', !form.is_unit_based)}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            form.is_unit_based ? 'bg-brand' : 'bg-bg-elevated'
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            form.is_unit_based ? 'translate-x-5.5 left-0.5' : 'left-0.5'
          }`} style={{ transform: form.is_unit_based ? 'translateX(20px)' : 'translateX(0)' }} />
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="label-base">Notas (opcional)</label>
        <textarea
          className="input-base resize-none"
          rows={2}
          placeholder="Comentarios adicionales..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      {error && (
        <div className="text-loss text-sm bg-loss-muted border border-loss/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Guardando...' : 'Crear Inversión'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  )
}
