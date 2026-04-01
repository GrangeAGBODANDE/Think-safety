'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, Eye, EyeOff, Lock, CheckCircle, Clock, Truck, XCircle, Crown } from 'lucide-react'

export default function MesCommandesPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [sellerProfile, setSellerProfile] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p || !p.is_seller) { router.push('/dashboard'); return }
      setProfile(p)

      // Recuperer le profil vendeur
      const { data: sp } = await supabase.from('seller_profiles').select('*').eq('user_id', user.id).single()
      if (sp) {
        setSellerProfile(sp)

        // Verifier abonnement
        const { data: sub } = await supabase
          .from('company_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('seller_profile_id', sp.id)
          .eq('statut', 'actif')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        setSubscription(sub)

        // Charger les commandes contenant des produits de cette entreprise
        const { data: items } = await supabase
          .from('order_items')
          .select('*, order:orders(*), annonce:marketplace_annonces(titre, categorie)')
          .eq('seller_profile_id', sp.id)
          .order('created_at', { ascending: false })
        setOrders(items || [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  const hasFullAccess = subscription?.plan?.acces_details_commandes === true

  const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
    en_attente: { label: 'En attente', color: '#FFD700', icon: Clock },
    confirmee: { label: 'Confirmee', color: '#00C896', icon: CheckCircle },
    en_cours: { label: 'En cours', color: '#2196F3', icon: Truck },
    livree: { label: 'Livree', color: '#00C896', icon: CheckCircle },
    annulee: { label: 'Annulee', color: '#FF4757', icon: XCircle },
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-white/50">Chargement...</p></div>
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-8 flex items-start justify-between">
            <div>
              <h1 className="section-title text-white mb-1">Mes Commandes</h1>
              <p className="text-white/40 text-sm">{orders.length} commandes recues</p>
            </div>
            {/* Badge abonnement */}
            <div className={`px-4 py-2 rounded-xl border text-sm ${hasFullAccess ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-white/50'}`}>
              {hasFullAccess ? (
                <span className="flex items-center gap-2"><Crown size={14} />{subscription?.plan?.nom}</span>
              ) : (
                <span className="flex items-center gap-2"><Lock size={14} />Plan Gratuit</span>
              )}
            </div>
          </div>

          {/* Banniere upgrade si pas d'abonnement */}
          {!hasFullAccess && orders.length > 0 && (
            <div className="card-glow p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Lock size={20} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">Debloquez les informations de contact</h3>
                <p className="text-white/50 text-sm">Vous recevez des commandes ! Passez a un abonnement Basic pour voir les noms, telephones et adresses de vos clients.</p>
              </div>
              <Link href="/abonnements" className="btn-primary py-2 px-5 text-sm flex-shrink-0">
                <Crown size={14} />S&apos;abonner
              </Link>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="card p-16 text-center">
              <ShoppingBag size={48} className="text-white/20 mx-auto mb-4" />
              <h2 className="text-white font-display font-bold text-xl mb-3">Aucune commande pour l&apos;instant</h2>
              <p className="text-white/40 mb-6">Vos commandes apparaitront ici des qu&apos;un client passera une commande pour vos produits.</p>
              <Link href="/marketplace/publier" className="btn-primary py-2 px-6">Publier une annonce</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(item => {
                const cfg = statutConfig[item.order?.statut] || statutConfig.en_attente
                const Icon = cfg.icon
                return (
                  <div key={item.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{item.order?.order_number}</span>
                          <span className="badge text-[10px]" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                            <Icon size={10} className="mr-1" />{cfg.label}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs">
                          {item.order?.created_at ? new Date(item.order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{(item.sous_total || 0).toLocaleString()} FCFA</p>
                        <p className="text-white/40 text-xs">Qte: {item.quantite}</p>
                      </div>
                    </div>

                    <div className="bg-navy-700 rounded-xl p-3 mb-4">
                      <p className="text-white/60 text-xs mb-0.5">Article commande</p>
                      <p className="text-white text-sm font-medium">{item.annonce?.titre}</p>
                      <span className="badge badge-orange text-[10px] mt-1">{item.annonce?.categorie}</span>
                    </div>

                    {/* Infos client - masquees sans abonnement */}
                    <div className={`rounded-xl p-4 border ${hasFullAccess ? 'bg-navy-700 border-white/5' : 'bg-navy-800 border-orange-500/20'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white/60 text-xs uppercase tracking-widest font-mono">Informations client</p>
                        {!hasFullAccess && <Lock size={13} className="text-orange-400" />}
                      </div>

                      {hasFullAccess ? (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-white/40 text-xs">Nom</p>
                            <p className="text-white">{item.order?.client_prenom} {item.order?.client_nom}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Telephone</p>
                            <p className="text-white">{item.order?.client_telephone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Email</p>
                            <p className="text-white">{item.order?.client_email}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Ville</p>
                            <p className="text-white">{item.order?.client_ville || '-'}, {item.order?.client_pays}</p>
                          </div>
                          {item.order?.client_adresse && (
                            <div className="col-span-2">
                              <p className="text-white/40 text-xs">Adresse</p>
                              <p className="text-white">{item.order?.client_adresse}</p>
                            </div>
                          )}
                          {item.order?.notes && (
                            <div className="col-span-2">
                              <p className="text-white/40 text-xs">Notes</p>
                              <p className="text-white/70 italic text-xs">{item.order?.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {['Nom complet', 'Telephone', 'Email', 'Adresse'].map(field => (
                            <div key={field}>
                              <p className="text-white/40 text-xs">{field}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-4 bg-navy-600 rounded flex-1" style={{ filter: 'blur(4px)' }}>
                                  <p className="text-white text-sm">••••••••••</p>
                                </div>
                                <EyeOff size={12} className="text-orange-400/60" />
                              </div>
                            </div>
                          ))}
                          <div className="col-span-2 pt-2">
                            <Link href="/abonnements" className="text-orange-400 text-xs hover:underline flex items-center gap-1">
                              <Crown size={11} />Debloquer avec un abonnement Basic
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
