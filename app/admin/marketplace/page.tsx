'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { CheckCircle, XCircle, Trash2, Search, Plus, X, MapPin, Phone } from 'lucide-react'

const CATEGORIES = ['EPI', 'Formation', 'Service HSE', 'Detection', 'Incendie', 'Signalisation', 'Premiers secours', 'Autre']

const defaultForm = {
  titre: '', description: '', categorie: '', secteur_slug: '',
  prix: '', prix_type: 'fixe', localisation: '', vendeur_nom: '',
  vendeur_telephone: '', vendeur_email: '', vendeur_whatsapp: '',
  vendeur_organisation: '', vendeur_certifie: false, status: 'approved'
}

export default function MarketplaceAdminPage() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const u = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('marketplace_annonces').select('*').order('created_at', { ascending: false })
    setAnnonces(data || [])
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
      titre: a.titre || '', description: a.description || '',
      categorie: a.categorie || '', secteur_slug: a.secteur_slug || '',
      prix: a.prix?.toString() || '', prix_type: a.prix_type || 'fixe',
      localisation: a.localisation || '', vendeur_nom: a.vendeur_nom || '',
      vendeur_telephone: a.vendeur_telephone || '', vendeur_email: a.vendeur_email || '',
      vendeur_whatsapp: a.vendeur_whatsapp || '', vendeur_organisation: a.vendeur_organisation || '',
      vendeur_certifie: a.vendeur_certifie || false, status: a.status || 'approved',
    })
    setEditId(a.id)
    setShowForm(true)
  }

  async function saveAnnonce() {
    if (!form.titre || !form.description || !form.categorie) {
      setMsg('Titre, description et categorie sont obligatoires.')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      prix: form.prix ? parseInt(form.prix) : 0,
      secteur_slug: form.secteur_slug || null,
    }
    if (editId) {
      await supabase.from('marketplace_annonces').update(payload).eq('id', editId)
    } else {
      await supabase.from('marketplace_annonces').insert(payload)
    }
    setMsg(editId ? 'Annonce mise a jour !' : 'Annonce creee !')
    setShowForm(false)
    load()
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('marketplace_annonces').update({ status }).eq('id', id)
    setMsg(status === 'approved' ? 'Annonce approuvee !' : 'Annonce suspendue.')
    load()
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteAnnonce(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await supabase.from('marketplace_annonces').delete().eq('id', id)
    load()
  }

  const filtered = annonces.filter(a => {
    const matchFilter = filter === 'tous' || a.status === filter
    const matchSearch = !search || a.titre?.toLowerCase().includes(search.toLowerCase()) || a.vendeur_nom?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    tous: annonces.length,
    pending: annonces.filter(a => a.status === 'pending').length,
    approved: annonces.filter(a => a.status === 'approved').length,
    rejected: annonces.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Marketplace</h1>
          <p className="text-white/40 text-sm">{annonces.length} annonces au total</p>
        </div>
        <button onClick={openNew} className="btn-primary py-2 px-5 text-sm">
          <Plus size={15} />Nouvelle annonce
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {/* Filtres */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'tous', label: `Toutes (${counts.tous})` },
            { id: 'pending', label: `En attente (${counts.pending})` },
            { id: 'approved', label: `Actives (${counts.approved})` },
            { id: 'rejected', label: `Rejetees (${counts.rejected})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${filter === f.id ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/40 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-white/40">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-white/40 mb-4">Aucune annonce trouvee</p>
          <button onClick={openNew} className="btn-primary py-2 px-5 text-sm"><Plus size={14} />Creer une annonce</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge text-[10px] ${a.status === 'approved' ? 'badge-safe' : a.status === 'pending' ? 'badge-warn' : 'badge-danger'}`}>{a.status}</span>
                    <span className="badge badge-orange text-[10px]">{a.categorie}</span>
                    {a.vendeur_certifie && <span className="badge badge-info text-[10px]">Certifie</span>}
                  </div>
                  <h3 className="text-white font-medium mb-1">{a.titre}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">{a.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-white/30 text-xs">
                    {a.vendeur_nom && <span className="flex items-center gap-1"><span>Vendeur :</span>{a.vendeur_nom}</span>}
                    {a.prix > 0 && <span>{a.prix.toLocaleString()} FCFA ({a.prix_type})</span>}
                    {a.localisation && <span className="flex items-center gap-1"><MapPin size={10} />{a.localisation}</span>}
                    {a.vendeur_telephone && <span className="flex items-center gap-1"><Phone size={10} />{a.vendeur_telephone}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[110px]">
                  <button onClick={() => openEdit(a)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-all w-full justify-center">
                    ✏️ Modifier
                  </button>
                  {a.status === 'pending' && (
                    <button onClick={() => updateStatus(a.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-all w-full justify-center">
                      <CheckCircle size={11} />Approuver
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => updateStatus(a.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/30 transition-all w-full justify-center">
                      <XCircle size={11} />Suspendre
                    </button>
                  )}
                  {a.status === 'rejected' && (
                    <button onClick={() => updateStatus(a.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-all w-full justify-center">
                      <CheckCircle size={11} />Reactiver
                    </button>
                  )}
                  <button onClick={() => deleteAnnonce(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-all w-full justify-center">
                    <Trash2 size={11} />Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Plus size={18} style={{ color: 'var(--orange)' }} />
                {editId ? 'Modifier l&apos;annonce' : 'Nouvelle annonce marketplace'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Colonne gauche */}
              <div className="space-y-3">
                <h3 className="text-white/60 text-xs uppercase tracking-widest font-mono">Produit / Service</h3>
                <div>
                  <label className="input-label">Titre *</label>
                  <input type="text" value={form.titre} onChange={e => u('titre', e.target.value)} placeholder="Kit EPI complet BTP" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Description *</label>
                  <textarea value={form.description} onChange={e => u('description', e.target.value)} rows={3} placeholder="Description detaillee..." className="input-field resize-none" />
                </div>
                <div>
                  <label className="input-label">Categorie *</label>
                  <select value={form.categorie} onChange={e => u('categorie', e.target.value)} className="input-field">
                    <option value="">Choisir...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Secteur</label>
                  <select value={form.secteur_slug} onChange={e => u('secteur_slug', e.target.value)} className="input-field">
                    <option value="">Tous secteurs</option>
                    {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.nom}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Prix (FCFA)</label>
                    <input type="number" value={form.prix} onChange={e => u('prix', e.target.value)} placeholder="0 = Sur devis" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Type</label>
                    <select value={form.prix_type} onChange={e => u('prix_type', e.target.value)} className="input-field">
                      <option value="fixe">Fixe</option>
                      <option value="devis">Sur devis</option>
                      <option value="location">Location</option>
                      <option value="abonnement">Abonnement</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Statut</label>
                  <select value={form.status} onChange={e => u('status', e.target.value)} className="input-field">
                    <option value="approved">Approuve (visible)</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejete</option>
                  </select>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-3">
                <h3 className="text-white/60 text-xs uppercase tracking-widest font-mono">Vendeur / Contact</h3>
                <div>
                  <label className="input-label">Nom vendeur / Entreprise</label>
                  <input type="text" value={form.vendeur_nom} onChange={e => u('vendeur_nom', e.target.value)} placeholder="SafeEquip SARL" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Organisation</label>
                  <input type="text" value={form.vendeur_organisation} onChange={e => u('vendeur_organisation', e.target.value)} placeholder="Nom de l'entreprise" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Telephone</label>
                  <input type="tel" value={form.vendeur_telephone} onChange={e => u('vendeur_telephone', e.target.value)} placeholder="+229 97 XX XX XX" className="input-field" />
                </div>
                <div>
                  <label className="input-label">WhatsApp</label>
                  <input type="tel" value={form.vendeur_whatsapp} onChange={e => u('vendeur_whatsapp', e.target.value)} placeholder="+229 97 XX XX XX" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Email contact</label>
                  <input type="email" value={form.vendeur_email} onChange={e => u('vendeur_email', e.target.value)} placeholder="contact@entreprise.com" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Localisation</label>
                  <input type="text" value={form.localisation} onChange={e => u('localisation', e.target.value)} placeholder="Cotonou, Benin" className="input-field" />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button type="button" onClick={() => u('vendeur_certifie', !form.vendeur_certifie)}
                    className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${form.vendeur_certifie ? 'bg-orange-500' : 'bg-navy-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.vendeur_certifie ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-white/70">Vendeur certifie (badge bleu)</span>
                </div>
              </div>
            </div>

            {msg && <p className="text-red-400 text-sm mt-3">{msg}</p>}

            <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
              <button onClick={saveAnnonce} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                <CheckCircle size={14} />{saving ? 'Sauvegarde...' : editId ? 'Mettre a jour' : 'Publier l\'annonce'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-5">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
