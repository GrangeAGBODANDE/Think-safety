'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, Plus, Star, MapPin, BadgeCheck, Heart } from 'lucide-react'

const ANNONCES = [
  { id: 1, titre: 'Kit EPI complet BTP', desc: 'Casque EN397, gilet HV, gants, chaussures S3. Livraison Cotonou.', prix: 85000, categorie: 'EPI', vendeur: 'SafeEquip SARL', certifie: true, note: 4.8, localisation: 'Cotonou', emoji: '🦺' },
  { id: 2, titre: 'Formation SSIAP niveau 1', desc: 'Formation securite incendie 70h. Certificat reconnu. Sessions mensuelles.', prix: 120000, categorie: 'Formation', vendeur: 'FireSafe Academy', certifie: true, note: 4.9, localisation: 'Cotonou', emoji: '🎓' },
  { id: 3, titre: 'Detecteur gaz portable 4 en 1', desc: 'Detection CO, H2S, O2 et gaz explosifs. Certifie ATEX. Garantie 2 ans.', prix: 195000, categorie: 'Detection', vendeur: 'TechSafe Pro', certifie: true, note: 4.7, localisation: 'Porto-Novo', emoji: '📡' },
  { id: 4, titre: 'Audit HSE entreprise complet', desc: 'Audit securite, rapport detaille et plan d actions. Devis sur demande.', prix: 0, categorie: 'Service', vendeur: 'ConsultHSE Afrique', certifie: true, note: 4.9, localisation: 'Cotonou', emoji: '🛡️' },
  { id: 5, titre: 'Kit premiers secours professionnel', desc: 'Valise complete 147 pieces, conforme norme EN 13157.', prix: 45000, categorie: 'Premiers secours', vendeur: 'MedSafe Store', certifie: false, note: 4.5, localisation: 'Abomey-Calavi', emoji: '🩺' },
  { id: 6, titre: 'Panneaux signalisation securite', desc: 'Pack 20 panneaux ISO 7010. Interdiction, obligation, danger, secours.', prix: 32000, categorie: 'Signalisation', vendeur: 'SignalPro Benin', certifie: false, note: 4.3, localisation: 'Cotonou', emoji: '⚠️' },
]

const CATEGORIES = ['Tous', 'EPI', 'Formation', 'Service', 'Detection', 'Premiers secours', 'Signalisation']

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [liked, setLiked] = useState<number[]>([])

  const filtered = ANNONCES.filter(a => {
    const matchSearch = a.titre.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = categorie === 'Tous' || a.categorie === categorie
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="section-eyebrow mb-3">EPI, Formations, Services HSE</div>
              <h1 className="section-title text-white">Marketplace Securite</h1>
              <p className="text-white/50 text-sm mt-2">Trouvez equipements et prestataires certifies pres de chez vous.</p>
            </div>
            <Link href="/marketplace/publier" className="btn-primary flex-shrink-0"><Plus size={16} />Publier une annonce</Link>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher EPI, formation, service..." className="input-field pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategorie(c)}
                  className={`px-4 py-1.5 rounded-xl border text-sm transition-all ${categorie === c ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <div key={a.id} className="card group overflow-hidden">
                <div className="bg-navy-700 h-28 flex items-center justify-center text-5xl relative">
                  {a.emoji}
                  <button onClick={() => setLiked(liked.includes(a.id) ? liked.filter(i => i !== a.id) : [...liked, a.id])}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700 transition-all">
                    <Heart size={14} className={liked.includes(a.id) ? 'text-red-400 fill-red-400' : 'text-white/40'} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="badge badge-orange text-[10px]">{a.categorie}</span>
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />{a.note}
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1 group-hover:text-orange-400 transition-colors">{a.titre}</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{a.desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{a.prix > 0 ? `${a.prix.toLocaleString()} FCFA` : 'Sur devis'}</div>
                      <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
                        <MapPin size={10} />{a.localisation}
                        {a.certifie && <span className="ml-1 text-blue-400 flex items-center gap-0.5"><BadgeCheck size={10} />Certifie</span>}
                      </div>
                    </div>
                    <button className="btn-secondary py-1.5 px-3 text-xs">Contacter</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 card-glow p-8 text-center">
            <h3 className="font-display font-bold text-white text-xl mb-2">Vous vendez du materiel securite ?</h3>
            <p className="text-white/50 text-sm mb-5">Publiez votre annonce gratuitement et touchez des milliers de professionnels.</p>
            <Link href="/marketplace/publier" className="btn-primary"><Plus size={16} />Publier une annonce gratuite</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
