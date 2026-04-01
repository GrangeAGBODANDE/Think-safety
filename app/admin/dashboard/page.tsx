'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Users, BookOpen, AlertTriangle, ShoppingBag, TrendingUp, Eye, Plus, ArrowRight, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, contenus: 0, alertes: 0, annonces: 0, pending: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentContenus, setRecentContenus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [u, c, a, m, p, ru, rc] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('contenus').select('id', { count: 'exact', head: true }),
        supabase.from('alertes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('marketplace_annonces').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_annonces').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id, prenom, nom, email, role, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('contenus').select('id, titre, type, status, created_at').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        users: u.count || 0,
        contenus: c.count || 0,
        alertes: a.count || 0,
        annonces: m.count || 0,
        pending: p.count || 0,
      })
      setRecentUsers(ru.data || [])
      setRecentContenus(rc.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: '#2196F3', href: '/admin/utilisateurs' },
    { label: 'Contenus', value: stats.contenus, icon: BookOpen, color: '#FF6B35', href: '/admin/contenus' },
    { label: 'Alertes actives', value: stats.alertes, icon: AlertTriangle, color: '#FF4757', href: '/admin/alertes' },
    { label: 'Annonces', value: stats.annonces, icon: ShoppingBag, color: '#FFD700', href: '/admin/marketplace', badge: stats.pending > 0 ? `${stats.pending} en attente` : undefined },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-white">Tableau de bord</h1>
        <p className="text-white/40 text-sm mt-1">Vue d&apos;ensemble de Think Safety</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <Link key={i} href={s.href} className="card p-5 group hover:no-underline">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                {s.badge && (
                  <span className="badge badge-warn text-[10px]">{s.badge}</span>
                )}
              </div>
              <div className="text-3xl font-bold font-display text-white mb-1">
                {loading ? '...' : s.value.toLocaleString()}
              </div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Actions rapides */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-bold text-white mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/contenus/nouveau" className="btn-primary py-2 px-4 text-sm">
            <Plus size={14} />Ajouter un contenu
          </Link>
          <Link href="/admin/alertes?new=1" className="btn-secondary py-2 px-4 text-sm">
            <AlertTriangle size={14} />Publier une alerte
          </Link>
          <Link href="/admin/marketplace" className="btn-secondary py-2 px-4 text-sm">
            <ShoppingBag size={14} />Moderer les annonces
          </Link>
          <Link href="/admin/utilisateurs" className="btn-secondary py-2 px-4 text-sm">
            <Users size={14} />Gerer les utilisateurs
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Derniers utilisateurs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Derniers inscrits</h2>
            <Link href="/admin/utilisateurs" className="text-orange-400 text-xs hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <p className="text-white/30 text-sm">Chargement...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-white/30 text-sm">Aucun utilisateur</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(255,107,53,0.2)', color: 'var(--orange)' }}>
                    {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.prenom} {u.nom || ''}</p>
                    <p className="text-white/40 text-xs truncate">{u.email}</p>
                  </div>
                  <span className={`badge text-[10px] ${u.role === 'superadmin' ? 'badge-danger' : u.role === 'admin' ? 'badge-orange' : u.role === 'moderateur' ? 'badge-info' : 'badge-safe'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers contenus */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Derniers contenus</h2>
            <Link href="/admin/contenus" className="text-orange-400 text-xs hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <p className="text-white/30 text-sm">Chargement...</p>
          ) : recentContenus.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-white/30 text-sm mb-3">Aucun contenu pour l&apos;instant</p>
              <Link href="/admin/contenus/nouveau" className="btn-primary py-2 px-4 text-sm">
                <Plus size={13} />Creer le premier contenu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContenus.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${c.type === 'video' ? 'bg-blue-500/20 text-blue-400' : c.type === 'document' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                    {c.type === 'video' ? '▶' : c.type === 'document' ? '📄' : '❓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.titre}</p>
                    <p className="text-white/40 text-xs">{c.type}</p>
                  </div>
                  <span className={`badge text-[10px] ${c.status === 'published' ? 'badge-safe' : c.status === 'draft' ? '' : 'badge-warn'}`} style={c.status === 'draft' ? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' } : {}}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
