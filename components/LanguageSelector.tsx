'use client'
import { useLang } from '@/contexts/LanguageContext'

export default function LanguageSelector() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border p-0.5"
      style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
      <button
        onClick={() => setLang('fr')}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
        style={lang === 'fr'
          ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
          : { color: 'var(--text-secondary)' }
        }
      >
        🇫🇷 <span className="hidden sm:inline">FR</span>
      </button>
      <button
        onClick={() => setLang('en')}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
        style={lang === 'en'
          ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
          : { color: 'var(--text-secondary)' }
        }
      >
        🇬🇧 <span className="hidden sm:inline">EN</span>
      </button>
    </div>
  )
}
