import { createServerClient } from '@/lib/supabase/server'
import { computeInvestmentWithData } from '@/lib/calculations'
import { TypeBadge, PnlBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits } from '@/lib/formatting'
import { DeleteInvestmentButton } from '@/components/investments/DeleteButton'
import { InvestmentsFilter } from '@/components/investments/InvestmentsFilter'
import { INVESTMENT_TYPES } from '@/lib/constants'
import type { InvestmentType, InvestmentWithData } from '@/types'
import Link from 'next/link'
import { PlusCircle, ChevronRight } from 'lucide-react'
import { Suspense } from 'react'

export const revalidate = 0

type SortKey = 'value' | 'invested' | 'pnl' | 'name'

function sortInvestments(invs: InvestmentWithData[], sort: SortKey): InvestmentWithData[] {
  return [...invs].sort((a, b) => {
    if (sort === 'value')    return b.current_value - a.current_value
    if (sort === 'invested') return b.total_invested - a.total_invested
    if (sort === 'pnl')      return b.pnl_percent - a.pnl_percent
    if (sort === 'name')     return a.name.localeCompare(b.name)
    return 0
  })
}

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: { type?: string; sort?: string }
}) {
  const supabase = await createServerClient()
  const [investRes, txRes, snapRes] = await Promise.all([
    supabase.from('investments').select('*').order('created_at', { ascending: false }),
    supabase.from('transactions').select('*'),
    supabase.from('price_snapshots').select('*').order('date', { ascending: false }),
  ])

  const investments = (investRes.data ?? []).map(inv =>
    computeInvestmentWithData(inv as any, txRes.data as any ?? [], snapRes.data as any ?? [])
  )

  const active = investments.filter(i => i.is_active)
  const inactive = investments.filter(i => !i.is_active)

  const filterType = searchParams.type as InvestmentType | undefined
  const sortBy = (searchParams.sort ?? 'value') as SortKey

  // Types that have active investments, in canonical order
  const availableTypes = Object.keys(INVESTMENT_TYPES).filter(
    t => active.some(i => i.type === t)
  ) as InvestmentType[]

  // Group active by type
  const grouped = Object.keys(INVESTMENT_TYPES).reduce<Record<string, InvestmentWithData[]>>(
    (acc, type) => {
      if (filterType && type !== filterType) return acc
      const group = active.filter(i => i.type === type)
      if (group.length) acc[type] = sortInvestments(group, sortBy)
      return acc
    }, {}
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inversiones</h1>
          <p className="text-text-muted text-sm mt-1">
            {active.length} activas · {inactive.length} archivadas
          </p>
        </div>
        <Link href="/investments/new" className="btn-primary hidden sm:inline-flex">
          <PlusCircle size={16} />
          Nueva
        </Link>
      </div>

      {investments.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-text-primary font-semibold mb-2">Sin inversiones aún</div>
          <div className="text-text-muted text-sm mb-6">Comenzá cargando tu primera inversión</div>
          <Link href="/investments/new" className="btn-primary inline-flex">
            <PlusCircle size={16} /> Agregar Inversión
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters + sort */}
          <Suspense>
            <InvestmentsFilter availableTypes={availableTypes} />
          </Suspense>

          {/* Active — grouped by type */}
          {Object.entries(grouped).map(([type, invs]) => {
            const typeInfo = INVESTMENT_TYPES[type as InvestmentType]
            const groupValue    = invs.reduce((s, i) => s + i.current_value, 0)
            const groupInvested = invs.reduce((s, i) => s + i.total_invested, 0)
            const groupPnl      = groupValue - groupInvested
            const groupPct      = groupInvested > 0 ? (groupPnl / groupInvested) * 100 : 0
            const currency      = invs[0].currency

            return (
              <div key={type} className="card overflow-hidden">
                {/* Group header */}
                <div className="px-5 py-3.5 border-b border-bg-border bg-bg-secondary flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{typeInfo.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{typeInfo.label}</div>
                      <div className="text-xs text-text-muted">
                        {invs.length} posición{invs.length > 1 ? 'es' : ''}
                        <span className="mx-1.5">·</span>
                        <span className="font-mono">Inv: {formatCurrency(groupInvested, currency)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-sm text-text-primary">
                      {formatCurrency(groupValue, currency)}
                    </div>
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <span className={`text-xs font-mono ${groupPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {groupPnl >= 0 ? '+' : ''}{formatCurrency(groupPnl, currency)}
                      </span>
                      <PnlBadge value={groupPct} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Investments in group */}
                <div className="divide-y divide-bg-border">
                  {invs.map(inv => (
                    <div key={inv.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-elevated/40 transition-colors group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: typeInfo.color }} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/investments/${inv.id}`}
                            className="font-medium text-sm text-text-primary hover:text-brand transition-colors">
                            {inv.name}
                          </Link>
                          {inv.ticker && (
                            <span className="text-xs font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
                              {inv.ticker}
                            </span>
                          )}
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted mt-0.5">
                          <span>Inv: <span className="font-mono">{formatCurrency(inv.total_invested, inv.currency)}</span></span>
                          {inv.total_units !== null && (
                            <span>{formatUnits(inv.total_units)} u</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-semibold text-sm text-text-primary">
                          {formatCurrency(inv.current_value, inv.currency)}
                        </div>
                        <div className="text-xs font-mono mt-0.5">
                          <span className={inv.pnl_absolute >= 0 ? 'text-gain' : 'text-loss'}>
                            {inv.pnl_absolute >= 0 ? '+' : ''}{formatCurrency(inv.pnl_absolute, inv.currency)}
                          </span>
                        </div>
                      </div>

                      <PnlBadge value={inv.pnl_percent} size="sm" />

                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link href={`/investments/${inv.id}`} className="btn-ghost py-1 px-2 text-xs">
                          <ChevronRight size={14} />
                        </Link>
                        <DeleteInvestmentButton id={inv.id} name={inv.name} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Empty state when filter has no results */}
          {Object.keys(grouped).length === 0 && filterType && (
            <div className="card p-8 text-center">
              <div className="text-text-muted text-sm">
                No hay inversiones activas de tipo {INVESTMENT_TYPES[filterType]?.label}
              </div>
            </div>
          )}

          {/* Archived */}
          {inactive.length > 0 && (
            <div className="card overflow-hidden opacity-50">
              <div className="px-5 py-3.5 border-b border-bg-border">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Archivadas ({inactive.length})
                </div>
              </div>
              <div className="divide-y divide-bg-border">
                {inactive.map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 text-sm text-text-secondary">{inv.name}</div>
                    <TypeBadge type={inv.type} size="sm" />
                    <DeleteInvestmentButton id={inv.id} name={inv.name} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
