'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { EvolutionPoint } from '@/types'
import { formatCurrency, formatDateShort } from '@/lib/formatting'

interface Props {
  data: EvolutionPoint[]
  currency?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-bg-border rounded-xl px-3 py-2.5 shadow-card text-sm">
      <div className="text-text-muted text-xs mb-1">{formatDateShort(label)}</div>
      <div className="font-mono font-semibold text-text-primary">
        {formatCurrency(payload[0].value, 'ARS')}
      </div>
    </div>
  )
}

export function EvolutionChart({ data, currency = 'ARS' }: Props) {
  if (!data.length) {
    return (
      <div className="card p-6">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Evolución del Portfolio
        </div>
        <div className="h-56 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
          <div>Actualizá los precios para ver la evolución</div>
          <div className="text-xs">Menú → Actualizar Precios</div>
        </div>
      </div>
    )
  }

  // Format x-axis labels
  const formatted = data.map(d => ({
    ...d,
    dateLabel: formatDateShort(d.date),
  }))

  const minVal = Math.min(...data.map(d => d.value))
  const maxVal = Math.max(...data.map(d => d.value))
  const padding = (maxVal - minVal) * 0.1 || maxVal * 0.1

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Evolución del Portfolio
        </div>
        <div className="text-xs text-text-muted">{data.length} puntos</div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c27c" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00c27c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateShort(v)}
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
                return v.toFixed(0)
              }}
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00c27c"
              strokeWidth={2}
              fill="url(#valueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#00c27c', stroke: '#080b14', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
