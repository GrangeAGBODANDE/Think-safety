'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('ts_theme') as Theme) || 'dark'
    setThemeState(saved)
    applyTheme(saved)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    if (t === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const resolved = prefersDark ? 'dark' : 'light'
      root.setAttribute('data-theme', resolved)
      setResolvedTheme(resolved)
    } else {
      root.setAttribute('data-theme', t)
      setResolvedTheme(t)
    }
  }

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('ts_theme', t)
    applyTheme(t)
  }

  // Ecouter les changements de preference systeme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'auto') applyTheme('auto') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
