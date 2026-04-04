'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Search, Plus, Star, MapPin, BadgeCheck, Heart, ShoppingCart } from 'lucide-react'

const CATEGORIES = ['Tous', 'EPI', 'Formation', 'Service HSE', 'Detection', 'Incendie', 'Signalisation', 'Premiers secours', 'Autre']

const EMOJI_MAP: Record<string, string> = {
  'EPI': '🦺',
  'Formation': '🎓',
  'Detection': '📡',
  'Service HSE': '🛡️',
  'Premiers secours': '🩺',
  'Signalisation': '⚠️',
  'Incendie': '🔥',
  'Autre': '🔧',
}

export default function MarketplacePage() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [liked, setLiked] = useState<string[]>([])
  const [cartMsg, setCartMsg] = useState('')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('marketplace_annonces')
      .select('id, titre, description, categorie, secteur_slug, prix, prix_type, localisation, vendeur_certifie, note, images')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnnonces(data || [])
        setLoading(false)
      })

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('role, is_seller')
          .eq('id', data.user.id)
          .single()
          .then(({ data: p }) => setProfile(p))
      }
    })
  }, [])

  const canPublish =
    profile &&
    (['admin', 'superadmin', 'moderateur'].includes(profile.role) || profile.is_seller)

  function addToCart(annonce: any) {
    try {
      const cart = JSON.parse(localStorage.getItem('ts_cart') || '[]')
      const existing = cart.find((i: any) => i.id === annonce.id)
      let newCart
      if (existing) {
        newCart = cart.map((i: any) =>
          i.id === annonce.id ? { ...i, quantite: i.quantite + 1 } : i
        )
      } else {
        newCart = [
          ...cart,
          {
            id: annonce.id,
            titre: annonce.titre,
            prix: annonce.prix,
            prix_type: annonce.prix_type,
            categorie: annonce.categorie,
            localisation: annonce.localisation,
            quantite: 1,
          },
        ]
      }
      localStorage.setItem('ts_cart', JSON.stringify(newCart))
      window.dispatchEvent(new Event('cart_updated'))
      setCartMsg('Article ajoute au panier !')
      setTimeout(() => setCartMsg(''), 3000)
    } catch {}
  }

  const filtered = annonces.filter((a) => {
    const matchSearch =
      !search ||
      a.titre?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
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
              <p className="text-white/50 text-sm mt-2">
                Trouvez equipements et prestataires certifies pres de chez vous.
              </p>
            </div>
            {canPublish && (
              <Link href="/marketplace/publier" className="btn-primary flex-shrink-0">
                <Plus size={16} />
                Publier une annonce
              </Link>
            )}
          </div>

          {cartMsg && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-500 text-white rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
              <ShoppingCart size={16} />
              {cartMsg}
            </div>
          )}

          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher EPI, formation, service..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategorie(c)}
                  className={`px-4 py-1.5 rounded-xl border text-sm transition-all ${
                    categorie === c
                      ? 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                      : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="bg-navy-700 h-28 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-navy-700 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-navy-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-white/40 mb-4">Aucune annonce trouvee</p>
              {canPublish && (
                <Link href="/marketplace/publier" className="btn-primary py-2 px-5 text-sm">
                  <Plus size={14} />
                  Publier une annonce
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((a) => (
                <div key={a.id} className="card group overflow-hidden flex flex-col">
                  <div className="bg-navy-700 h-36 flex items-center justify-center relative overflow-hidden">
                    {a.images && a.images.length > 0 ? (
                      <img
                        src={a.images[0]}
                        alt={a.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">{EMOJI_MAP[a.categorie] || '🔧'}</span>
                    )}
                    <button
                      onClick={() =>
                        setLiked((prev) =>
                          prev.includes(a.id)
                            ? prev.filter((i) => i !== a.id)
                            : [...prev, a.id]
                        )
                      }
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700 transition-all"
                    >
                      <Heart
                        size={14}
                        className={
                          liked.includes(a.id)
                            ? 'text-red-400 fill-red-400'
                            : 'text-white/40'
                        }
                      />
                    </button>
                    {a.vendeur_certifie && (
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-info text-[10px]">
                          <BadgeCheck size={9} className="mr-0.5" />
                          Certifie
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="badge badge-orange text-[10px]">{a.categorie}</span>
                      {a.note && (
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {a.note}
                        </div>
                      )}
                    </div>

                    <h3 className="text-white font-medium text-sm mb-1 group-hover:text-orange-400 transition-colors leading-snug">
                      {a.titre}
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                      {a.description}
                    </p>

                    {a.localisation && (
                      <div className="flex items-center gap-1 text-white/30 text-xs mb-3">
                        <MapPin size={10} />
                        {a.localisation}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-white font-bold text-sm">
                          {a.prix > 0 ? `${a.prix.toLocaleString()} FCFA` : 'Sur devis'}
                        </div>
                        {a.prix_type && a.prix_type !== 'fixe' && (
                          <div className="text-white/30 text-xs mt-0.5">{a.prix_type}</div>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(a)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: 'rgba(255,107,53,0.15)',
                          color: 'var(--orange)',
                          border: '1px solid rgba(255,107,53,0.25)',
                        }}
                      >
                        <ShoppingCart size={13} />
                        {a.prix > 0 ? 'Ajouter' : 'Demander'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canPublish && annonces.length > 0 && (
            <div className="mt-12 card-glow p-8 text-center">
              <h3 className="font-display font-bold text-white text-xl mb-2">
                Ajouter un produit ou service
              </h3>
              <p className="text-white/50 text-sm mb-5">
                Publiez une annonce directement sur le marketplace.
              </p>
              <Link href="/marketplace/publier" className="btn-primary">
                <Plus size={16} />
                Publier une annonce
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
