'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, AlertTriangle, ShoppingBag, BarChart2, Settings, Shield, Eye, Pencil, Trash2, CheckCircle, XCircle, Globe } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Vue d ensemble', icon: BarChart2 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'alertes', label: 'Alertes', icon: AlertTriangle },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'settings', label: 'Parametres', icon: Settings },
]

const STATS = [
  { label: 'Utilisateurs total', value: '12 847', color: '#2196F3' },
  { label: 'Actifs aujourd hui', value: '1 243', color: '#00C896' },
  { label: 'Contenus publies', value: '456', color: '#FF6B35' },
  { label: 'Alertes actives', value: '28', color: '#FF4757' },
]

const USERS = [
  { nom: 'Adjobi Koffi', email: 'adjobi@gmail.com', secteur: 'Construction', role: 'user', status: 'active' },
  { nom: 'Aminata Diallo', email: 'aminata@orange.sn', secteur: 'Sante', role: 'moderateur', status: 'active' },
  { nom: 'Jean-Baptiste Kone', email: 'jbkone@yahoo.fr', secteur: 'Mines', role: 'user', status: 'inactive' },
]

const ANNONCES = [
  { titre: 'Kit EPI complet BTP', vendeur: 'SafeEquip SARL', prix: 85000, status: 'approved' },
  { titre: 'Formation SSIAP niveau 1', vendeur: 'FireSafe Academy', prix: 120000, status: 'pending' },
  { titre: 'Detecteur gaz portable', vendeur: 'TechSafe Pro', prix: 195000, status: 'rejected' },
]

export default function AdminPage() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <aside className="w-56 bg-navy-800 border-r border-white/5 flex flex-col fixed h-full">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold font-display">Think Safety</p>
              <p className="text-xs" style={{ color: 'var(--orange)' }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Globe size={16} />Voir le site
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-56">
        <header className="bg-navy-800 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-white font-bold font-display">{TABS.find(t => t.id === tab)?.label}</h1>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--orange)' }}>A</div>
        </header>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATS.map((s, i) => (
                  <div key={i} className="card p-4">
                    <div className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/50 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <h3 className="text-white font-display font-bold mb-3">Actions rapides</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setTab('alertes')} className="btn-secondary py-2 px-4 text-sm"><AlertTriangle size={14} />Publier une alerte</button>
                  <button onClick={() => setTab('marketplace')} className="btn-secondary py-2 px-4 text-sm"><ShoppingBag size={14} />Moderer les annonces</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Utilisateur', 'Email', 'Secteur', 'Role', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {USERS.map((u, i) => (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-white text-sm font-medium">{u.nom}</td>
                      <td className="px-4 py-3 text-white/50 text-sm">{u.email}</td>
                      <td className="px-4 py-3 text-white/50 text-sm">{u.secteur}</td>
                      <td className="px-4 py-3"><span className={`badge text-[10px] ${u.role === 'moderateur' ? 'badge-info' : 'badge-safe'}`}>{u.role}</span></td>
                      <td className="px-4 py-3"><span className={`badge text-[10px] ${u.status === 'active' ? 'badge-safe' : 'badge-danger'}`}>{u.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={13} /></button>
                          <button className="text-red-400 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'alertes' && (
            <div className="card p-8 text-center">
              <AlertTriangle size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50">Gestionnaire d alertes securite</p>
              <p className="text-white/30 text-sm mt-1">Connecter a Supabase pour publier des alertes</p>
            </div>
          )}

          {tab === 'marketplace' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold font-display">Moderation des annonces</h2>
                <span className="badge badge-warn text-xs">1 en attente</span>
              </div>
              {ANNONCES.map((a, i) => (
                <div key={i} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium text-sm">{a.titre}</p>
                    <p className="text-white/40 text-xs mt-0.5">{a.vendeur} &bull; {a.prix.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-[10px] ${a.status === 'approved' ? 'badge-safe' : a.status === 'pending' ? 'badge-warn' : 'badge-danger'}`}>{a.status}</span>
                    {a.status === 'pending' && (
                      <>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30"><CheckCircle size={12} />Approuver</button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"><XCircle size={12} />Rejeter</button>
                      </>
                    )}
                    <button className="text-blue-400 p-1"><Eye size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-4 max-w-lg">
              {[{ label: 'Nom de la plateforme', value: 'Think Safety' }, { label: 'Email de contact', value: 'contact@think-safety.io' }, { label: 'Pays principal', value: 'Benin' }].map((f) => (
                <div key={f.label}>
                  <label className="input-label">{f.label}</label>
                  <input type="text" defaultValue={f.value} className="input-field" />
                </div>
              ))}
              <button className="btn-primary py-2.5 px-6">Sauvegarder</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

---

### FICHIER 24 — tape `.env.local.example`
```
NEXT_PUBLIC_SUPABASE_URL=https://uattwwcdchfxxpjfqdtm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHR3d2NkY2hmeHhwamZxZHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTA0MTgsImV4cCI6MjA4OTkyNjQxOH0.dXWzt1rsfGR6U850x49A6l5jqL0G9GLCkfUQ6IK1dTc
