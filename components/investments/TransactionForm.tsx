'use client'

import { useState } from 'react'
import { createTransaction } from '@/app/actions/transactions'
import type { TransactionType, Currency } from '@/types'
import { TRANSACTION_TYPES } from '@/lib/constants'

interface Props {
  investmentId: string
  isUnitBased: boolean
  currency: Currency
}

export function TransactionForm({ investmentId, isUnitBased, currency }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: 'buy' as TransactionType,
    date: today,
    units: '',
    unit_price: '',
    amount: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  // Auto-compute amount when units+price are filled
  const computedAmount =
    form.units && form.unit_price
      ? (parseFloat(form.units) * parseFloat(form.unit_price)).toFixed(2)
      : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = isUnitBased && computedAmount
      ? parseFloat(computedAmount)
      : parseFloat(form.amount)

    if (!amount || isNaN(amount)) { setError('Ingresá un monto válido'); return }

    setLoading(true)
    setError('')
    try {
      await createTransaction({
        investment_id: investmentId,
        type: form.type,
        date: form.date,
        units: isUnitBased && form.units ? parseFloat(form.units) : null,
        unit_price: isUnitBased && form.unit_price ? parseFloat(form.unit_price) : null,
        amount,
        notes: form.notes.trim() || undefined,
      })
      setSuccess(true)
      setForm(p => ({ ...p, units: '', unit_price: '', amount: '', notes: '' }))
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Type */}
        <div>
          <label className="label-base">Tipo</label>
          <select className="input-base" value={form.type}
            onChange={e => set('type', e.target.value)}>
            {Object.entries(TRANSACTION_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label-base">Fecha</label>
          <input type="date" className="input-base" value={form.date}
            onChange={e => set('date', e.target.value)} />
        </div>

        {/* Units (if unit-based) */}
        {isUnitBased && (
          <div>
            <label className="label-base">Unidades</label>
            <input type="number" step="any" min="0" className="input-base font-mono"
              placeholder="0.5" value={form.units}
              onChange={e => set('units', e.target.value)} />
          </div>
        )}

        {/* Unit price or total amount */}
        {isUnitBased ? (
          <div>
            <label className="label-base">Precio/Unidad</label>
            <input type="number" step="any" min="0" className="input-base font-mono"
              placeholder="0.00" value={form.unit_price}
              onChange={e => set('unit_price', e.target.value)} />
          </div>
        ) : (
          <div className="col-span-2">
            <label className="label-base">Importe ({currency})</label>
            <input type="number" step="any" min="0" className="input-base font-mono"
              placeholder="0.00" value={form.amount}
              onChange={e => set('amount', e.target.value)} />
          </div>
        )}
      </div>

      {/* Computed total */}
      {isUnitBased && computedAmount && (
        <div className="bg-bg-secondary rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
          <span className="text-text-muted">Total calculado</span>
          <span className="font-mono font-semibold text-text-primary">
            {currency} {parseFloat(computedAmount).toLocaleString('es-AR')}
          </span>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="label-base">Notas (opcional)</label>
        <input type="text" className="input-base" placeholder="Comentario..."
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {error && (
        <div className="text-loss text-sm bg-loss-muted border border-loss/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-gain text-sm bg-gain-muted border border-gain/20 rounded-lg px-3 py-2">
          ✓ Transacción registrada
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Guardando...' : 'Registrar Transacción'}
      </button>
    </form>
  )
}
