/*'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const LANGUAGES = [
  { code: 'fr', googleCode: 'fr',    name: 'Français',  flag: '🇫🇷' },
  { code: 'en', googleCode: 'en',    name: 'English',   flag: '🇬🇧' },
  { code: 'es', googleCode: 'es',    name: 'Español',   flag: '🇪🇸' },
  { code: 'zh', googleCode: 'zh-CN', name: '中文',       flag: '🇨🇳' },
  { code: 'de', googleCode: 'de',    name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'ko', googleCode: 'ko',    name: '한국어',     flag: '🇰🇷' },
  { code: 'ru', googleCode: 'ru',    name: 'Русский',   flag: '🇷🇺' },
  { code: 'ar', googleCode: 'ar',    name: 'العربية',   flag: '🇸🇦' },
]

export default function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('fr')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Lire la langue depuis le cookie Google Translate ou localStorage
    try {
      const saved = localStorage.getItem('ts_ui_lang') || 'fr'
      setCurrentLang(saved)
    } catch {}
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function changeLang(lang: typeof LANGUAGES[0]) {
    localStorage.setItem('ts_ui_lang', lang.code)
    setCurrentLang(lang.code)
    setOpen(false)

    // Direction RTL pour l'arabe
    document.documentElement.dir = lang.code === 'ar' ? 'rtl' : 'ltr'

    if (lang.code === 'fr') {
      // Revenir au français — supprimer le cookie Google Translate
      const hostname = window.location.hostname
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`
      window.location.reload()
      return
    }

    // Appliquer la traduction via le select Google Translate (méthode 1)
    function applyTranslation() {
      const selects = document.querySelectorAll('select.goog-te-combo')
      if (selects.length > 0) {
        const select = selects[0] as HTMLSelectElement
        select.value = lang.googleCode
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
    }

    // Essayer immédiatement, puis avec délai si pas prêt
    if (!applyTranslation()) {
      // Google Translate pas encore chargé — utiliser la méthode cookie + reload
      const hostname = window.location.hostname
      document.cookie = `googtrans=/fr/${lang.googleCode}; path=/;`
      document.cookie = `googtrans=/fr/${lang.googleCode}; path=/; domain=${hostname}`
      document.cookie = `googtrans=/fr/${lang.googleCode}; path=/; domain=.${hostname}`
      window.location.reload()
    }
  }

  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-sm"
        style={{
          background: 'var(--bg-input)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
        title="Changer de langue"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-medium hidden sm:block">{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-[200] border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="p-1">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => changeLang(l)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={currentLang === l.code
                  ? { background: 'rgba(212,80,15,0.1)', color: 'var(--orange)' }
                  : { color: 'var(--text-secondary)' }
                }
                onMouseEnter={e => {
                  if (currentLang !== l.code) {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (currentLang !== l.code) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.name}</span>
                {currentLang === l.code && (
                  <span style={{ color: 'var(--orange)' }} className="text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
