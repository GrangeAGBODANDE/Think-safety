'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { Shield, BookOpen, AlertTriangle, ShoppingBag, Search, ArrowRight, Star } from 'lucide-react'

const SECTEURS_HOME = [
  { slug: 'construction-btp',       nom_fr: 'Construction BTP',    icon: '🏗️', couleur: '#FF6B35' },
  { slug: 'sante-medical',          nom_fr: 'Sante & Medical',     icon: '🏥', couleur: '#00C896' },
  { slug: 'industrie-manufacturiere',nom_fr: 'Industrie',           icon: '⚙️', couleur: '#6C63FF' },
  { slug: 'transport-logistique',   nom_fr: 'Transport',           icon: '🚛', couleur: '#FF9800' },
  { slug: 'agriculture',            nom_fr: 'Agriculture',          icon: '🌾', couleur: '#8BC34A' },
  { slug: 'bureaux-tertiaire',      nom_fr: 'Bureaux',             icon: '🏢', couleur: '#2196F3' },
  { slug: 'energie',                nom_fr: 'Energie',             icon: '⚡', couleur: '#FFD700' },
  { slug: 'chimie-pharmacie',       nom_fr: 'Chimie',              icon: '🧪', couleur: '#E91E63' },
  { slug: 'mines-carrieres',        nom_fr: 'Mines',               icon: '⛏️', couleur: '#795548' },
  { slug: 'restauration-hotellerie',nom_fr: 'Restauration',        icon: '👨‍🍳', couleur: '#FF5722' },
  { slug: 'maritime-peche',         nom_fr: 'Maritime',            icon: '⚓', couleur: '#03A9F4' },
  { slug: 'securite-defense',       nom_fr: 'Securite',            icon: '🛡️', couleur: '#37474F' },
]

export default function HomePage() {
  const { t, lang } = useLanguage()
  const [search, setSearch] = useState('')
  const [alertes, setAlertes] = useState<any[]>([])
  const [annonces, setAnnonces] = useState<any[]>([])
  const [stats, setStats] = useState({ users: 12400, contenus: 450, alertes: 98, secteurs: 18 })

  useEffect(() => {
    supabase.from('alertes').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => setAlertes(data || []))
    supabase.from('marketplace_annonces').select('id,titre,categorie,prix,prix_type,localisation,vendeur_certifie,images')
      .eq('status', 'approved').limit(6)
      .then(({ data }) => setAnnonces(data || []))
  }, [])

  const niveauColor: Record<string, string> = {
    info: '#2196F3', attention: '#FFD700', danger: '#FF4757', urgence: '#FF4757'
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ============================
          HERO
      ============================ */}
      <section className="hero-bg grid-overlay min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            <div className="section-eyebrow mb-4 animate-fade-up">
              {t('home.hero_badge')}
            </div>
            <h1 className="section-title mb-6 animate-fade-up animate-fade-up-delay-1" style={{ color: 'var(--text-primary)' }}>
              {t('home.hero_title1')}{' '}
              <span className="gradient-text">{t('home.hero_title2')}</span>
            </h1>
            <p className="text-lg mb-8 max-w-xl leading-relaxed animate-fade-up animate-fade-up-delay-2" style={{ color: 'var(--text-secondary)' }}>
              {t('home.hero_desc')}
            </p>

            {/* Barre de recherche */}
            <div className="flex gap-3 mb-8 animate-fade-up animate-fade-up-delay-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/recherche?q=${search}` }}
                  placeholder="Rechercher un secteur, un risque..."
                  className="input-field pl-11 pr-4 py-4 text-base"
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <Link
                href={search ? `/recherche?q=${search}` : '/recherche'}
                className="btn-primary py-4 px-8 text-base"
              >
                <Search size={18} />RECHERCHER
              </Link>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-up animate-fade-up-delay-4">
              <Link href="/auth" className="btn-primary py-3.5 px-8">
                <Shield size={18} />
                {t('home.hero_cta1').toUpperCase()}
              </Link>
              <Link href="/secteurs" className="btn-secondary py-3.5 px-8">
                <BookOpen size={18} />
                {t('home.hero_cta2').toUpperCase()}
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-8" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" style={{ marginRight: '-2px' }} />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>4.9/5</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>| 12 400+ professionnels formes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          STATS
      ============================ */}
      <section className="py-16 border-y" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '18+',    label: t('home.stat_sectors') },
              { value: '450+',   label: t('home.stat_trainings') },
              { value: '12 400+',label: t('home.stat_learners') },
              { value: '98%',    label: 'Satisfaction' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="stat-number">{s.value}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          SECTEURS
      ============================ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-eyebrow mb-3">{t('home.sectors_badge')}</div>
            <h2 className="section-title mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('home.sectors_title')}{' '}
              <span className="gradient-text">{t('home.sectors_title2')}</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {t('home.sectors_desc')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {SECTEURS_HOME.map(s => (
              <Link
                key={s.slug}
                href={`/secteurs/${s.slug}`}
                className="card sector-card p-5 text-center group hover:no-underline"
              >
                <div className="text-4xl mb-3 sector-icon">{s.icon}</div>
                <div className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {s.nom_fr}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  {t('sectors.start')} <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/secteurs" className="btn-secondary py-3 px-8">
              {t('home.sectors_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================
          ALERTES PREVIEW
      ============================ */}
      {alertes.length > 0 && (
        <section className="py-20 border-y" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-start justify-between mb-10">
              <div>
                <div className="section-eyebrow mb-3">{t('home.alerts_badge')}</div>
                <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
                  {t('home.alerts_title')}{' '}
                  <span className="gradient-text">{t('home.alerts_title2')}</span>
                </h2>
              </div>
              <Link href="/alertes" className="btn-secondary py-2.5 px-6 text-sm flex-shrink-0 mt-4">
                {t('home.alerts_cta')} →
              </Link>
            </div>
            <div className="space-y-4">
              {alertes.map(a => (
                <div key={a.id} className="card p-5" style={{ borderLeft: `4px solid ${niveauColor[a.niveau] || '#2196F3'}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="badge text-[10px]" style={{
                          background: `${niveauColor[a.niveau]}20`,
                          color: niveauColor[a.niveau],
                          border: `1px solid ${niveauColor[a.niveau]}40`
                        }}>{a.niveau?.toUpperCase()}</span>
                        {a.secteur_slug && <span className="badge badge-orange text-[10px]">{a.secteur_slug}</span>}
                      </div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.titre}</h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{a.contenu}</p>
                    </div>
                    <AlertTriangle size={20} className="flex-shrink-0 mt-1" style={{ color: niveauColor[a.niveau] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================
          MARKETPLACE PREVIEW
      ============================ */}
      {annonces.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-eyebrow mb-3">{t('home.marketplace_badge')}</div>
              <h2 className="section-title mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('home.marketplace_title')}{' '}
                <span className="gradient-text">{t('home.marketplace_title2')}</span>
              </h2>
              <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {t('home.marketplace_desc')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {annonces.slice(0, 6).map(a => (
                <div key={a.id} className="card overflow-hidden group">
                  <div className="h-28 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                    <span className="text-5xl">
                      {a.categorie === 'EPI' ? '🦺' : a.categorie === 'Formation' ? '🎓' : '🛡️'}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="badge badge-orange text-[10px] mb-2 inline-block">{a.categorie}</span>
                    <h3 className="text-sm font-semibold mb-1 group-hover:text-orange-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {a.titre}
                    </h3>
                    <p className="text-sm font-bold" style={{ color: 'var(--orange)' }}>
                      {a.prix > 0 ? `${a.prix.toLocaleString()} FCFA` : t('market.on_quote')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/marketplace" className="btn-primary py-3 px-8">
                <ShoppingBag size={18} />
                {t('home.marketplace_cta').toUpperCase()}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============================
          CTA FINAL
      ============================ */}
      <section className="py-24" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="section-eyebrow mb-4">Think Safety</div>
          <h2 className="section-title mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('home.cta_title')}
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {t('home.cta_desc')}
          </p>
          <Link href="/auth" className="btn-primary py-4 px-10 text-lg">
            <Shield size={20} />
            {t('home.cta_btn').toUpperCase()}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
