'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Eye, CheckCircle, Clock, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: '#FFD700', icon: Clock },
  confirmee: { label: 'Confirmee', color: '#00C896', icon: CheckCircle },
  en_cours: { label: 'En cours', color: '#2196F3', icon: Truck },
  livree: { label: 'Livree', color: '#00C896', icon: CheckCircle },
  annulee: { label: 'Annulee', color: '#FF4757', icon: XCircle },
}

export default function CommandesAdminPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, annonce:marketplace_annonces(titre, categorie))')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatut(id: string, statut: string) {
    await supabase.from('orders').update({ statut }).eq('id', id)
    load()
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'tous' || o.statut === filter
    const matchSearch = !search || `${o.client_prenom} ${o.client_nom} ${o.client_email} ${o.order_number}`.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts: Record<string, number> = { tous: orders.length }
  Object.keys(statutConfig).forEach(s => { counts[s] = orders.filter(o => o.statut === s).length })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Commandes</h1>
        <p className="text-white/40 text-sm">{orders.length} commandes au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        {[{ id: 'tous', label: 'Toutes' }, ...Object.entries(statutConfig).map(([id, c]) => ({ id, label: c.label }))].map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)}
            className={`card p-3 text-center transition-all ${filter === s.id ? 'border-orange-500/40 bg-orange-500/5' : ''}`}>
            <div className="text-lg font-bold font-display text-white">{counts[s.id] || 0}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par numero, nom, email..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-white/40">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-white/40">Aucune commande trouvee</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = statutConfig[order.statut] || statutConfig.en_attente
            const Icon = cfg.icon
            const isOpen = expanded === order.id
            return (
              <div key={order.id} className="card overflow-hidden">
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-medium font-mono text-sm">{order.order_number}</span>
                        <span className="badge text-[10px]" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                          <Icon size={10} className="mr-1" />{cfg.label}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{order.client_prenom} {order.client_nom}</p>
                      <p className="text-white/40 text-xs">{order.client_email} · {order.client_telephone}</p>
                      <p className="text-white/30 text-xs mt-1">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-white font-bold" style={{ color: 'var(--orange)' }}>
                      {order.total > 0 ? `${order.total.toLocaleString()} FCFA` : 'Sur devis'}
                    </p>
                    <p className="text-white/40 text-xs">{(order.items || []).length} article(s)</p>
                    <select value={order.statut}
                      onChange={e => updateStatut(order.id, e.target.value)}
                      className="bg-navy-700 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none">
                      {Object.entries(statutConfig).map(([val, c]) => (
                        <option key={val} value={val}>{c.label}</option>
                      ))}
                    </select>
                    <button onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="flex items-center gap-1 text-white/40 hover:text-white text-xs transition-all">
                      <Eye size={13} />Details
                      {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {/* Articles */}
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-3">Articles commandes</p>
                        <div className="space-y-2">
                          {(order.items || []).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-navy-700 rounded-xl">
                              <div>
                                <p className="text-white text-sm">{item.annonce?.titre}</p>
                                <p className="text-white/40 text-xs">{item.annonce?.categorie} · Qte: {item.quantite}</p>
                              </div>
                              <p className="text-white font-medium text-sm">{(item.sous_total || 0).toLocaleString()} F</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Infos client */}
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-3">Informations client</p>
                        <div className="bg-navy-700 rounded-xl p-4 space-y-2">
                          {[
                            { label: 'Nom', value: `${order.client_prenom} ${order.client_nom}` },
                            { label: 'Email', value: order.client_email },
                            { label: 'Telephone', value: order.client_telephone || '-' },
                            { label: 'Ville', value: `${order.client_ville || '-'}, ${order.client_pays}` },
                            { label: 'Adresse', value: order.client_adresse || '-' },
                          ].map(f => (
                            <div key={f.label} className="flex items-start gap-3">
                              <span className="text-white/40 text-xs w-20 flex-shrink-0">{f.label}</span>
                              <span className="text-white text-sm">{f.value}</span>
                            </div>
                          ))}
                          {order.notes && (
                            <div className="flex items-start gap-3">
                              <span className="text-white/40 text-xs w-20 flex-shrink-0">Notes</span>
                              <span className="text-white/60 text-sm italic">{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
