'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import { SECTEURS } from '@/lib/secteurs-data'
import { ArrowLeft, Save, Video, FileText, HelpCircle, Youtube, Upload, Eye, CheckCircle } from 'lucide-react'

const NIVEAUX = ['Debutant', 'Intermediaire', 'Avance']
const STATUS_OPTIONS = ['draft', 'review', 'published']

export default function NouveauContenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [form, setForm] = useState({
    type: 'video',
    titre: '',
    description: '',
    secteur_slug: '',
    niveau: 'Debutant',
    status: 'draft',
    youtube_url: '',
    duree_minutes: '',
    fichier_url: '',
    nb_pages: '',
    question: '',
    reponse: '',
    tags: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [videoMode, setVideoMode] = useState<'youtube' | 'upload'>('youtube')

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (editId) {
      supabase.from('contenus').select('*').eq('id', editId).single().then(({ data }) => {
        if (data) {
          setForm({
            type: data.type || 'video',
            titre: data.titre || '',
            description: data.description || '',
            secteur_slug: data.secteur_slug || '',
            niveau: data.niveau || 'Debutant',
            status: data.status || 'draft',
            youtube_url: data.youtube_url || '',
            duree_minutes: data.duree_minutes?.toString() || '',
            fichier_url: data.fichier_url || '',
            nb_pages: data.nb_pages?.toString() || '',
            question: data.question || '',
            reponse: data.reponse || '',
            tags: data.tags?.join(', ') || '',
          })
          if (data.youtube_url) setVideoMode('youtube')
        }
      })
    }
  }, [editId])

  async function save(publish = false) {
    if (!form.titre.trim()) { setError('Le titre est obligatoire.'); return }
    if (form.type === 'video' && videoMode === 'youtube' && !form.youtube_url.trim()) { setError('Le lien YouTube est obligatoire pour une video.'); return }
    if (form.type === 'faq' && (!form.question.trim() || !form.reponse.trim())) { setError('La question et la reponse sont obligatoires.'); return }

    setSaving(true)
    setError('')

    const payload: any = {
      titre: form.titre,
      description: form.description,
      type: form.type,
      secteur_slug: form.secteur_slug || null,
      niveau: form.niveau,
      status: publish ? 'published' : form.status,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }

    if (form.type === 'video') {
      if (videoMode === 'youtube') payload.youtube_url = form.youtube_url
      if (form.duree_minutes) payload.duree_minutes = parseInt(form.duree_minutes)
    }
    if (form.type === 'document') {
      if (form.fichier_url) payload.fichier_url = form.fichier_url
      if (form.nb_pages) payload.nb_pages = parseInt(form.nb_pages)
    }
    if (form.type === 'faq') {
      payload.question = form.question
      payload.reponse = form.reponse
    }

    let error
    if (editId) {
      const res = await supabase.from('contenus').update(payload).eq('id', editId)
      error = res.error
    } else {
      const res = await supabase.from('contenus').insert(payload)
      error = res.error
    }

    if (error) {
      setError(error.message)
    } else {
      setMsg(publish ? 'Contenu publie !' : editId ? 'Contenu mis a jour !' : 'Contenu cree !')
      setTimeout(() => {
        router.push('/admin/contenus')
      }, 1500)
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/contenus" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeft size={14} />Retour aux contenus
        </Link>
        <h1 className="text-2xl font-bold font-display text-white">
          {editId ? 'Modifier le contenu' : 'Nouveau contenu'}
        </h1>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle size={14} />{msg}</div>}
      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Type de contenu */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-white mb-4">Type de contenu</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'video', label: 'Video', icon: Video, color: '#2196F3' },
                { value: 'document', label: 'Document', icon: FileText, color: '#9C27B0' },
                { value: 'faq', label: 'FAQ', icon: HelpCircle, color: '#00C896' },
              ].map(t => {
                const Icon = t.icon
                return (
                  <button key={t.value} onClick={() => u('type', t.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.type === t.value ? 'border-opacity-80' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                    style={form.type === t.value ? { borderColor: t.color, background: `${t.color}15` } : {}}>
                    <Icon size={24} style={{ color: form.type === t.value ? t.color : undefined }} />
                    <span className="text-sm font-medium" style={{ color: form.type === t.value ? t.color : undefined }}>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Infos generales */}
          <div className="card p-5 space-y-4">
            <h2 className="font-display font-bold text-white">Informations</h2>
            <div>
              <label className="input-label">Titre *</label>
              <input type="text" value={form.titre} onChange={e => u('titre', e.target.value)} placeholder="Titre du contenu" className="input-field" />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea value={form.description} onChange={e => u('description', e.target.value)} rows={3} placeholder="Description courte du contenu..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Secteur</label>
                <select value={form.secteur_slug} onChange={e => u('secteur_slug', e.target.value)} className="input-field">
                  <option value="">Tous secteurs</option>
                  {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Niveau</label>
                <select value={form.niveau} onChange={e => u('niveau', e.target.value)} className="input-field">
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Tags (separes par virgule)</label>
              <input type="text" value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="EPI, chantier, BTP..." className="input-field" />
            </div>
          </div>

          {/* Section VIDEO */}
          {form.type === 'video' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-bold text-white">Contenu video</h2>

              {/* Mode selection */}
              <div className="flex gap-2 bg-navy-700 rounded-xl p-1">
                <button onClick={() => setVideoMode('youtube')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${videoMode === 'youtube' ? 'bg-navy-800 text-white' : 'text-white/40 hover:text-white'}`}>
                  <Youtube size={15} />YouTube
                </button>
                <button onClick={() => setVideoMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${videoMode === 'upload' ? 'bg-navy-800 text-white' : 'text-white/40 hover:text-white'}`}>
                  <Upload size={15} />Upload direct
                </button>
              </div>

              {videoMode === 'youtube' ? (
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Lien YouTube *</label>
                    <input
                      type="text"
                      value={form.youtube_url}
                      onChange={e => u('youtube_url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="input-field"
                    />
                    <p className="text-white/30 text-xs mt-1">La video sera integree sans branding YouTube — les visiteurs ne voient que votre contenu.</p>
                  </div>

                  {form.youtube_url && (
                    <div>
                      <p className="text-white/50 text-sm mb-2 flex items-center gap-2">
                        <Eye size={13} />Apercu
                      </p>
                      <VideoPlayer url={form.youtube_url} title={form.titre} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors">
                  <Upload size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm mb-1">Upload de video direct</p>
                  <p className="text-white/30 text-xs">Format MP4, MOV — max 500MB</p>
                  <p className="text-white/20 text-xs mt-2">Fonctionnalite disponible avec Supabase Storage</p>
                </div>
              )}

              <div>
                <label className="input-label">Duree (minutes)</label>
                <input type="number" value={form.duree_minutes} onChange={e => u('duree_minutes', e.target.value)} placeholder="18" className="input-field" />
              </div>
            </div>
          )}

          {/* Section DOCUMENT */}
          {form.type === 'document' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-bold text-white">Contenu document</h2>
              <div>
                <label className="input-label">URL du fichier PDF</label>
                <input type="text" value={form.fichier_url} onChange={e => u('fichier_url', e.target.value)} placeholder="https://..." className="input-field" />
                <p className="text-white/30 text-xs mt-1">Uploadez votre PDF sur Supabase Storage et collez le lien ici.</p>
              </div>
              <div>
                <label className="input-label">Nombre de pages</label>
                <input type="number" value={form.nb_pages} onChange={e => u('nb_pages', e.target.value)} placeholder="12" className="input-field" />
              </div>
            </div>
          )}

          {/* Section FAQ */}
          {form.type === 'faq' && (
            <div className="card p-5 space-y-4">
              <h2 className="font-display font-bold text-white">Question / Reponse</h2>
              <div>
                <label className="input-label">Question *</label>
                <input type="text" value={form.question} onChange={e => u('question', e.target.value)} placeholder="Quelle est la question ?" className="input-field" />
              </div>
              <div>
                <label className="input-label">Reponse *</label>
                <textarea value={form.reponse} onChange={e => u('reponse', e.target.value)} rows={5} placeholder="Reponse detaillee..." className="input-field resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar droite */}
        <div className="space-y-4">
          {/* Publication */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-white mb-4">Publication</h2>
            <div className="mb-4">
              <label className="input-label">Statut</label>
              <select value={form.status} onChange={e => u('status', e.target.value)} className="input-field">
                <option value="draft">Brouillon</option>
                <option value="review">En revision</option>
                <option value="published">Publie</option>
              </select>
              <div className="border-t border-white/5 pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/70">Contenu payant</label>
                <button type="button" onClick={() => setForm(p => ({ ...p, is_paid: !(p as any).is_paid }))}
                  className={`w-11 h-6 rounded-full transition-all ${(form as any).is_paid ? 'bg-orange-500' : 'bg-navy-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${(form as any).is_paid ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {(form as any).is_paid && (
                <div>
                  <label className="input-label">Prix d&apos;acces (FCFA)</label>
                  <input type="number" value={(form as any).prix_acces || ''} onChange={e => setForm(p => ({ ...p, prix_acces: e.target.value } as any))} placeholder="2500" className="input-field" />
                </div>
              )}
              {!(form as any).is_paid && <p className="text-white/30 text-xs">Ce contenu est gratuit pour tous.</p>}
            </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => save(true)} disabled={saving}
                className="btn-primary w-full justify-center py-2.5 text-sm">
                <CheckCircle size={14} />{saving ? 'Enregistrement...' : 'Publier maintenant'}
              </button>
              <button onClick={() => save(false)} disabled={saving}
                className="btn-secondary w-full justify-center py-2.5 text-sm">
                <Save size={14} />{saving ? '...' : 'Enregistrer brouillon'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card p-4">
            <h3 className="font-display font-bold text-white text-sm mb-3">Guide</h3>
            <ul className="space-y-2 text-xs text-white/40">
              <li className="flex items-start gap-2"><span style={{ color: 'var(--orange)' }}>▶</span>Pour les videos YouTube : la video est integree de facon invisible sur votre site. Les visiteurs ne voient aucune recommandation YouTube.</li>
              <li className="flex items-start gap-2"><span style={{ color: 'var(--orange)' }}>📄</span>Pour les documents : uploadez sur Supabase Storage puis copiez le lien public.</li>
              <li className="flex items-start gap-2"><span style={{ color: 'var(--orange)' }}>❓</span>Les FAQ apparaissent dans l&apos;accordeon de chaque secteur.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
