import { createServerClient } from '@/lib/supabase/server'
import { computeInvestmentWithData } from '@/lib/calculations'
import { TypeBadge, PnlBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits, formatDate } from '@/lib/formatting'
import { DeleteInvestmentButton } from '@/components/investments/DeleteButton'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const revalidate = 0

export default async function InvestmentsPage() {
  const supabase = createServerClient()
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inversiones</h1>
          <p className="text-text-muted text-sm mt-1">
            {active.length} activas · {inactive.length} archivadas
          </p>
        </div>
        <Link href="/investments/new" className="btn-primary">
          <PlusCircle size={16} />
          Nueva Inversión
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
        <>
          {/* Active investments */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-bg-border">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Posiciones Activas ({active.length})
              </div>
            </div>
            <div className="divide-y divide-bg-border">
              {active.map(inv => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-elevated/40 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/investments/${inv.id}`}
                        className="font-medium text-text-primary hover:text-brand transition-colors">
                        {inv.name}
                      </Link>
                      {inv.ticker && (
                        <span className="text-xs font-mono text-text-muted">{inv.ticker}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>Invertido: {formatCurrency(inv.total_invested, inv.currency)}</span>
                      {inv.total_units !== null && (
                        <span>{formatUnits(inv.total_units)} unidades</span>
                      )}
                      <span>{inv.transactions.length} transacciones</span>
                    </div>
                  </div>

                  <TypeBadge type={inv.type} size="sm" />

                  <div className="text-right min-w-[100px]">
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

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/investments/${inv.id}`} className="btn-ghost py-1.5 text-xs">
                      Ver
                    </Link>
                    <DeleteInvestmentButton id={inv.id} name={inv.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archived */}
          {inactive.length > 0 && (
            <div className="card overflow-hidden opacity-60">
              <div className="px-5 py-4 border-b border-bg-border">
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
        </>
      )}
    </div>
  )
}
