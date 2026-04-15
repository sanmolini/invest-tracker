import clsx from 'clsx'
import { INVESTMENT_TYPES } from '@/lib/constants'
import type { InvestmentType } from '@/types'

interface TypeBadgeProps {
  type: InvestmentType
  showEmoji?: boolean
  size?: 'sm' | 'md'
}

export function TypeBadge({ type, showEmoji = true, size = 'md' }: TypeBadgeProps) {
  const info = INVESTMENT_TYPES[type]
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      info.tailwind,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {showEmoji && <span>{info.emoji}</span>}
      {info.label}
    </span>
  )
}

interface PnlBadgeProps {
  value: number
  suffix?: string
  size?: 'sm' | 'md'
}

export function PnlBadge({ value, suffix = '%', size = 'md' }: PnlBadgeProps) {
  const isPositive = value >= 0
  const isZero = value === 0
  const sign = isPositive && !isZero ? '+' : ''

  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      isZero
        ? 'text-text-muted bg-bg-elevated'
        : isPositive
          ? 'text-gain bg-gain-muted'
          : 'text-loss bg-loss-muted',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {sign}{value.toFixed(2)}{suffix}
    </span>
  )
}
