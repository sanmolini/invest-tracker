import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  changeLabel?: string
  accent?: 'default' | 'gain' | 'loss' | 'brand'
  icon?: React.ReactNode
  delay?: number
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  accent = 'default',
  icon,
  delay = 0,
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  const accentStyles = {
    default: 'border-bg-border',
    gain: 'border-gain/20',
    loss: 'border-loss/20',
    brand: 'border-brand/20',
  }

  return (
    <div
      className={clsx(
        'card p-5 animate-fade-up',
        accentStyles[accent]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted">
            {icon}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-text-primary font-mono mb-1.5 tracking-tight">
        {value}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {change !== undefined && (
          <span className={clsx(
            'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
            isPositive ? 'text-gain bg-gain-muted' : 'text-loss bg-loss-muted'
          )}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-text-muted">{subtitle}</span>
        )}
        {changeLabel && (
          <span className="text-xs text-text-muted">{changeLabel}</span>
        )}
      </div>
    </div>
  )
}
