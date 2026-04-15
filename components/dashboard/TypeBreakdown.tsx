import type { InvestmentWithData, InvestmentType, Currency } from '@/types'
import { INVESTMENT_TYPES } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatting'

interface Props {
  investments: InvestmentWithData[]
}

interface TypeGroup {
  type: InvestmentType
  invs: InvestmentWithData[]
  typeTotal: number
  typePnl: number
  typePct: number
  currency: Currency
}

export function TypeBreakdown({ investments }: Props) {
  const active = investments.filter(i => i.is_active && i.current_value > 0)
  if (!active.length) return null

  const groups: TypeGroup[] = (Object.keys(INVESTMENT_TYPES) as InvestmentType[])
    .reduce<TypeGroup[]>((acc, type) => {
      const invs = active.filter(i => i.type === type)
      if (!invs.length) return acc
      const typeTotal = invs.reduce((s, i) => s + i.current_value, 0)
      const typeInvested = invs.reduce((s, i) => s + i.total_invested, 0)
      const typePnl = typeTotal - typeInvested
      const typePct = typeInvested > 0 ? (typePnl / typeInvested) * 100 : 0
      const currency = invs[0].currency
      acc.push({ type, invs, typeTotal, typePnl, typePct, currency })
      return acc
    }, [])

  return (
    <div>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        Desglose por Tipo
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map(({ type, invs, typeTotal, typePnl, typePct, currency }) => {
          const info = INVESTMENT_TYPES[type as InvestmentType]
          return (
            <div key={type} className="card p-5">
              {/* Type header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.emoji}</span>
                  <span className="font-semibold text-sm text-text-primary">{info.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-text-primary">
                    {formatCurrency(typeTotal, currency)}
                  </div>
                  <div className={`text-xs font-mono ${typePct >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {typePct >= 0 ? '+' : ''}{typePct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Asset rows */}
              <div className="space-y-3">
                {[...invs]
                  .sort((a: InvestmentWithData, b: InvestmentWithData) => b.current_value - a.current_value)
                  .map((inv: InvestmentWithData) => {
                    const pct = typeTotal > 0 ? (inv.current_value / typeTotal) * 100 : 0
                    const invPnlPct = inv.pnl_percent
                    return (
                      <div key={inv.id}>
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-medium text-text-primary truncate">{inv.name}</span>
                            {inv.ticker && (
                              <span className="font-mono text-text-muted shrink-0">{inv.ticker}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`font-mono text-xs ${invPnlPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                              {invPnlPct >= 0 ? '+' : ''}{invPnlPct.toFixed(2)}%
                            </span>
                            <span className="font-mono text-text-secondary">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: info.color,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-text-muted font-mono">
                          {formatCurrency(inv.current_value, inv.currency)}
                          <span className="text-text-muted/60"> · inv: {formatCurrency(inv.total_invested, inv.currency)}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
