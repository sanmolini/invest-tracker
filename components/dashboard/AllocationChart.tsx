'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { AllocationItem } from '@/types'
import { formatCurrency } from '@/lib/formatting'

interface Props {
  data: AllocationItem[]
}

const RADIAN = Math.PI / 180

export function AllocationChart({ data }: Props) {
  // Strip our 'percent' field — it conflicts with Recharts' internal percent (0–1)
  // Recharts spreads data entries onto label props, so percent:38.9 beats its own 0.389
  const pieData = data.map(({ percent: _pct, ...rest }) => rest)

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600}>
        {(percent * 100).toFixed(1)}%
      </text>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const raw = payload[0].payload
    const item = data.find(d => d.type === raw.type)
    if (!item) return null
    return (
      <div className="bg-bg-elevated border border-bg-border rounded-xl p-3 shadow-card text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
          <span className="font-semibold text-text-primary">{item.label}</span>
        </div>
        <div className="text-text-secondary">{formatCurrency(item.value, item.currency)}</div>
        <div className="text-text-muted text-xs">{item.percent.toFixed(1)}% del total</div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="card p-6">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Distribución por Tipo
        </div>
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">
          Sin datos aún
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
        Distribución por Tipo
      </div>
      <div className="h-44 lg:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
            >
              {pieData.map(item => (
                <Cell key={item.type} fill={item.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4">
        {data.map(item => (
          <div key={item.type} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-text-secondary">{item.label}</span>
            </div>
            <span className="font-mono font-medium text-text-primary">
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
