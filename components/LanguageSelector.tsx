'use client'
import { useState, useRef, useEffect } from 'react'
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext'
import { ChevronDown } from 'lucide-react'

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-navy-700 border border-white/10 text-white/70 hover:text-white transition-all text-sm"
        title="Changer de langue / Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs hidden sm:block font-medium">{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-navy-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]">
          <div className="p-1">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  lang === l.code
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.name}</span>
                {lang === l.code && <span className="text-orange-400 text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
