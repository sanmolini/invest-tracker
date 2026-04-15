'use client'

import { useState, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { EvolutionSeries, EvolutionSeriesAsset, InvestmentType } from '@/types'
import { formatCurrency, formatDateShort } from '@/lib/formatting'
import { INVESTMENT_TYPES } from '@/lib/constants'

interface Props {
  series: EvolutionSeries
}

const TOTAL_COLOR = '#00c27c'

function getActiveTypes(assets: EvolutionSeriesAsset[], points: any[]): InvestmentType[] {
  const types = new Set<InvestmentType>()
  assets.forEach(a => types.add(a.type))
  return Array.from(types).filter(t =>
    points.some(p => p[`type_${t}`] != null)
  )
}

const TooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const visible = payload.filter((p: any) => p.value != null && !p.hide)
  if (!visible.length) return null
  return (
    <div className="bg-bg-elevated border border-bg-border rounded-xl px-3 py-2.5 shadow-card text-sm min-w-[150px] max-w-[220px]">
      <div className="text-text-muted text-xs mb-2">{formatDateShort(label)}</div>
      {visible.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-text-secondary text-xs truncate">{p.name}</span>
          </div>
          <span className="font-mono text-xs text-text-primary font-medium flex-shrink-0">
            {formatCurrency(p.value, 'USD')}
          </span>
        </div>
      ))}
    </div>
  )
}

function FilterPill({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
      style={active
        ? { borderColor: color, backgroundColor: `${color}22`, color }
        : { borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
      }
    >
      {label}
    </button>
  )
}

export function EvolutionChart({ series }: Props) {
  const { points, assets } = series
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(['total']))
  const [showAssets, setShowAssets] = useState(false)

  const toggle = (key: string) => {
    setActiveKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const activeTypes = useMemo(
    () => getActiveTypes(assets, points as any),
    [assets, points]
  )

  if (!points.length) {
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

  const allValues = points.map(p => p.total as number)
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = (maxVal - minVal) * 0.12 || maxVal * 0.12

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Evolución del Portfolio
        </div>
        <div className="text-xs text-text-muted">{points.length} puntos</div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <FilterPill
          label="Total"
          active={activeKeys.has('total')}
          color={TOTAL_COLOR}
          onClick={() => toggle('total')}
        />
        {activeTypes.map(type => {
          const info = INVESTMENT_TYPES[type]
          const key = `type_${type}`
          return (
            <FilterPill
              key={key}
              label={`${info.emoji} ${info.label}`}
              active={activeKeys.has(key)}
              color={info.color}
              onClick={() => toggle(key)}
            />
          )
        })}
        {assets.length > 0 && (
          <button
            onClick={() => setShowAssets(p => !p)}
            className="px-2.5 py-1 rounded-full text-xs font-medium border border-[rgba(255,255,255,0.08)] text-[#64748b] hover:text-text-primary transition-all"
          >
            {showAssets ? '▾' : '▸'} Por asset
          </button>
        )}
      </div>

      {showAssets && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {assets.map(asset => {
            const key = `asset_${asset.id}`
            return (
              <FilterPill
                key={key}
                label={asset.name}
                active={activeKeys.has(key)}
                color={asset.color}
                onClick={() => toggle(key)}
              />
            )
          })}
        </div>
      )}

      <div className="h-48 lg:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="totalGradientEvo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity={0.2} />
                <stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
            <Tooltip content={<TooltipContent />} />

            {/* Asset lines — always mounted, hidden via prop */}
            {assets.map(asset => {
              const key = `asset_${asset.id}`
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={asset.name}
                  stroke={asset.color}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3, fill: asset.color, strokeWidth: 0 }}
                  connectNulls
                  opacity={0.65}
                  hide={!activeKeys.has(key)}
                />
              )
            })}

            {/* Type lines */}
            {activeTypes.map(type => {
              const key = `type_${type}`
              const info = INVESTMENT_TYPES[type]
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={info.label}
                  stroke={info.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: info.color, strokeWidth: 0 }}
                  connectNulls
                  hide={!activeKeys.has(key)}
                />
              )
            })}

            {/* Total area */}
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={TOTAL_COLOR}
              strokeWidth={2.5}
              fill="url(#totalGradientEvo)"
              dot={false}
              activeDot={{ r: 4, fill: TOTAL_COLOR, stroke: '#080b14', strokeWidth: 2 }}
              hide={!activeKeys.has('total')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
