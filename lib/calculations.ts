import type {
  Investment,
  Transaction,
  PriceSnapshot,
  InvestmentWithData,
  AllocationItem,
  EvolutionPoint,
  EvolutionSeries,
  EvolutionSeriesPoint,
} from '@/types'
import { INVESTMENT_TYPES } from './constants'

export function computeTotalInvested(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (tx.type === 'buy' || tx.type === 'deposit') return sum + tx.amount
    if (tx.type === 'sell' || tx.type === 'withdrawal') return sum - tx.amount
    return sum // dividends don't affect cost basis
  }, 0)
}

export function computeTotalUnits(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (!tx.units) return sum
    if (tx.type === 'buy' || tx.type === 'deposit') return sum + tx.units
    if (tx.type === 'sell' || tx.type === 'withdrawal') return sum - tx.units
    return sum
  }, 0)
}

export function getLatestSnapshot(snapshots: PriceSnapshot[]): PriceSnapshot | null {
  if (!snapshots.length) return null
  return snapshots.reduce((latest, s) =>
    s.date > latest.date ? s : latest
  )
}

export function computeInvestmentWithData(
  investment: Investment,
  transactions: Transaction[],
  snapshots: PriceSnapshot[]
): InvestmentWithData {
  const invTx = transactions.filter(t => t.investment_id === investment.id)
  const invSnap = snapshots.filter(s => s.investment_id === investment.id)

  const total_invested = computeTotalInvested(invTx)
  const latestSnap = getLatestSnapshot(invSnap)
  const current_value = latestSnap?.total_value ?? total_invested
  const pnl_absolute = current_value - total_invested
  const pnl_percent = total_invested > 0 ? (pnl_absolute / total_invested) * 100 : 0
  const total_units = investment.is_unit_based ? computeTotalUnits(invTx) : null
  const current_unit_price = latestSnap?.unit_price ?? null

  return {
    ...investment,
    transactions: invTx,
    snapshots: invSnap.sort((a, b) => b.date.localeCompare(a.date)),
    total_invested,
    current_value,
    pnl_absolute,
    pnl_percent,
    total_units,
    current_unit_price,
  }
}

export function computeAllocation(investments: InvestmentWithData[]): AllocationItem[] {
  const byCurrency: Record<string, Record<string, number>> = {}

  investments.forEach(inv => {
    if (!inv.is_active) return
    const key = inv.type
    if (!byCurrency[inv.currency]) byCurrency[inv.currency] = {}
    if (!byCurrency[inv.currency][key]) byCurrency[inv.currency][key] = 0
    byCurrency[inv.currency][key] += inv.current_value
  })

  // Group all by type across all currencies (for the pie chart, use first currency)
  const byType: Record<string, number> = {}
  investments.forEach(inv => {
    if (!inv.is_active) return
    if (!byType[inv.type]) byType[inv.type] = 0
    byType[inv.type] += inv.current_value
  })

  const total = Object.values(byType).reduce((s, v) => s + v, 0)

  return Object.entries(byType).map(([type, value]) => {
    const typeInfo = INVESTMENT_TYPES[type as keyof typeof INVESTMENT_TYPES]
    return {
      type: type as AllocationItem['type'],
      label: typeInfo?.label ?? type,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: typeInfo?.color ?? '#888',
      currency: investments.find(i => i.type === type)?.currency ?? 'ARS',
    }
  }).sort((a, b) => b.value - a.value)
}

export function computeEvolution(
  investments: InvestmentWithData[]
): EvolutionPoint[] {
  // Collect all unique dates from snapshots
  const dateMap: Record<string, number> = {}

  investments.forEach(inv => {
    if (!inv.is_active) return
    inv.snapshots.forEach(snap => {
      if (!dateMap[snap.date]) dateMap[snap.date] = 0
      dateMap[snap.date] += snap.total_value
    })
  })

  if (Object.keys(dateMap).length === 0) return []

  return Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value,
      label: date,
    }))
}

export function computeEvolutionSeries(investments: InvestmentWithData[]): EvolutionSeries {
  const active = investments.filter(i => i.is_active)

  // Collect all unique snapshot dates across all active investments
  const allDates = new Set<string>()
  active.forEach(inv => {
    inv.snapshots.forEach(snap => allDates.add(snap.date))
  })

  if (allDates.size === 0) return { points: [], assets: [] }

  const sortedDates = Array.from(allDates).sort()

  const points: EvolutionSeriesPoint[] = sortedDates.map(date => {
    const point: EvolutionSeriesPoint = { date, total: 0 }

    active.forEach(inv => {
      // snapshots are sorted descending, find latest on or before this date
      const snap = inv.snapshots.find(s => s.date <= date)
      if (!snap) return

      const val = snap.total_value
      point.total = (point.total as number) + val

      const typeKey = `type_${inv.type}`
      point[typeKey] = ((point[typeKey] as number | undefined) ?? 0) + val

      point[`asset_${inv.id}`] = val
    })

    return point
  })

  const assets = active.map(inv => ({
    id: inv.id,
    name: inv.name,
    type: inv.type,
    color: INVESTMENT_TYPES[inv.type]?.color ?? '#888',
  }))

  return { points, assets }
}

export function computeDashboardTotals(investments: InvestmentWithData[]) {
  const active = investments.filter(i => i.is_active)
  const totalValue = active.reduce((s, i) => s + i.current_value, 0)
  const totalInvested = active.reduce((s, i) => s + i.total_invested, 0)
  const pnlAbsolute = totalValue - totalInvested
  const pnlPercent = totalInvested > 0 ? (pnlAbsolute / totalInvested) * 100 : 0

  return { totalValue, totalInvested, pnlAbsolute, pnlPercent }
}
