import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Invest Tracker',
  description: 'Dashboard de inversiones personales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-bg-primary">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
