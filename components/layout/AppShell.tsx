'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

const AUTH_PATHS = ['/login', '/forgot-password', '/reset-password', '/auth']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Auth pages: full-screen, no sidebar, no bottom nav
  if (isAuth) {
    return (
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    )
  }

  // App pages: sidebar (desktop) + bottom nav (mobile)
  return (
    <>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="min-h-full p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
