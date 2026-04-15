export type InvestmentType = 'liquidity_fund' | 'crypto' | 'stock' | 'etf' | 'savings'
export type Currency = 'UYU' | 'USD' | 'EUR' | 'BTC' | 'ETH' | 'ARS'
export type TransactionType = 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'dividend'

export interface Investment {
  id: string
  name: string
  type: InvestmentType
  ticker: string | null
  currency: Currency
  is_unit_based: boolean
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  investment_id: string
  type: TransactionType
  date: string
  units: number | null
  unit_price: number | null
  amount: number
  notes: string | null
  created_at: string
}

export interface PriceSnapshot {
  id: string
  investment_id: string
  date: string
  unit_price: number | null
  total_value: number
  created_at: string
}

export interface InvestmentWithData extends Investment {
  transactions: Transaction[]
  snapshots: PriceSnapshot[]
  // Computed
  total_invested: number
  current_value: number
  pnl_absolute: number
  pnl_percent: number
  total_units: number | null
  current_unit_price: number | null
}

export interface AllocationItem {
  type: InvestmentType
  label: string
  value: number
  percent: number
  color: string
  currency: Currency
}

export interface EvolutionPoint {
  date: string
  value: number
  label: string
}

export interface EvolutionSeriesPoint {
  date: string
  total: number
  [key: string]: number | string
}

export interface EvolutionSeriesAsset {
  id: string
  name: string
  type: InvestmentType
  color: string
}

export interface EvolutionSeries {
  points: EvolutionSeriesPoint[]
  assets: EvolutionSeriesAsset[]
}

export interface DashboardData {
  investments: InvestmentWithData[]
  totalValue: number
  totalInvested: number
  pnlAbsolute: number
  pnlPercent: number
  allocation: AllocationItem[]
  evolution: EvolutionPoint[]
  currency: Currency
}
