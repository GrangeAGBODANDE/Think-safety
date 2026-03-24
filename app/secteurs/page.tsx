'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Search, ArrowRight } from 'lucide-react'

export default function SecteursPage() {
  const [search, setSearch] = useState('')
  const filtered = SECTEURS.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="section-eyebrow mb-3">Tous les domaines</div>
            <h1 className="section-title text-white mb-4">18 Secteurs d&apos;activite</h1>
            <p className="text-white/50 max-w-lg mx-auto mb-8">Chaque secteur dispose de videos, documents, FAQ et alertes dedies.</p>
            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un secteur..." className="input-field pl-9" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Link key={s.slug} href={`/secteurs/${s.slug}`} className="card p-5 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${s.couleur}20`, border: `1px solid ${s.couleur}30` }}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-white text-base group-hover:text-orange-400 transition-colors">{s.nom}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${s.couleur}20`, color: s.couleur }}>{s.nb_contenus}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed mb-3">{s.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {s.risques.slice(0, 3).map((r) => (
                        <span key={r} className="badge badge-warn text-[9px] py-0.5">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-white/30 group-hover:text-orange-400 transition-colors">
                  <span className="text-xs mr-1">Voir le secteur</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/40">Aucun secteur trouve pour &laquo;{search}&raquo;</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
