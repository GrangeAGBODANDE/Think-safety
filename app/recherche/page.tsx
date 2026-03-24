'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Search, X, ArrowRight } from 'lucide-react'

const MOCK_RESULTS = [
  { id: 1, type: 'video', titre: 'Securite sur les chantiers BTP - Les fondamentaux', secteur: 'Construction BTP', href: '/secteurs/construction-btp' },
  { id: 2, type: 'document', titre: 'Guide EPI industrie manufacturiere', secteur: 'Industrie', href: '/secteurs/industrie-manufacturiere' },
  { id: 3, type: 'faq', titre: 'Quelle frequence pour les formations securite obligatoires ?', secteur: 'Tous secteurs', href: '/secteurs/bureaux-tertiaire' },
  { id: 4, type: 'alerte', titre: 'Casques de chantier contrefaits detectes', secteur: 'Construction BTP', href: '/alertes' },
  { id: 5, type: 'video', titre: 'Gestion des risques chimiques en laboratoire', secteur: 'Chimie', href: '/secteurs/chimie-pharmacie' },
  { id: 6, type: 'marketplace', titre: 'Kit EPI complet BTP - Casque, Gilet, Gants', secteur: 'Construction BTP', href: '/marketplace' },
]

const POPULAR = ['EPI BTP', 'incendie', 'premiers secours', 'risques chimiques', 'formation SST']
const typeColors: Record<string, string> = { video: '#2196F3', document: '#9C27B0', faq: '#00C896', alerte: '#FF4757', marketplace: '#FFD700' }

export default function RecherchePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof MOCK_RESULTS>([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setSearched(false); setResults([]); return }
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      setResults(MOCK_RESULTS.filter(r => r.titre.toLowerCase().includes(q) || r.secteur.toLowerCase().includes(q)))
      setSearched(true)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="py-10 text-center">
            <h1 className="section-title text-white mb-2">Rechercher</h1>
            <p className="text-white/50 text-sm">Videos, documents, FAQ, alertes, marketplace</p>
          </div>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher EPI, securite chimique, formation..." autoFocus className="input-field pl-12 pr-12 py-4 text-base" style={{ borderRadius: '16px' }} />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X size={16} /></button>
            )}
          </div>

          {!searched && (
            <div className="space-y-6">
              <div>
                <p className="text-white/40 text-sm mb-3">Recherches populaires</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((s) => (
                    <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-navy-800 border border-white/10 rounded-xl text-sm text-white/60 hover:text-orange-400 hover:border-orange-500/30 transition-all">{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-3">Explorer par secteur</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTEURS.slice(0, 6).map((s) => (
                    <Link key={s.slug} href={`/secteurs/${s.slug}`} className="flex items-center gap-2 px-3 py-2.5 bg-navy-800 border border-white/5 rounded-xl text-sm text-white/60 hover:text-white hover:border-white/20 transition-all">
                      <span>{s.icon}</span>{s.nom}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searched && (
            <div>
              <p className="text-white/40 text-sm mb-4">
                {results.length > 0
                  ? <><span className="text-white font-medium">{results.length} resultat{results.length > 1 ? 's' : ''}</span> pour &laquo; {query} &raquo;</>
                  : <>Aucun resultat pour &laquo; {query} &raquo;</>
                }
              </p>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((r) => (
                    <Link key={r.id} href={r.href} className="card p-4 flex items-center gap-4 group block">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white uppercase" style={{ background: `${typeColors[r.type]}20`, color: typeColors[r.type] }}>
                        {r.type.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium group-hover:text-orange-400 transition-colors">{r.titre}</p>
                        <p className="text-white/40 text-xs mt-0.5">{r.secteur}</p>
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 card">
                  <Search size={40} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Aucun resultat. Essayez d&apos;autres mots-cles.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
