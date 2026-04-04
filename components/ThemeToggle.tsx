// ============================================================
// FICHIER: components/ThemeToggle.tsx
// ============================================================
'use client'
import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'dark', icon: Moon, label: 'Sombre' },
    { value: 'light', icon: Sun, label: 'Clair' },
    { value: 'auto', icon: Monitor, label: 'Auto' },
  ] as const

  return (
    <div className="flex items-center gap-0.5 bg-navy-700 border border-white/10 rounded-lg p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
            theme === value
              ? 'bg-navy-800 text-white shadow-sm'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  )
}
