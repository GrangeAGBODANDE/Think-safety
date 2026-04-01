'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { Plus, Pencil, Trash2, CheckCircle, X, AlertTriangle, Archive } from 'lucide-react'

const NIVEAUX = ['info', 'attention', 'danger', 'urgence']
const niveauColors: Record<string, string> = {
  info: 'badge-info', attention: 'badge-warn', danger: 'badge-danger', urgence: 'badge-danger'
}

const defaultForm = { titre: '', contenu: '', niveau: 'info', secteur_slug: '', region: '', pays: 'Benin', source: '', status: 'active' }

export default function AlertesAdminPage() {
  const [alertes, setAlertes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...defaultForm })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('alertes').select('*').order('created_at', { ascending: false })
    setAlertes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...defaultForm })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(a: any) {
    setForm({
      titre: a.titre, contenu: a.contenu, niveau: a.niveau,
      secteur_slug: a.secteur_slug || '', region: a.region || '',
      pays: a.pays || 'Benin', source: a.source || '', status: a.status,
    })
    setEditId(a.id)
    setShowForm(true)
  }

  async function save() {
    if (!form.titre || !form.contenu) { setMsg('Titre et contenu obligatoires.'); return }
    setSaving(true)
    const payload = { ...form, secteur_slug: form.secteur_slug || null, region: form.region || null }
    if (editId) {
      await supabase.from('alertes').update(payload).eq('id', editId)
    } else {
      await supabase.from('alertes').insert(payload)
    }
    setMsg(editId ? 'Alerte mise a jour !' : 'Alerte publiee !')
    setShowForm(false)
    load()
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function archive(id: string) {
    await supabase.from('alertes').update({ status: 'archived' }).eq('id', id)
    load()
  }

  async function deleteAlerte(id: string) {
    if (!confirm('Supprimer cette alerte ?')) return
    await supabase.from('alertes').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Alertes</h1>
          <p className="text-white/40 text-sm">{alertes.filter(a => a.status === 'active').length} alertes actives</p>
        </div>
        <button onClick={openNew} className="btn-primary py-2 px-5 text-sm">
          <Plus size={15} />Nouvelle alerte
        </button>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle size={14} />{msg}</div>}

      {/* Liste */}
      {loading ? (
        <div className="card p-8 text-center text-white/40">Chargement...</div>
      ) : alertes.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 mb-4">Aucune alerte publiee</p>
          <button onClick={openNew} className="btn-primary py-2 px-5 text-sm"><Plus size={14} />Creer la premiere alerte</button>
        </div>
      ) : (
        <div className="space-y-3">
          {alertes.map(a => (
            <div key={a.id} className="card p-4" style={{ borderLeft: `3px solid ${a.niveau === 'urgence' || a.niveau === 'danger' ? '#FF4757' : a.niveau === 'attention' ? '#FFD700' : '#2196F3'}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${niveauColors[a.niveau]} text-[10px]`}>{a.niveau.toUpperCase()}</span>
                    {a.secteur_slug && <span className="badge badge-orange text-[10px]">{a.secteur_slug}</span>}
                    {a.region && <span className="text-white/30 text-xs">{a.region}</span>}
                    <span className={`badge text-[10px] ${a.status === 'active' ? 'badge-safe' : ''}`} style={a.status === 'archived' ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' } : {}}>{a.status}</span>
                  </div>
                  <h3 className="text-white font-medium mb-1">{a.titre}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{a.contenu}</p>
                  {a.source && <p className="text-white/20 text-xs mt-1">Source : {a.source}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"><Pencil size={13} /></button>
                  {a.status === 'active' && (
                    <button onClick={() => archive(a.id)} className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all" title="Archiver"><Archive size={13} /></button>
                  )}
                  <button onClick={() => deleteAlerte(a.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 overflow-y-auto py-6">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg">{editId ? 'Modifier' : 'Nouvelle'} alerte</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">Titre *</label>
                <input type="text" value={form.titre} onChange={e => u('titre', e.target.value)} placeholder="Titre de l'alerte" className="input-field" />
              </div>
              <div>
                <label className="input-label">Contenu *</label>
                <textarea value={form.contenu} onChange={e => u('contenu', e.target.value)} rows={4} placeholder="Description detaillee de l'alerte..." className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Niveau *</label>
                  <select value={form.niveau} onChange={e => u('niveau', e.target.value)} className="input-field">
                    {NIVEAUX.map(n => <option key={n} value={n}>{n.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Secteur</label>
                  <select value={form.secteur_slug} onChange={e => u('secteur_slug', e.target.value)} className="input-field">
                    <option value="">Tous secteurs</option>
                    {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Region</label>
                  <input type="text" value={form.region} onChange={e => u('region', e.target.value)} placeholder="Cotonou, Benin" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Source</label>
                  <input type="text" value={form.source} onChange={e => u('source', e.target.value)} placeholder="MTFPSS, OIT..." className="input-field" />
                </div>
              </div>
              <div>
                <label className="input-label">Statut</label>
                <select value={form.status} onChange={e => u('status', e.target.value)} className="input-field">
                  <option value="active">Active</option>
                  <option value="archived">Archivee</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                <CheckCircle size={14} />{saving ? 'Enregistrement...' : editId ? 'Mettre a jour' : 'Publier'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-4">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
