'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { BookOpen, Award, Clock, CheckCircle, BarChart3, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
        setProfile(p)
        setLoading(false)
      })
    })
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-white/50">Chargement...</div></div>
  }

  const stats = [
    { label: 'Formations suivies', value: '8', icon: BookOpen, color: '#FF6B35' },
    { label: 'Formations terminees', value: '5', icon: CheckCircle, color: '#00C896' },
    { label: 'Heures de formation', value: '12h', icon: Clock, color: '#FFD700' },
    { label: 'Certificats obtenus', value: '3', icon: Award, color: '#6C63FF' },
  ]

  const formations = [
    { titre: 'Securite chantier BTP', secteur: 'Construction', progress: 100, termine: true },
    { titre: 'Gestion risques chimiques', secteur: 'Chimie', progress: 65, termine: false },
    { titre: 'Premiers secours SST', secteur: 'Tous secteurs', progress: 30, termine: false },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 flex items-start justify-between">
            <div>
              <h1 className="section-title text-white mb-1">Bonjour, {profile?.prenom || 'Utilisateur'} 👋</h1>
              <p className="text-white/50 text-sm">Votre espace formation personnel</p>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="btn-secondary py-2 px-4 text-sm">
              <LogOut size={14} />Deconnexion
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => {
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
            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} style={{ color: 'var(--orange)' }} />Mes formations
              </h2>
              <div className="space-y-4">
                {formations.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-white text-sm font-medium">{f.titre}</div>
                        <div className="text-white/40 text-xs">{f.secteur}</div>
                      </div>
                      <span className={`text-xs font-medium ${f.termine ? 'text-green-400' : 'text-white/50'}`}>{f.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${f.progress}%`, background: f.termine ? 'var(--safe)' : undefined }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/secteurs" className="btn-secondary w-full justify-center py-2 mt-4 text-sm">Continuer mes formations</Link>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Award size={18} style={{ color: 'var(--orange)' }} />Mes certificats
              </h2>
              <div className="space-y-3">
                {[
                  { titre: 'Securite BTP', date: 'Nov 2024', score: 92 },
                  { titre: 'Premiers secours', date: 'Oct 2024', score: 88 },
                  { titre: 'Incendie SSIAP', date: 'Sep 2024', score: 95 },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-navy-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Award size={16} className="text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{c.titre}</div>
                        <div className="text-white/40 text-xs">{c.date}</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold text-sm">{c.score}/100</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
