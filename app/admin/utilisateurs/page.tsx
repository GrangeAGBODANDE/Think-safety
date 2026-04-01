'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Pencil, Trash2, CheckCircle, X, Shield, User } from 'lucide-react'

const ROLES = ['user', 'moderateur', 'admin', 'superadmin']

export default function UtilisateursPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveUser() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      prenom: editingUser.prenom,
      nom: editingUser.nom,
      role: editingUser.role,
      organisation: editingUser.organisation,
      region: editingUser.region,
    }).eq('id', editingUser.id)
    if (!error) {
      setMsg('Utilisateur mis a jour !')
      setEditingUser(null)
      load()
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  async function deleteUser(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    load()
  }

  const filtered = users.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Utilisateurs</h1>
          <p className="text-white/40 text-sm">{users.length} utilisateurs inscrits</p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {/* Search + filtres */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Utilisateur', 'Email', 'Role', 'Region', 'Inscription', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--orange)' }}>
                          {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.prenom} {u.nom || ''}</p>
                          <p className="text-white/40 text-xs">{u.organisation || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${
                        u.role === 'superadmin' ? 'badge-danger' :
                        u.role === 'admin' ? 'badge-orange' :
                        u.role === 'moderateur' ? 'badge-info' : 'badge-safe'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm">{u.region || '-'}</td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingUser({ ...u })} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">Aucun utilisateur trouve</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal edition */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg">Modifier l&apos;utilisateur</h2>
              <button onClick={() => setEditingUser(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Prenom</label>
                  <input type="text" value={editingUser.prenom || ''} onChange={e => setEditingUser({ ...editingUser, prenom: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Nom</label>
                  <input type="text" value={editingUser.nom || ''} onChange={e => setEditingUser({ ...editingUser, nom: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="input-label">Role</label>
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="input-field">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Organisation</label>
                <input type="text" value={editingUser.organisation || ''} onChange={e => setEditingUser({ ...editingUser, organisation: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Region</label>
                <input type="text" value={editingUser.region || ''} onChange={e => setEditingUser({ ...editingUser, region: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveUser} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                <CheckCircle size={14} />{saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => setEditingUser(null)} className="btn-secondary py-2.5 px-4">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
