'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Video, FileText, HelpCircle, Filter } from 'lucide-react'

export default function ContenusPage() {
  const [contenus, setContenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('tous')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('contenus')
      .select('*')
      .order('created_at', { ascending: false })
    setContenus(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(c: any) {
    const newStatus = c.status === 'published' ? 'draft' : 'published'
    await supabase.from('contenus').update({ status: newStatus }).eq('id', c.id)
    load()
  }

  async function deleteContenu(id: string) {
    if (!confirm('Supprimer ce contenu ?')) return
    await supabase.from('contenus').delete().eq('id', id)
    load()
    setMsg('Contenu supprime.')
    setTimeout(() => setMsg(''), 3000)
  }

  const filtered = contenus.filter(c => {
    const matchSearch = c.titre?.toLowerCase().includes(search.toLowerCase()) || c.secteur_slug?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'tous' || c.type === typeFilter
    const matchStatus = statusFilter === 'tous' || c.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const typeIcon = (type: string) => {
    if (type === 'video') return <Video size={13} className="text-blue-400" />
    if (type === 'document') return <FileText size={13} className="text-purple-400" />
    return <HelpCircle size={13} className="text-green-400" />
  }

  const typeColor = (type: string) => {
    if (type === 'video') return 'bg-blue-500/20 text-blue-400'
    if (type === 'document') return 'bg-purple-500/20 text-purple-400'
    return 'bg-green-500/20 text-green-400'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Contenus</h1>
          <p className="text-white/40 text-sm">{contenus.length} contenus au total</p>
        </div>
        <Link href="/admin/contenus/nouveau" className="btn-primary py-2 px-5 text-sm">
          <Plus size={15} />Ajouter un contenu
        </Link>
      </div>

      {msg && <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm">{msg}</div>}

      {/* Filtres */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="tous">Tous les types</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="faq">FAQ</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="tous">Tous les statuts</option>
          <option value="published">Publies</option>
          <option value="draft">Brouillons</option>
          <option value="review">En revision</option>
        </select>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Videos', count: contenus.filter(c => c.type === 'video').length, color: '#2196F3' },
          { label: 'Documents', count: contenus.filter(c => c.type === 'document').length, color: '#9C27B0' },
          { label: 'FAQ', count: contenus.filter(c => c.type === 'faq').length, color: '#00C896' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-xl font-bold font-display" style={{ color: s.color }}>{s.count}</div>
            <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Video size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 mb-4">Aucun contenu {search ? 'trouve' : 'cree'}</p>
            <Link href="/admin/contenus/nouveau" className="btn-primary py-2 px-5 text-sm">
              <Plus size={14} />Creer le premier contenu
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Type', 'Titre', 'Secteur', 'Niveau', 'Vues', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${typeColor(c.type)}`}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium max-w-xs truncate">{c.titre}</p>
                      {c.youtube_url && <p className="text-white/30 text-xs">YouTube</p>}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">{c.secteur_slug || '-'}</td>
                    <td className="px-4 py-3 text-white/50 text-sm">{c.niveau || '-'}</td>
                    <td className="px-4 py-3 text-white/50 text-sm">{c.vues || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${
                        c.status === 'published' ? 'badge-safe' :
                        c.status === 'review' ? 'badge-warn' : ''
                      }`} style={c.status === 'draft' ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' } : {}}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/contenus/nouveau?id=${c.id}`} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                          <Pencil size={13} />
                        </Link>
                        <button onClick={() => toggleStatus(c)} className={`p-1.5 rounded-lg transition-all ${c.status === 'published' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`} title={c.status === 'published' ? 'Depublier' : 'Publier'}>
                          {c.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => deleteContenu(c.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
