'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Award, Clock, CheckCircle, BarChart3, LogOut, Sparkles, ArrowRight, Shield } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [certificats, setCertificats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      const [{ data: p }, { data: prog }, { data: certs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('user_progress').select('*, contenu:contenus(titre, type, secteur_slug)').eq('user_id', data.user.id),
        supabase.from('certificats').select('*, contenu:contenus(titre)').eq('user_id', data.user.id),
      ])
      setProfile(p)
      setProgress(prog || [])
      setCertificats(certs || [])
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="text-white/50">Chargement...</div>
      </div>
    )
  }

  const isNewUser = progress.length === 0 && certificats.length === 0

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="py-8 flex items-start justify-between">
            <div>
              <h1 className="section-title text-white mb-1">
                Bonjour, {profile?.prenom || 'cher membre'} 👋
              </h1>
              <p className="text-white/50 text-sm">
                {isNewUser ? 'Bienvenue sur Think Safety !' : 'Votre espace formation personnel'}
              </p>
            </div>
            <div className="flex gap-2">
              {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                <Link href="/admin" className="btn-primary py-2 px-4 text-sm">
                  <Shield size={14} />Admin
                </Link>
              )}
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                className="btn-secondary py-2 px-4 text-sm"
              >
                <LogOut size={14} />Deconnexion
              </button>
            </div>
          </div>

          {/* Nouvel utilisateur : ecran de bienvenue */}
          {isNewUser ? (
            <div className="space-y-6">
              {/* Message de bienvenue */}
              <div className="card-glow p-8 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-white text-2xl mb-3">
                  Bienvenue sur Think Safety !
                </h2>
                <p className="text-white/60 max-w-lg mx-auto mb-6 leading-relaxed">
                  Votre compte est pret. Choisissez un secteur d&apos;activite pour commencer votre premiere formation gratuitement. Tous nos contenus sont 100% gratuits.
                </p>
                <Link href="/secteurs" className="btn-primary py-3 px-8">
                  <BookOpen size={18} />
                  Choisir mon premier secteur
                </Link>
              </div>

              {/* Secteurs suggeres */}
              <div>
                <h3 className="font-display font-bold text-white mb-4">Secteurs populaires</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { slug: 'construction-btp', nom: 'Construction BTP', icon: '🏗️', couleur: '#FF6B35' },
                    { slug: 'sante-medical', nom: 'Sante & Medical', icon: '🏥', couleur: '#00C896' },
                    { slug: 'industrie-manufacturiere', nom: 'Industrie', icon: '⚙️', couleur: '#6C63FF' },
                    { slug: 'transport-logistique', nom: 'Transport', icon: '🚛', couleur: '#FF9800' },
                    { slug: 'agriculture', nom: 'Agriculture', icon: '🌾', couleur: '#8BC34A' },
                    { slug: 'bureaux-tertiaire', nom: 'Bureaux', icon: '🏢', couleur: '#2196F3' },
                    { slug: 'energie', nom: 'Energie', icon: '⚡', couleur: '#FFD700' },
                    { slug: 'chimie-pharmacie', nom: 'Chimie', icon: '🧪', couleur: '#E91E63' },
                  ].map(s => (
                    <Link key={s.slug} href={`/secteurs/${s.slug}`}
                      className="card p-4 text-center group hover:no-underline">
                      <div className="text-3xl mb-2">{s.icon}</div>
                      <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{s.nom}</div>
                      <div className="mt-2 flex items-center justify-center gap-1 text-white/30 text-xs group-hover:text-orange-400 transition-colors">
                        Commencer <ArrowRight size={10} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Utilisateur avec des formations */
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Formations suivies', value: progress.length, icon: BookOpen, color: '#FF6B35' },
                  { label: 'Terminees', value: progress.filter(p => p.termine).length, icon: CheckCircle, color: '#00C896' },
                  { label: 'En cours', value: progress.filter(p => !p.termine).length, icon: Clock, color: '#FFD700' },
                  { label: 'Certificats', value: certificats.length, icon: Award, color: '#6C63FF' },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="card p-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}20` }}>
                        <Icon size={18} style={{ color: s.color }} />
                      </div>
                      <div className="text-2xl font-bold font-display text-white">{s.value}</div>
                      <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
                    </div>
                  )
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Formations en cours */}
                <div className="card p-5">
                  <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={18} style={{ color: 'var(--orange)' }} />Mes formations
                  </h2>
                  {progress.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-white/40 text-sm mb-3">Aucune formation commencee</p>
                      <Link href="/secteurs" className="btn-primary py-2 px-4 text-sm">Parcourir les formations</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progress.slice(0, 4).map((p, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <div className="text-white text-sm font-medium truncate max-w-48">{p.contenu?.titre || 'Formation'}</div>
                              <div className="text-white/40 text-xs">{p.contenu?.secteur_slug || ''}</div>
                            </div>
                            <span className={`text-xs font-medium ${p.termine ? 'text-green-400' : 'text-white/50'}`}>
                              {p.progression || 0}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${p.progression || 0}%`, background: p.termine ? 'var(--safe)' : undefined }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/secteurs" className="btn-secondary w-full justify-center py-2 mt-4 text-sm">
                    Voir toutes les formations
                  </Link>
                </div>

                {/* Certificats */}
                <div className="card p-5">
                  <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <Award size={18} style={{ color: 'var(--orange)' }} />Mes certificats
                  </h2>
                  {certificats.length === 0 ? (
                    <div className="text-center py-6">
                      <Award size={32} className="text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">Completez des formations pour obtenir vos certificats</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificats.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-navy-700 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                              <Award size={16} className="text-yellow-400" />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium truncate max-w-40">{c.contenu?.titre || 'Certificat'}</div>
                              <div className="text-white/40 text-xs">{c.delivre_le ? new Date(c.delivre_le).toLocaleDateString('fr-FR') : ''}</div>
                            </div>
                          </div>
                          {c.score && <div className="text-green-400 font-bold text-sm">{c.score}/100</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
