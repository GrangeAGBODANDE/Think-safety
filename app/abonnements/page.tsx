'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Zap, Star, Building2, Gift } from 'lucide-react'

const planIcons: Record<string, any> = {
  gratuit: Gift,
  basic: Zap,
  professionnel: Star,
  entreprise: Building2,
}

export default function AbonnementsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState<'mensuel' | 'annuel'>('mensuel')

  useEffect(() => {
    supabase.from('subscription_plans').select('*').eq('actif', true).order('ordre').then(({ data }) => {
      setPlans(data || [])
      setLoading(false)
    })
  }, [])

  const planColors: Record<string, string> = {
    gratuit: '#8B949E',
    basic: '#2196F3',
    professionnel: '#FF6B35',
    entreprise: '#9C27B0',
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="text-center py-16">
            <div className="section-eyebrow mb-4">Pour les entreprises</div>
            <h1 className="section-title text-white mb-4">
              Choisissez votre <span className="gradient-text">abonnement</span>
            </h1>
            <p className="text-white/50 max-w-lg mx-auto mb-8">
              Vendez vos equipements de securite, formations et services HSE sur la plateforme la plus consultee d&apos;Afrique de l&apos;Ouest.
            </p>

            {/* Toggle mensuel/annuel */}
            <div className="inline-flex items-center gap-1 bg-navy-800 border border-white/10 rounded-xl p-1">
              <button onClick={() => setBilling('mensuel')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === 'mensuel' ? 'bg-navy-700 text-white' : 'text-white/40 hover:text-white'}`}>
                Mensuel
              </button>
              <button onClick={() => setBilling('annuel')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === 'annuel' ? 'bg-navy-700 text-white' : 'text-white/40 hover:text-white'}`}>
                Annuel
                <span className="ml-2 badge badge-safe text-[10px]">-17%</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <div key={i} className="card p-6 h-96 shimmer" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan) => {
                const Icon = planIcons[plan.slug] || Star
                const color = planColors[plan.slug] || '#FF6B35'
                const prix = billing === 'annuel' ? Math.round(plan.prix_annuel / 12) : plan.prix_mensuel
                const isPopular = plan.slug === 'professionnel'

                return (
                  <div key={plan.id}
                    className={`card p-6 relative flex flex-col ${isPopular ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                    style={isPopular ? { borderColor: 'rgba(255,107,53,0.4)' } : {}}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="badge badge-orange text-[10px] px-3 py-1 whitespace-nowrap">Plus populaire</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
                        <Icon size={20} style={{ color }} />
                      </div>
                      <h3 className="font-display font-bold text-white text-lg">{plan.nom}</h3>
                      <p className="text-white/40 text-sm mt-1">{plan.description}</p>
                    </div>

                    <div className="mb-5">
                      {plan.prix_mensuel === 0 ? (
                        <div className="text-3xl font-bold font-display text-white">Gratuit</div>
                      ) : (
                        <>
                          <span className="text-3xl font-bold font-display text-white">
                            {prix.toLocaleString()}
                          </span>
                          <span className="text-white/40 text-sm"> FCFA/mois</span>
                          {billing === 'annuel' && (
                            <p className="text-green-400 text-xs mt-1">
                              {plan.prix_annuel.toLocaleString()} FCFA/an
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="space-y-2 flex-1 mb-6">
                      {(plan.fonctionnalites || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.slug === 'gratuit' ? '/auth' : `/auth?plan=${plan.slug}`}
                      className={`w-full justify-center py-2.5 text-sm ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      {plan.slug === 'gratuit' ? 'Commencer gratuitement' : `Choisir ${plan.nom}`}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

          {/* FAQ abonnements */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-white text-2xl text-center mb-8">Questions frequentes</h2>
            <div className="space-y-4">
              {[
                { q: 'Puis-je changer de plan a tout moment ?', r: 'Oui, vous pouvez upgrader ou downgrader votre abonnement a tout moment depuis votre espace entreprise.' },
                { q: 'Quels moyens de paiement sont acceptes ?', r: 'MTN MoMo, Orange Money, Moov Money, Wave, carte bancaire et PayPal. D\'autres moyens seront bientot disponibles.' },
                { q: 'Que se passe-t-il si je depasse ma limite d\'annonces ?', r: 'Vos annonces restent visibles mais vous ne pourrez pas en ajouter de nouvelles tant que vous n\'avez pas supprime ou upgrade.' },
                { q: 'Les commandes des clients sont-elles visibles sans abonnement ?', r: 'Oui, mais les informations de contact (telephone, email, adresse) sont masquees. Un abonnement Basic ou superieur donne acces aux details complets.' },
              ].map((faq, i) => (
                <div key={i} className="card p-5">
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-white/50 text-sm">{faq.r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
