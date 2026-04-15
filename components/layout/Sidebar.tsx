'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, TrendingUp, RefreshCw, PlusCircle, BarChart3, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/investments', icon: TrendingUp, label: 'Inversiones' },
  { href: '/prices', icon: RefreshCw, label: 'Actualizar Precios' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email })
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex w-60 flex-shrink-0 bg-bg-secondary border-r border-bg-border flex-col">
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

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-bg-border space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-text-primary truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-loss hover:bg-loss/5 transition-all duration-200"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
        <div className="px-3 pt-1 text-[10px] text-text-muted/50 font-mono">v0.2.0</div>
      </div>
    </aside>
  )
}
