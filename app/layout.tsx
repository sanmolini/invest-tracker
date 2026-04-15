import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Invest Tracker',
  description: 'Dashboard de inversiones personales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-bg-primary">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
