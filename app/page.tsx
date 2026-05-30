'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, FileText, AlertTriangle } from 'lucide-react'

// Secteurs avec images de fond
const SECTEURS = [
  { slug: 'construction-btp',        nom: 'Construction & BTP',         emoji: '🏗️', color: '#E67E22' },
  { slug: 'sante-medical',           nom: 'Santé & Médical',             emoji: '🏥', color: '#E74C3C' },
  { slug: 'industrie-manufacturiere',nom: 'Industrie Manufacturière',    emoji: '🏭', color: '#3498DB' },
  { slug: 'transport-logistique',    nom: 'Transport & Logistique',      emoji: '🚛', color: '#2ECC71' },
  { slug: 'agriculture',             nom: 'Agriculture',                 emoji: '🌾', color: '#27AE60' },
  { slug: 'mines-carrieres',         nom: 'Mines & Carrières',           emoji: '⛏️', color: '#8E44AD' },
  { slug: 'petrole-gaz',             nom: 'Pétrole & Gaz',               emoji: '⚡', color: '#F39C12' },
  { slug: 'bureaux-services',        nom: 'Bureaux & Services',          emoji: '🏢', color: '#1ABC9C' },
  { slug: 'education-formation',     nom: 'Éducation & Formation',       emoji: '📚', color: '#2980B9' },
]

export default function HomePage() {
  const [featured,    setFeatured]    = useState<any[]>([])
  const [videos,      setVideos]      = useState<any[]>([])
  const [alertes,     setAlertes]     = useState<any[]>([])
  const [heroContent, setHeroContent] = useState<any>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      // Contenus en vedette (3 premiers cours publiés)
      const { data: feat } = await supabase
        .from('courses')
        .select('id, slug, titre, description_courte, image_couverture, secteur_slug')
        .eq('statut', 'published')
        .limit(4)

      const list = feat || []
      setHeroContent(list[0] || null)
      setFeatured(list.slice(1, 4))

      // Vidéos récentes
      const { data: vids } = await supabase
        .from('course_lessons')
        .select('id, titre, youtube_url, duree_minutes, course_id, courses(slug, titre, secteur_slug)')
        .eq('type', 'video')
        .not('youtube_url', 'is', null)
        .limit(6)
      setVideos(vids || [])

      // Alertes récentes
      const { data: al } = await supabase
        .from('alertes')
        .select('*')
        .eq('statut', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
      setAlertes(al || [])

      setLoading(false)
    }
    load()
  }, [])

  function getYtThumb(url: string) {
    const m = (url || '').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Navbar />

      <div className="pt-16">

        {/* ===================================================
            BANNIÈRE HERO — Contenu en vedette
        =================================================== */}
        {heroContent && (
          <div className="relative overflow-hidden" style={{ minHeight: '380px' }}>
            {/* Image de fond */}
            {heroContent.image_couverture && (
              <div className="absolute inset-0">
                <img src={heroContent.image_couverture} alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.35)' }} />
              </div>
            )}
            {!heroContent.image_couverture && (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--navy-800), var(--navy-900))' }} />
            )}
            {/* Dégradé gauche */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />

            {/* Contenu */}
            <div className="relative max-w-6xl mx-auto px-4 py-16 flex flex-col justify-center" style={{ minHeight: '380px' }}>
              <div className="max-w-lg">
                <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded"
                  style={{ background: 'var(--orange)', color: 'white' }}>
                  À la une
                </span>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 font-display"
                  style={{ color: 'white' }}>
                  {heroContent.titre}
                </h1>
                <p className="text-base mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {heroContent.description_courte}
                </p>
                <Link href={`/cours/${heroContent.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: 'var(--orange)', color: 'white' }}>
                  Découvrir <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Alerte sécurité si active */}
        {alertes.length > 0 && (
          <div className="py-3 px-4" style={{ background: 'rgba(255,71,87,0.08)', borderBottom: '1px solid rgba(255,71,87,0.2)' }}>
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                {alertes[0].titre}
              </p>
              <Link href="/alertes" className="ml-auto text-xs underline flex-shrink-0" style={{ color: 'var(--danger)' }}>
                Voir l&apos;alerte
              </Link>
            </div>
          </div>
        )}

        {/* ===================================================
            NOTRE SÉLECTION — 3 articles en avant
        =================================================== */}
        {featured.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Notre sélection
              </h2>
              <Link href="/secteurs" className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: 'var(--orange)' }}>
                Voir plus <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featured.map(c => (
                <Link key={c.id} href={`/cours/${c.slug}`}
                  className="group hover:no-underline">
                  <div className="overflow-hidden rounded-xl mb-3" style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}>
                    {c.image_couverture
                      ? <img src={c.image_couverture} alt={c.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>}
                  </div>
                  <p className="text-xs font-mono uppercase mb-1" style={{ color: 'var(--orange)' }}>
                    {c.secteur_slug?.replace(/-/g, ' ')}
                  </p>
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-orange-500 transition-colors"
                    style={{ color: 'var(--text-primary)' }}>
                    {c.titre}
                  </h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {c.description_courte}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            GRILLE DES SECTEURS — style JW.org 3x3
        =================================================== */}
        <div className="max-w-6xl mx-auto px-4 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold font-display mb-5" style={{ color: 'var(--text-primary)' }}>
            Choisissez votre secteur
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTEURS.map(s => (
              <Link key={s.slug} href={`/secteurs/${s.slug}`}
                className="relative overflow-hidden rounded-xl group hover:no-underline"
                style={{ aspectRatio: '3/2', minHeight: '100px' }}>
                {/* Fond coloré */}
                <div className="absolute inset-0 transition-all duration-300 group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${s.color}cc, ${s.color}66)` }} />
                {/* Overlay sombre */}
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
                {/* Contenu */}
                <div className="absolute inset-0 flex flex-col items-start justify-end p-3">
                  <span className="text-2xl mb-1">{s.emoji}</span>
                  <span className="text-white text-xs font-semibold leading-tight">
                    {s.nom}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ===================================================
            VIDÉOS RÉCENTES
        =================================================== */}
        {videos.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Vidéos
              </h2>
              <Link href="/secteurs" className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: 'var(--orange)' }}>
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>

            {/* Vidéo principale en grand */}
            {videos[0] && (() => {
              const v = videos[0]
              const thumb = getYtThumb(v.youtube_url)
              const courseSlug = (v.courses as any)?.slug
              return (
                <Link href={`/cours/${courseSlug}?lecon=${v.id}`}
                  className="flex flex-col md:flex-row gap-5 mb-6 group hover:no-underline">
                  <div className="relative overflow-hidden rounded-xl md:w-2/3 flex-shrink-0"
                    style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}>
                    {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(212,80,15,0.9)' }}>
                        <Play size={24} className="text-white" fill="white" style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                    {v.duree_minutes > 0 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: 'rgba(0,0,0,0.75)' }}>
                        {v.duree_minutes}min
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-mono uppercase mb-1" style={{ color: 'var(--orange)' }}>
                      {(v.courses as any)?.secteur_slug?.replace(/-/g, ' ')}
                    </p>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      {v.titre}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(v.courses as any)?.titre}
                    </p>
                  </div>
                </Link>
              )
            })()}

            {/* Autres vidéos en grille */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.slice(1, 5).map(v => {
                const thumb = getYtThumb(v.youtube_url)
                const courseSlug = (v.courses as any)?.slug
                return (
                  <Link key={v.id} href={`/cours/${courseSlug}?lecon=${v.id}`}
                    className="group hover:no-underline">
                    <div className="relative overflow-hidden rounded-xl mb-2"
                      style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}>
                      {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(212,80,15,0.9)' }}>
                          <Play size={16} className="text-white" fill="white" style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                      {v.duree_minutes > 0 && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                          style={{ background: 'rgba(0,0,0,0.75)' }}>
                          {v.duree_minutes}min
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-medium line-clamp-2 group-hover:text-orange-500 transition-colors"
                      style={{ color: 'var(--text-primary)' }}>
                      {v.titre}
                    </h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {(v.courses as any)?.titre}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            CTA FINAL — 3 actions comme JW.org
        =================================================== */}
        <div className="border-t py-12 px-4" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🎓', titre: 'Accédez aux formations', desc: 'Des contenus gratuits pour tous les secteurs d\'activité.', href: '/secteurs', cta: 'Voir les formations' },
              { icon: '🚨', titre: 'Alertes sécurité', desc: 'Restez informé des dernières alertes et incidents.', href: '/alertes', cta: 'Voir les alertes' },
              { icon: '🛒', titre: 'Marketplace', desc: 'Équipements EPI et matériel de sécurité certifiés.', href: '/marketplace', cta: 'Explorer' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{item.titre}</h3>
                <p className="text-xs mb-4 max-w-48" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                <Link href={item.href}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--orange)' }}>
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
