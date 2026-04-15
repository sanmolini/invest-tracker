'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, RefreshCw, PlusCircle, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/investments', icon: TrendingUp,      label: 'Portfolio'  },
  { href: '/investments/new', icon: PlusCircle,  label: 'Nueva'      },
  { href: '/prices',      icon: RefreshCw,       label: 'Precios'    },
  { href: '/settings',    icon: Settings,        label: 'Ajustes'    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-bg-border safe-area-inset-bottom">
      <div className="absolute top-1 right-2 text-[9px] font-mono text-text-muted/40">v0.2.0</div>
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive ? 'text-brand' : 'text-text-muted'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
