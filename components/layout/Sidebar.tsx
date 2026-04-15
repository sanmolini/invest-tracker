'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/investments', icon: TrendingUp, label: 'Inversiones' },
  { href: '/prices', icon: RefreshCw, label: 'Actualizar Precios' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 bg-bg-secondary border-r border-bg-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <BarChart3 size={16} className="text-bg-primary" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">InvestTracker</div>
            <div className="text-[11px] text-text-muted">Portfolio personal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand/15 text-brand border border-brand/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-bg-border">
          <Link
            href="/investments/new"
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              pathname === '/investments/new'
                ? 'bg-brand/15 text-brand border border-brand/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            )}
          >
            <PlusCircle size={17} />
            Nueva Inversión
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-bg-border">
        <div className="text-[11px] text-text-muted">
          Datos actualizados manualmente
        </div>
      </div>
    </aside>
  )
}
