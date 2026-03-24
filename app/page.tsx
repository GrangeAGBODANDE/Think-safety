'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Shield, BookOpen, FileText, HelpCircle, Bell, ShoppingBag, Award, ArrowRight, Star, Lock, Smartphone, ChevronRight, AlertTriangle, Search, BarChart3 } from 'lucide-react'

function useCounter(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

const ALERTES_PREVIEW = [
  { niveau: 'urgence', secteur: 'Construction', titre: 'Accident grave sur chantier - Cotonou Nord', date: 'Il y a 2h', region: 'Littoral, Benin' },
  { niveau: 'attention', secteur: 'Agriculture', titre: 'Risque exposition aux pesticides - Saison des pluies', date: 'Il y a 5h', region: 'Atlantique, Benin' },
  { niveau: 'info', secteur: 'Transport', titre: 'Nouvelles regles transport marchandises dangereuses', date: 'Il y a 1j', region: 'Afrique de l Ouest' },
]

const FONCTIONNALITES = [
  { icon: BarChart3, titre: 'Videos de Formation', desc: 'Des centaines de videos explicatives dans chaque secteur.', couleur: '#FF6B35' },
  { icon: FileText, titre: 'Fiches & Documents', desc: 'Fiches reflexe, guides EPI telechargeables en PDF.', couleur: '#00C896' },
  { icon: HelpCircle, titre: 'FAQ & Quiz', desc: 'Questions-reponses validees par des experts.', couleur: '#FFD700' },
  { icon: Bell, titre: 'Alertes Locales', desc: 'Notifications en temps reel sur les accidents.', couleur: '#FF4757' },
  { icon: ShoppingBag, titre: 'Marketplace', desc: 'Trouvez EPI, formations et prestataires HSE.', couleur: '#6C63FF' },
  { icon: Award, titre: 'Certificats', desc: 'Attestations sur les modules completes.', couleur: '#03A9F4' },
]

export default function HomePage() {
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const c1 = useCounter(18, 1500, statsStarted)
  const c2 = useCounter(450, 1800, statsStarted)
  const c3 = useCounter(12400, 2000, statsStarted)
  const c4 = useCounter(98, 1500, statsStarted)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsStarted(true) }, { threshold: 0.3 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="hero-bg grid-overlay relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 animate-fade-up">
              <span className="section-eyebrow">Plateforme 100% Gratuite &bull; 18 Secteurs</span>
            </div>
            <h1 className="section-title text-white mb-5 animate-fade-up animate-fade-up-delay-1">
              La Securite, ca s&apos;apprend.{' '}<span className="gradient-text">Ensemble.</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed animate-fade-up animate-fade-up-delay-2">
              Formez-vous gratuitement aux regles de securite dans <strong className="text-white/80">tous les secteurs d&apos;activite</strong>. Videos, documents, quiz, alertes locales et marketplace.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/recherche?q=${encodeURIComponent(searchQuery)}` }} className="flex gap-3 mb-8 animate-fade-up animate-fade-up-delay-2">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un secteur, un risque..." className="input-field pl-9 py-3 text-sm" />
              </div>
              <button type="submit" className="btn-primary py-3">Rechercher</button>
            </form>
            <div className="flex flex-wrap gap-3 animate-fade-up animate-fade-up-delay-3">
              <Link href="/auth" className="btn-primary py-3 px-6"><Shield size={18} />Commencer gratuitement</Link>
              <Link href="/secteurs" className="btn-secondary py-3 px-6"><BookOpen size={18} />Explorer les secteurs</Link>
            </div>
            <div className="flex items-center gap-4 mt-6 animate-fade-up animate-fade-up-delay-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#FFD700" className="text-yellow-400" />)}
                <span className="text-sm text-white/50 ml-1">4.9/5</span>
              </div>
              <span className="text-white/20">|</span>
              <span className="text-sm text-white/50"><strong className="text-white">12 400+</strong> professionnels formes</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-12 border-y border-white/5 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[{c:c1,s:'+',l:'Secteurs couverts'},{c:c2,s:'+',l:'Contenus disponibles'},{c:c3,s:'+',l:'Utilisateurs actifs'},{c:c4,s:'%',l:'Satisfaction'}].map((s,i) => (
              <div key={i} className="text-center">
                <div className="stat-number">{s.c.toLocaleString()}{s.s}</div>
                <div className="text-sm text-white/50 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-eyebrow mb-3">Tous les domaines</div>
            <h2 className="section-title text-white mb-3">18 Secteurs d&apos;activite</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {SECTEURS.map((s) => (
              <Link key={s.slug} href={`/secteurs/${s.slug}`} className="sector-card card p-4 text-center group">
                <div className="sector-icon text-3xl mb-2">{s.icon}</div>
                <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors leading-tight mb-1">{s.nom}</div>
                <div className="text-[10px] px-2 py-0.5 rounded-full inline-block" style={{ background: `${s.couleur}20`, color: s.couleur, border: `1px solid ${s.couleur}40` }}>{s.nb_contenus} contenus</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/secteurs" className="btn-secondary">Voir tous les secteurs<ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-eyebrow mb-3">Ce que vous trouverez</div>
            <h2 className="section-title text-white mb-3">Tout pour apprendre la securite</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FONCTIONNALITES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="card p-5 group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ background: `${f.couleur}20`, border: `1px solid ${f.couleur}30` }}>
                    <Icon size={22} style={{ color: f.couleur }} />
                  </div>
                  <h3 className="font-display font-bold text-white text-base mb-2">{f.titre}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="section-eyebrow mb-3">En temps reel</div>
              <h2 className="section-title text-white">Alertes &amp; Actualites</h2>
            </div>
            <Link href="/alertes" className="btn-secondary flex-shrink-0">Voir toutes les alertes<ArrowRight size={16} /></Link>
          </div>
          <div className="space-y-3">
            {ALERTES_PREVIEW.map((alerte, i) => (
              <Link key={i} href="/alertes" className={`card alerte-${alerte.niveau} p-4 flex items-center gap-4 block`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: alerte.niveau === 'urgence' ? 'rgba(255,71,87,0.2)' : alerte.niveau === 'attention' ? 'rgba(255,215,0,0.2)' : 'rgba(33,150,243,0.2)' }}>
                  <AlertTriangle size={18} style={{ color: alerte.niveau === 'urgence' ? 'var(--danger)' : alerte.niveau === 'attention' ? 'var(--warn)' : '#2196F3' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[10px] ${alerte.niveau === 'urgence' ? 'badge-danger' : alerte.niveau === 'attention' ? 'badge-warn' : 'badge-info'}`}>{alerte.niveau.toUpperCase()}</span>
                    <span className="badge badge-orange text-[10px]">{alerte.secteur}</span>
                  </div>
                  <div className="text-sm font-medium text-white truncate">{alerte.titre}</div>
                  <div className="text-xs text-white/40">{alerte.region} &bull; {alerte.date}</div>
                </div>
                <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-800 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,107,53,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--orange)' }}>
            <Shield size={32} className="text-white" fill="white" />
          </div>
          <h2 className="section-title text-white mb-4">Commencez votre formation<br /><span className="gradient-text">des aujourd&apos;hui</span></h2>
          <p className="text-white/50 mb-8">Rejoignez plus de <strong className="text-white">12 400 professionnels</strong>. Gratuit, sans publicite.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth" className="btn-primary py-3 px-8"><Shield size={18} />Creer mon compte - Gratuit</Link>
            <Link href="/secteurs" className="btn-secondary py-3 px-8"><BookOpen size={18} />Parcourir les formations</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
