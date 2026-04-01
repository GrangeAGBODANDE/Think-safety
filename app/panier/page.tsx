'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react'

interface CartItem {
  id: string
  titre: string
  prix: number
  prix_type: string
  categorie: string
  localisation?: string
  quantite: number
}

export default function PanierPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'panier' | 'checkout' | 'confirmation'>('panier')
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', adresse: '', ville: '', pays: 'Benin', notes: ''
  })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ts_cart') || '[]')
      setCart(saved)
    } catch { setCart([]) }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
          if (p) {
            setProfile(p)
            setForm(prev => ({
              ...prev,
              prenom: p.prenom || '',
              nom: p.nom || '',
              email: data.user.email || '',
              telephone: p.telephone || '',
            }))
          }
        })
      }
    })
  }, [])

  function updateCart(newCart: CartItem[]) {
    setCart(newCart)
    localStorage.setItem('ts_cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart_updated'))
  }

  function removeItem(id: string) {
    updateCart(cart.filter(i => i.id !== id))
  }

  function updateQty(id: string, delta: number) {
    updateCart(cart.map(i => i.id === id ? { ...i, quantite: Math.max(1, i.quantite + delta) } : i))
  }

  const total = cart.reduce((sum, i) => sum + (i.prix * i.quantite), 0)

  async function placeOrder() {
    if (!form.prenom || !form.nom || !form.email || !form.telephone) return
    setLoading(true)

    const { data: order, error } = await supabase.from('orders').insert({
      client_user_id: user?.id || null,
      client_prenom: form.prenom,
      client_nom: form.nom,
      client_email: form.email,
      client_telephone: form.telephone,
      client_adresse: form.adresse,
      client_ville: form.ville,
      client_pays: form.pays,
      notes: form.notes,
      total: total,
      statut: 'en_attente',
    }).select().single()

    if (!error && order) {
      // Ajouter les items
      await supabase.from('order_items').insert(
        cart.map(i => ({
          order_id: order.id,
          annonce_id: i.id,
          quantite: i.quantite,
          prix_unitaire: i.prix,
          sous_total: i.prix * i.quantite,
        }))
      )
      setOrderNumber(order.order_number)
      updateCart([])
      setStep('confirmation')
    }
    setLoading(false)
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="section-title text-white mb-3">Commande confirmee !</h1>
            <p className="text-white/60 mb-2">
              Votre commande <strong className="text-white">{orderNumber}</strong> a ete enregistree.
            </p>
            <p className="text-white/40 text-sm mb-8">
              Les vendeurs ont ete notifies et vous contacteront directement par telephone ou email.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/marketplace" className="btn-primary py-3 px-6">
                <ShoppingBag size={16} />Continuer mes achats
              </Link>
              <Link href="/dashboard" className="btn-secondary py-3 px-6">Mon espace</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-8">
            <h1 className="section-title text-white mb-1 flex items-center gap-3">
              <ShoppingCart size={28} style={{ color: 'var(--orange)' }} />
              Mon Panier
            </h1>
            <p className="text-white/40 text-sm">{cart.length} article{cart.length !== 1 ? 's' : ''}</p>
          </div>

          {cart.length === 0 ? (
            <div className="card p-16 text-center">
              <ShoppingCart size={48} className="text-white/20 mx-auto mb-4" />
              <h2 className="text-white font-display font-bold text-xl mb-3">Votre panier est vide</h2>
              <p className="text-white/40 mb-6">Parcourez le marketplace pour trouver des equipements de securite.</p>
              <Link href="/marketplace" className="btn-primary py-3 px-8">
                <ShoppingBag size={18} />Explorer le marketplace
              </Link>
            </div>
          ) : step === 'panier' ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Articles */}
              <div className="lg:col-span-2 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="card p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center text-2xl flex-shrink-0">
                      {item.categorie === 'EPI' ? '🦺' :
                       item.categorie === 'Formation' ? '🎓' :
                       item.categorie === 'Detection' ? '📡' : '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{item.titre}</h3>
                      <p className="text-white/40 text-xs">{item.categorie} {item.localisation && `· ${item.localisation}`}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-white/60 hover:text-white hover:bg-navy-600 transition-all">
                          <Minus size={13} />
                        </button>
                        <span className="text-white text-sm font-medium w-6 text-center">{item.quantite}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-white/60 hover:text-white hover:bg-navy-600 transition-all">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold">
                        {item.prix > 0 ? `${(item.prix * item.quantite).toLocaleString()} F` : 'Sur devis'}
                      </p>
                      {item.prix > 0 && item.quantite > 1 && (
                        <p className="text-white/30 text-xs">{item.prix.toLocaleString()} F / u</p>
                      )}
                      <button onClick={() => removeItem(item.id)} className="mt-2 text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé */}
              <div className="space-y-4">
                <div className="card p-5">
                  <h2 className="font-display font-bold text-white mb-4">Résumé</h2>
                  <div className="space-y-2 mb-4">
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span className="text-white/60 truncate max-w-32">{i.titre}</span>
                        <span className="text-white flex-shrink-0 ml-2">
                          {i.prix > 0 ? `${(i.prix * i.quantite).toLocaleString()} F` : 'Devis'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-bold text-white" style={{ color: 'var(--orange)' }}>
                      {total > 0 ? `${total.toLocaleString()} FCFA` : 'Sur devis'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setStep('checkout')} className="btn-primary w-full justify-center py-3">
                  Passer la commande <ArrowRight size={16} />
                </button>
                <Link href="/marketplace" className="btn-secondary w-full justify-center py-2.5 text-sm">
                  Continuer mes achats
                </Link>
              </div>
            </div>
          ) : (
            /* Checkout */
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="card p-6">
                  <h2 className="font-display font-bold text-white text-lg mb-5">Vos informations</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Prenom *</label>
                      <input type="text" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} className="input-field" placeholder="Jean" />
                    </div>
                    <div>
                      <label className="input-label">Nom *</label>
                      <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="input-field" placeholder="Dupont" />
                    </div>
                    <div>
                      <label className="input-label">Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="email@exemple.com" />
                    </div>
                    <div>
                      <label className="input-label">Telephone *</label>
                      <input type="tel" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="input-field" placeholder="+229 97 XX XX XX" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Adresse</label>
                      <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} className="input-field" placeholder="Quartier, rue..." />
                    </div>
                    <div>
                      <label className="input-label">Ville</label>
                      <input type="text" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} className="input-field" placeholder="Cotonou" />
                    </div>
                    <div>
                      <label className="input-label">Pays</label>
                      <input type="text" value={form.pays} onChange={e => setForm({...form, pays: e.target.value})} className="input-field" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Notes / Instructions</label>
                      <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="input-field resize-none" placeholder="Instructions de livraison, precisions..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="card p-5">
                  <h2 className="font-display font-bold text-white mb-4">Votre commande</h2>
                  <div className="space-y-2 mb-4">
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span className="text-white/60 truncate max-w-28">{i.titre} x{i.quantite}</span>
                        <span className="text-white flex-shrink-0 ml-2">
                          {i.prix > 0 ? `${(i.prix * i.quantite).toLocaleString()} F` : 'Devis'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between mb-4">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-bold" style={{ color: 'var(--orange)' }}>
                      {total > 0 ? `${total.toLocaleString()} FCFA` : 'Sur devis'}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs mb-4">
                    Les vendeurs vous contacteront directement pour confirmer et organiser la livraison / le paiement.
                  </p>
                  <button onClick={placeOrder} disabled={loading || !form.prenom || !form.email || !form.telephone}
                    className="btn-primary w-full justify-center py-3">
                    <CheckCircle size={16} />
                    {loading ? 'Envoi...' : 'Confirmer la commande'}
                  </button>
                </div>
                <button onClick={() => setStep('panier')} className="btn-secondary w-full justify-center py-2.5 text-sm">
                  Retour au panier
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
