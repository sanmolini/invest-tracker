'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { INVESTMENT_TYPES } from '@/lib/constants'
import type { InvestmentType } from '@/types'

const SORT_OPTIONS = [
  { value: 'value',    label: 'Valor actual' },
  { value: 'invested', label: 'Total invertido' },
  { value: 'pnl',      label: 'P&L %' },
  { value: 'name',     label: 'Nombre' },
]

export function InvestmentsFilter({ availableTypes }: { availableTypes: InvestmentType[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const activeType = params.get('type') ?? 'all'
  const activeSort = params.get('sort') ?? 'value'

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === 'all' || value === 'value') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.replace(`/investments?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => update('type', 'all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            activeType === 'all'
              ? 'bg-brand/15 text-brand border-brand/30'
              : 'text-text-muted border-bg-border hover:border-bg-elevated hover:text-text-secondary'
          }`}
        >
          Todos
        </button>
        {availableTypes.map(type => {
          const info = INVESTMENT_TYPES[type]
          const isActive = activeType === type
          return (
            <button
              key={type}
              onClick={() => update('type', type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-brand/15 text-brand border-brand/30'
                  : 'text-text-muted border-bg-border hover:border-bg-elevated hover:text-text-secondary'
              }`}
            >
              <span>{info.emoji}</span>
              {info.label}
            </button>
          )
        })}
      </div>

      {/* Sort */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-text-muted">Ordenar:</span>
        <select
          value={activeSort}
          onChange={e => update('sort', e.target.value)}
          className="text-xs bg-bg-secondary border border-bg-border rounded-lg px-2.5 py-1.5 text-text-secondary focus:outline-none focus:border-brand/50 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
