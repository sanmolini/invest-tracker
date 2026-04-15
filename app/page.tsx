import { createServerClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/dashboard/KPICard'
import { AllocationChart } from '@/components/dashboard/AllocationChart'
import { EvolutionChart } from '@/components/dashboard/EvolutionChart'
import { InvestmentSummaryTable } from '@/components/dashboard/InvestmentSummaryTable'
import { TypeBreakdown } from '@/components/dashboard/TypeBreakdown'
import {
  computeInvestmentWithData,
  computeAllocation,
  computeEvolutionSeries,
  computeDashboardTotals,
} from '@/lib/calculations'
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatting'
import { DollarSign, TrendingUp, PiggyBank, Percent } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createServerClient()

  // Fetch all data in parallel
  const [investRes, txRes, snapRes] = await Promise.all([
    supabase.from('investments').select('*').order('created_at', { ascending: false }),
    supabase.from('transactions').select('*').order('date', { ascending: true }),
    supabase.from('price_snapshots').select('*').order('date', { ascending: true }),
  ])

  const rawInvestments = investRes.data ?? []
  const rawTransactions = txRes.data ?? []
  const rawSnapshots = snapRes.data ?? []

  // Compute enriched data
  const investments = rawInvestments.map(inv =>
    computeInvestmentWithData(inv as any, rawTransactions as any, rawSnapshots as any)
  )

  const { totalValue, totalInvested, pnlAbsolute, pnlPercent } =
    computeDashboardTotals(investments)

  const allocation = computeAllocation(investments)
  const evolutionSeries = computeEvolutionSeries(investments)

  const isGain = pnlAbsolute >= 0
  const hasData = investments.some(i => i.is_active)

  // Best and worst performers
  const performers = investments
    .filter(i => i.is_active && i.total_invested > 0)
    .sort((a, b) => b.pnl_percent - a.pnl_percent)

  const best = performers[0]
  const worst = performers[performers.length - 1]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Resumen de tu portfolio de inversiones</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/prices" className="btn-secondary text-sm">
            Actualizar precios
          </Link>
          <Link href="/investments/new" className="btn-primary text-sm">
            + Nueva inversión
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Valor Total"
          value={hasData ? formatCurrency(totalValue, 'USD') : '—'}
          subtitle={hasData ? `${investments.filter(i => i.is_active).length} posiciones activas` : 'Sin datos'}
          icon={<DollarSign size={15} />}
          accent="default"
          delay={0}
        />
        <KPICard
          title="Total Invertido"
          value={hasData ? formatCurrency(totalInvested, 'USD') : '—'}
          subtitle="Capital ingresado"
          icon={<PiggyBank size={15} />}
          delay={50}
        />
        <KPICard
          title="Ganancia / Pérdida"
          value={hasData ? `${isGain ? '+' : ''}${formatCurrency(pnlAbsolute, 'USD')}` : '—'}
          subtitle={hasData ? (isGain ? 'Ganancia neta' : 'Pérdida neta') : undefined}
          change={hasData ? pnlPercent : undefined}
          accent={hasData ? (isGain ? 'gain' : 'loss') : 'default'}
          icon={<TrendingUp size={15} />}
          delay={100}
        />
        <KPICard
          title="Retorno Total"
          value={hasData ? formatPercent(pnlPercent) : '—'}
          subtitle={hasData
            ? (best ? `Mejor: ${best.name}` : undefined)
            : 'Sin datos aún'
          }
          change={hasData ? pnlPercent : undefined}
          accent={hasData ? (isGain ? 'gain' : 'loss') : 'default'}
          icon={<Percent size={15} />}
          delay={150}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EvolutionChart series={evolutionSeries} />
        </div>
        <div>
          <AllocationChart data={allocation} />
        </div>
      </div>

      {/* Performers */}
      {performers.length >= 2 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              🏆 Mejor Rendimiento
            </div>
            <div className="font-semibold text-text-primary">{best.name}</div>
            <div className="font-mono text-gain font-bold text-lg mt-1">
              +{best.pnl_percent.toFixed(2)}%
            </div>
            <div className="text-xs text-text-muted mt-1">
              {formatCurrency(best.pnl_absolute, best.currency)} de ganancia
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              📉 Peor Rendimiento
            </div>
            <div className="font-semibold text-text-primary">{worst.name}</div>
            <div className={`font-mono font-bold text-lg mt-1 ${worst.pnl_percent >= 0 ? 'text-gain' : 'text-loss'}`}>
              {worst.pnl_percent >= 0 ? '+' : ''}{worst.pnl_percent.toFixed(2)}%
            </div>
            <div className="text-xs text-text-muted mt-1">
              {formatCurrency(worst.pnl_absolute, worst.currency)} de {worst.pnl_absolute >= 0 ? 'ganancia' : 'pérdida'}
            </div>
          </div>
        </div>
      )}

      {/* Per-type breakdown */}
      <TypeBreakdown investments={investments} />

      {/* Investments table */}
      <InvestmentSummaryTable investments={investments} />
    </div>
  )
}
