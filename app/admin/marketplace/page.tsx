'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Eye, Trash2, Search, Filter } from 'lucide-react'

export default function MarketplaceAdminPage() {
  const [annonces, setAnnonces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('marketplace_annonces').select('*').order('created_at', { ascending: false })
    setAnnonces(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await supabase.from('marketplace_annonces').update({ status }).eq('id', id)
    setMsg(status === 'approved' ? 'Annonce approuvee !' : 'Annonce rejetee.')
    setSelected(null)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Marketplace</h1>
        <p className="text-white/40 text-sm">{annonces.length} annonces au total</p>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle size={14} />{msg}</div>}

      {/* Filtres */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'tous', label: `Toutes (${counts.tous})` },
            { id: 'pending', label: `En attente (${counts.pending})` },
            { id: 'approved', label: `Approuvees (${counts.approved})` },
            { id: 'rejected', label: `Rejetees (${counts.rejected})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${filter === f.id ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/40 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card p-8 text-center text-white/40">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-white/40">Aucune annonce trouvee</p>
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
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-white/30 text-xs">
                    <span>Vendeur : {a.vendeur_nom || 'Anonyme'}</span>
                    {a.prix > 0 && <span>{a.prix.toLocaleString()} FCFA</span>}
                    {a.localisation && <span>{a.localisation}</span>}
                    {a.vendeur_telephone && <span>Tel : {a.vendeur_telephone}</span>}
                    <span>{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(a.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-all whitespace-nowrap">
                        <CheckCircle size={12} />Approuver
                      </button>
                      <button onClick={() => updateStatus(a.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all whitespace-nowrap">
                        <XCircle size={12} />Rejeter
                      </button>
                    </>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => updateStatus(a.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/30 transition-all whitespace-nowrap">
                      <XCircle size={12} />Suspendre
                    </button>
                  )}
                  {a.status === 'rejected' && (
                    <button onClick={() => updateStatus(a.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-all whitespace-nowrap">
                      <CheckCircle size={12} />Approuver
                    </button>
                  )}
                  <button onClick={() => deleteAnnonce(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-all">
                    <Trash2 size={12} />Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
