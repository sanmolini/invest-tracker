'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type ThemeConfig, DEFAULT_THEME, applyTheme } from '@/lib/theme'

interface ThemeContextValue {
  theme: ThemeConfig
  setTheme: (t: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('invest-tracker-theme')
      if (stored) {
        const parsed = JSON.parse(stored) as ThemeConfig
        setThemeState(parsed)
        applyTheme(parsed)
      }
    } catch {}
  }, [])

  const setTheme = (t: ThemeConfig) => {
    setThemeState(t)
    applyTheme(t)
    try { localStorage.setItem('invest-tracker-theme', JSON.stringify(t)) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
