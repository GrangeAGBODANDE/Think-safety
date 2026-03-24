'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Play, FileText, HelpCircle, ChevronRight, ChevronDown, ArrowLeft, ThumbsUp, Download } from 'lucide-react'

const MOCK_VIDEOS = [
  { id: 1, titre: 'Introduction a la securite - Les fondamentaux', duree: '18 min', niveau: 'Debutant', vues: 2341 },
  { id: 2, titre: 'Les equipements de protection individuelle', duree: '24 min', niveau: 'Debutant', vues: 1892 },
  { id: 3, titre: 'Gestion des risques sur le terrain', duree: '31 min', niveau: 'Intermediaire', vues: 987 },
  { id: 4, titre: 'Procedures urgence et evacuation', duree: '20 min', niveau: 'Intermediaire', vues: 1543 },
  { id: 5, titre: 'Analyse des accidents - Methodes avancees', duree: '42 min', niveau: 'Avance', vues: 654 },
]

const MOCK_DOCS = [
  { id: 1, titre: 'Guide complet EPI', pages: 42, taille: '2.1 MB' },
  { id: 2, titre: 'Fiche reflexe urgences', pages: 4, taille: '0.3 MB' },
  { id: 3, titre: 'Check-list inspection securite', pages: 8, taille: '0.5 MB' },
  { id: 4, titre: 'Procedure evacuation incendie', pages: 12, taille: '0.8 MB' },
]

const MOCK_FAQ = [
  { id: 1, q: 'Quels EPI sont obligatoires dans ce secteur ?', r: 'Les EPI obligatoires varient selon les risques identifies. En general : casque, chaussures de securite, gilet haute visibilite, gants adaptes et protection oculaire selon les taches.' },
  { id: 2, q: 'A quelle frequence faire les formations securite ?', r: 'Formation initiale a l embauche, recyclage annuel ou bisannuel selon les risques, et formation specifique a chaque changement de poste.' },
  { id: 3, q: 'Comment rediger un document unique d evaluation des risques ?', r: 'Le DUER doit identifier tous les risques, les evaluer selon frequence et gravite, definir les mesures de prevention et etre mis a jour au moins une fois par an.' },
  { id: 4, q: 'Que faire en cas d accident du travail ?', r: 'Alerter les secours, prodiguer les premiers secours, securiser la zone, prevenir le superieur hierarchique, rediger le registre des accidents et declarer a la CNSS dans les 48h.' },
]

export default function SecteurPage() {
  const params = useParams()
  const slug = params.slug as string
  const secteur = SECTEURS.find((s) => s.slug === slug)
  const [tab, setTab] = useState<'videos' | 'documents' | 'faq'>('videos')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!secteur) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Secteur non trouve</p>
          <Link href="/secteurs" className="btn-primary">Voir tous les secteurs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="py-12 border-b border-white/5" style={{ background: `${secteur.couleur}10` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/secteurs" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={14} />Tous les secteurs
            </Link>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${secteur.couleur}20`, border: `2px solid ${secteur.couleur}40` }}>
                {secteur.icon}
              </div>
              <div>
                <h1 className="section-title text-white mb-2">{secteur.nom}</h1>
                <p className="text-white/50 text-sm max-w-lg">{secteur.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {secteur.risques.map((r) => <span key={r} className="badge badge-warn text-[10px]">{r}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-16 z-40 bg-navy-900 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              {([
                { id: 'videos', label: 'Videos', icon: Play, count: MOCK_VIDEOS.length },
                { id: 'documents', label: 'Documents', icon: FileText, count: MOCK_DOCS.length },
                { id: 'faq', label: 'FAQ', icon: HelpCircle, count: MOCK_FAQ.length },
              ] as const).map((t) => {
                const Icon = t.icon
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${tab === t.id ? 'text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                    style={tab === t.id ? { borderColor: secteur.couleur, color: secteur.couleur } : {}}>
                    <Icon size={15} />{t.label}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{t.count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_VIDEOS.map((v) => (
                <div key={v.id} className="card group cursor-pointer overflow-hidden">
                  <div className="relative bg-navy-700 h-36 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500 transition-all">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">{v.duree}</div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: `${secteur.couleur}20`, color: secteur.couleur }}>{v.niveau}</span>
                    <h3 className="text-white text-sm font-medium leading-snug mb-2">{v.titre}</h3>
                    <p className="text-white/40 text-xs">{v.vues.toLocaleString()} vues</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'documents' && (
            <div className="space-y-3">
              {MOCK_DOCS.map((d) => (
                <div key={d.id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{d.titre}</p>
                      <p className="text-white/40 text-xs">PDF &bull; {d.pages} pages &bull; {d.taille}</p>
                    </div>
                  </div>
                  <button className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0"><Download size={13} />Telecharger</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'faq' && (
            <div className="space-y-2 max-w-3xl">
              {MOCK_FAQ.map((f) => (
                <div key={f.id} className="card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)} className="w-full p-4 flex items-center justify-between gap-4 text-left">
                    <span className="text-white text-sm font-medium">{f.q}</span>
                    {openFaq === f.id ? <ChevronDown size={16} className="text-white/40 flex-shrink-0" /> : <ChevronRight size={16} className="text-white/40 flex-shrink-0" />}
                  </button>
                  {openFaq === f.id && (
                    <div className="px-4 pb-4 border-t border-white/5">
                      <p className="text-white/60 text-sm leading-relaxed mt-3">{f.r}</p>
                      <button className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs mt-3 transition-colors">
                        <ThumbsUp size={12} />Utile
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
