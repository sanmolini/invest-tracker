import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { TypeBadge, PnlBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits } from '@/lib/formatting'
import type { InvestmentWithData } from '@/types'
import clsx from 'clsx'

interface Props {
  investments: InvestmentWithData[]
}

export function InvestmentSummaryTable({ investments }: Props) {
  const active = investments.filter(i => i.is_active)

  if (!active.length) {
    return (
      <div className="card p-8 text-center">
        <div className="text-text-muted text-sm mb-3">Sin inversiones aún</div>
        <Link href="/investments/new" className="btn-primary text-sm px-4 py-2">
          Agregar primera inversión
        </Link>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Posiciones
        </div>
        <Link href="/investments" className="text-xs text-brand hover:text-brand-light transition-colors">
          Ver todas →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bg-border">
              {['Inversión', 'Tipo', 'Invertido', 'Valor Actual', 'P&L', 'Retorno'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {active
              .sort((a, b) => b.current_value - a.current_value)
              .map((inv) => {
                const isGain = inv.pnl_absolute >= 0
                return (
                  <tr key={inv.id} className="hover:bg-bg-elevated/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-sm text-text-primary">{inv.name}</div>
                      {inv.ticker && (
                        <div className="text-xs text-text-muted font-mono mt-0.5">{inv.ticker}</div>
                      )}
                      {inv.total_units !== null && (
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatUnits(inv.total_units)} unidades
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <TypeBadge type={inv.type} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-text-secondary">
                      {formatCurrency(inv.total_invested, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold text-text-primary">
                      {formatCurrency(inv.current_value, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm">
                      <span className={isGain ? 'text-gain' : 'text-loss'}>
                        {isGain ? '+' : ''}{formatCurrency(inv.pnl_absolute, inv.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PnlBadge value={inv.pnl_percent} size="sm" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/investments/${inv.id}`}
                        className="text-text-muted group-hover:text-brand transition-colors">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
