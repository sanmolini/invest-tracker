import { createServerClient } from '@/lib/supabase/server'
import { computeInvestmentWithData } from '@/lib/calculations'
import { TypeBadge, PnlBadge } from '@/components/ui/Badge'
import { formatCurrency, formatUnits, formatDate, formatPercent } from '@/lib/formatting'
import { TRANSACTION_TYPES } from '@/lib/constants'
import { TransactionForm } from '@/components/investments/TransactionForm'
import { DeleteTransactionButton } from '@/components/investments/DeleteTransactionButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

export const revalidate = 0

export default async function InvestmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const [invRes, txRes, snapRes] = await Promise.all([
    supabase.from('investments').select('*').eq('id', params.id).single(),
    supabase.from('transactions').select('*').eq('investment_id', params.id).order('date', { ascending: false }),
    supabase.from('price_snapshots').select('*').eq('investment_id', params.id).order('date', { ascending: false }),
  ])

  if (!invRes.data) notFound()

  const inv = computeInvestmentWithData(
    invRes.data as any,
    txRes.data as any ?? [],
    snapRes.data as any ?? []
  )

  const isGain = inv.pnl_absolute >= 0
  const latestSnap = inv.snapshots[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/investments" className="btn-ghost inline-flex">
        <ChevronLeft size={16} /> Inversiones
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{inv.name}</h1>
              {inv.ticker && (
                <span className="font-mono text-sm text-text-muted bg-bg-elevated px-2 py-0.5 rounded">
                  {inv.ticker}
                </span>
              )}
              <TypeBadge type={inv.type} />
            </div>
            {inv.notes && (
              <p className="text-sm text-text-muted">{inv.notes}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-text-primary">
              {formatCurrency(inv.current_value, inv.currency)}
            </div>
            <div className={clsx('text-sm font-mono mt-1', isGain ? 'text-gain' : 'text-loss')}>
              {isGain ? '+' : ''}{formatCurrency(inv.pnl_absolute, inv.currency)} ({formatPercent(inv.pnl_percent)})
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-bg-border">
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Invertido</div>
            <div className="font-mono font-semibold text-text-primary">
              {formatCurrency(inv.total_invested, inv.currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Valor Actual</div>
            <div className="font-mono font-semibold text-text-primary">
              {formatCurrency(inv.current_value, inv.currency)}
            </div>
          </div>
          {inv.total_units !== null && (
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Unidades</div>
              <div className="font-mono font-semibold text-text-primary">
                {formatUnits(inv.total_units)}
              </div>
            </div>
          )}
          {inv.current_unit_price !== null && (
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Precio Actual</div>
              <div className="font-mono font-semibold text-text-primary">
                {formatCurrency(inv.current_unit_price, inv.currency)}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Retorno</div>
            <div className="flex items-center gap-2">
              <PnlBadge value={inv.pnl_percent} />
            </div>
          </div>
          {latestSnap && (
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Último Precio</div>
              <div className="text-xs text-text-secondary">{formatDate(latestSnap.date)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction */}
      <div className="card p-6">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          Nueva Transacción
        </div>
        <TransactionForm
          investmentId={inv.id}
          isUnitBased={inv.is_unit_based}
          currency={inv.currency}
        />
      </div>

      {/* Transaction History */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Historial de Transacciones ({inv.transactions.length})
          </div>
        </div>

        {inv.transactions.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            Sin transacciones. Agregá una arriba.
          </div>
        ) : (
          <div className="divide-y divide-bg-border">
            {inv.transactions.map(tx => {
              const typeInfo = TRANSACTION_TYPES[tx.type]
              const isBuy = tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'dividend'
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-elevated/30 group transition-colors">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isBuy ? 'bg-gain-muted' : 'bg-loss-muted'
                  )}>
                    {isBuy
                      ? <TrendingUp size={14} className="text-gain" />
                      : <TrendingDown size={14} className="text-loss" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-xs font-medium', typeInfo?.color ?? 'text-text-secondary')}>
                        {typeInfo?.label ?? tx.type}
                      </span>
                      <span className="text-xs text-text-muted">{formatDate(tx.date)}</span>
                    </div>
                    {tx.units && tx.unit_price && (
                      <div className="text-xs text-text-muted mt-0.5">
                        {formatUnits(tx.units)} u × {formatCurrency(tx.unit_price, inv.currency as any)}
                      </div>
                    )}
                    {tx.notes && (
                      <div className="text-xs text-text-muted mt-0.5 italic">{tx.notes}</div>
                    )}
                  </div>
                  <div className="font-mono font-semibold text-sm text-text-primary text-right">
                    <span className={isBuy ? 'text-gain' : 'text-loss'}>
                      {isBuy ? '+' : '-'}
                    </span>
                    {formatCurrency(tx.amount, inv.currency as any)}
                  </div>
                  <DeleteTransactionButton txId={tx.id} investmentId={inv.id} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Snapshots */}
      {inv.snapshots.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Historial de Precios ({inv.snapshots.length} registros)
            </div>
          </div>
          <div className="divide-y divide-bg-border max-h-64 overflow-y-auto">
            {inv.snapshots.map(snap => (
              <div key={snap.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-text-muted">{formatDate(snap.date)}</span>
                <div className="flex items-center gap-4 font-mono">
                  {snap.unit_price && (
                    <span className="text-text-secondary text-xs">
                      {formatCurrency(snap.unit_price, inv.currency as any)}/u
                    </span>
                  )}
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(snap.total_value, inv.currency as any)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
