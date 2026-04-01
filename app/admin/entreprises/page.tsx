'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus, Pencil, Trash2, CheckCircle, X, Building2, Crown, ToggleLeft, ToggleRight, UserPlus, Eye, EyeOff } from 'lucide-react'

const PLANS_SLUGS = ['gratuit', 'basic', 'professionnel', 'entreprise']

export default function EntreprisesPage() {
  const [sellers, setSellers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const [newEntreprise, setNewEntreprise] = useState({
    prenom: '', nom: '', email: '', password: '',
    entreprise_nom: '', domaine_activite: '', telephone: '', localisation: '',
    plan_slug: 'gratuit',
  })

  async function load() {
    setLoading(true)
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('seller_profiles').select('*, user:profiles(id, email, prenom, nom, role), subscription:company_subscriptions(*, plan:subscription_plans(*))'),
      supabase.from('subscription_plans').select('*').order('ordre'),
    ])
    setSellers(s || [])
    setPlans(p || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createEntreprise() {
    if (!newEntreprise.email || !newEntreprise.password || !newEntreprise.entreprise_nom) {
      setMsg('Email, mot de passe et nom de l\'entreprise sont obligatoires.')
      return
    }
    setSaving(true)

    // Creer le compte
    const { data, error } = await supabase.auth.signUp({
      email: newEntreprise.email,
      password: newEntreprise.password,
      options: { data: { prenom: newEntreprise.prenom, nom: newEntreprise.nom } },
    })

    if (error) { setMsg('Erreur: ' + error.message); setSaving(false); return }

    if (data.user) {
      await new Promise(r => setTimeout(r, 1500))

      // Mettre a jour le profil
      await supabase.from('profiles').update({
        is_seller: true,
        secteur_activite: newEntreprise.domaine_activite,
      }).eq('id', data.user.id)

      // Creer le profil vendeur
      const { data: sp } = await supabase.from('seller_profiles').insert({
        user_id: data.user.id,
        entreprise_nom: newEntreprise.entreprise_nom,
        domaine_activite: newEntreprise.domaine_activite,
        telephone: newEntreprise.telephone,
        localisation: newEntreprise.localisation,
        email_contact: newEntreprise.email,
      }).select().single()

      // Assigner le plan
      if (sp) {
        const plan = plans.find(p => p.slug === newEntreprise.plan_slug)
        if (plan) {
          await supabase.from('company_subscriptions').insert({
            seller_profile_id: sp.id,
            plan_id: plan.id,
            statut: 'actif',
            mode_paiement: plan.prix_mensuel === 0 ? 'gratuit' : 'mensuel',
          })
        }
      }
    }

    setMsg('Entreprise creee avec succes !')
    setShowCreate(false)
    setNewEntreprise({ prenom: '', nom: '', email: '', password: '', entreprise_nom: '', domaine_activite: '', telephone: '', localisation: '', plan_slug: 'gratuit' })
    load()
    setTimeout(() => setMsg(''), 4000)
    setSaving(false)
  }

  async function toggleActive(sp: any) {
    await supabase.from('seller_profiles').update({ actif: !sp.actif }).eq('id', sp.id)
    load()
  }

  async function deleteSeller(sp: any) {
    if (!confirm('Supprimer cette entreprise et son compte ?')) return
    await supabase.from('seller_profiles').delete().eq('id', sp.id)
    if (sp.user?.id) await supabase.from('profiles').update({ is_seller: false }).eq('id', sp.user.id)
    load()
  }

  async function changePlan(sp: any, planSlug: string) {
    const plan = plans.find(p => p.slug === planSlug)
    if (!plan) return
    // Desactiver l'ancien abonnement
    await supabase.from('company_subscriptions').update({ statut: 'annule' }).eq('seller_profile_id', sp.id)
    // Creer le nouveau
    await supabase.from('company_subscriptions').insert({
      seller_profile_id: sp.id,
      plan_id: plan.id,
      statut: 'actif',
      mode_paiement: plan.prix_mensuel === 0 ? 'gratuit' : 'mensuel',
    })
    setMsg(`Plan change vers ${plan.nom} !`)
    load()
    setTimeout(() => setMsg(''), 3000)
  }

  const filtered = sellers.filter(s =>
    s.entreprise_nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const activeSub = (sp: any) => sp.subscription?.find((s: any) => s.statut === 'actif')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Entreprises</h1>
          <p className="text-white/40 text-sm">{sellers.length} entreprises enregistrees</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary py-2 px-5 text-sm">
          <Building2 size={15} />Creer une entreprise
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {PLANS_SLUGS.map(slug => {
          const count = sellers.filter(s => activeSub(s)?.plan?.slug === slug).length
          const colors: Record<string, string> = { gratuit: '#8B949E', basic: '#2196F3', professionnel: '#FF6B35', entreprise: '#9C27B0' }
          return (
            <div key={slug} className="card p-3 text-center">
              <div className="text-xl font-bold font-display" style={{ color: colors[slug] }}>{count}</div>
              <div className="text-white/40 text-xs mt-0.5 capitalize">{slug}</div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom d'entreprise ou email..." className="input-field pl-9" />
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
                  {['Entreprise', 'Contact', 'Domaine', 'Abonnement', 'Changer plan', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(sp => {
                  const sub = activeSub(sp)
                  return (
                    <tr key={sp.id} className={`hover:bg-white/2 transition-colors ${!sp.actif ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{sp.entreprise_nom}</p>
                            <p className="text-white/30 text-xs">{sp.localisation || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white/70 text-sm">{sp.user?.email}</p>
                        <p className="text-white/30 text-xs">{sp.telephone || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-sm">{sp.domaine_activite || '-'}</td>
                      <td className="px-4 py-3">
                        {sub ? (
                          <span className={`badge text-[10px] ${
                            sub.plan?.slug === 'entreprise' ? 'badge-danger' :
                            sub.plan?.slug === 'professionnel' ? 'badge-orange' :
                            sub.plan?.slug === 'basic' ? 'badge-info' : 'badge-safe'
                          }`}>
                            <Crown size={9} className="mr-1" />{sub.plan?.nom}
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">Aucun</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={sub?.plan?.slug || 'gratuit'}
                          onChange={e => changePlan(sp, e.target.value)}
                          className="bg-navy-700 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500/50"
                        >
                          {plans.map(p => <option key={p.slug} value={p.slug}>{p.nom}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[10px] ${sp.actif ? 'badge-safe' : 'badge-danger'}`}>
                          {sp.actif ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(sp)}
                            className={`p-1.5 rounded-lg transition-all ${sp.actif ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                            title={sp.actif ? 'Suspendre' : 'Activer'}>
                            {sp.actif ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button onClick={() => deleteSeller(sp)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">Aucune entreprise trouvee</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal creer entreprise */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Building2 size={18} style={{ color: 'var(--orange)' }} />Creer une entreprise
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            {msg && msg.includes('Erreur') && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{msg}</div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-3">Responsable / Compte</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Prenom</label>
                    <input type="text" value={newEntreprise.prenom} onChange={e => setNewEntreprise({...newEntreprise, prenom: e.target.value})} placeholder="Jean" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Nom</label>
                    <input type="text" value={newEntreprise.nom} onChange={e => setNewEntreprise({...newEntreprise, nom: e.target.value})} placeholder="Dupont" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <input type="email" value={newEntreprise.email} onChange={e => setNewEntreprise({...newEntreprise, email: e.target.value})} placeholder="email@entreprise.com" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Mot de passe *</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={newEntreprise.password} onChange={e => setNewEntreprise({...newEntreprise, password: e.target.value})} placeholder="Min 8 caracteres" className="input-field pr-10" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-3">Informations entreprise</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="input-label">Nom de l&apos;entreprise *</label>
                    <input type="text" value={newEntreprise.entreprise_nom} onChange={e => setNewEntreprise({...newEntreprise, entreprise_nom: e.target.value})} placeholder="SafeEquip SARL" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Domaine d&apos;activite</label>
                    <input type="text" value={newEntreprise.domaine_activite} onChange={e => setNewEntreprise({...newEntreprise, domaine_activite: e.target.value})} placeholder="Construction BTP" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Telephone</label>
                    <input type="tel" value={newEntreprise.telephone} onChange={e => setNewEntreprise({...newEntreprise, telephone: e.target.value})} placeholder="+229 97 XX XX XX" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Localisation</label>
                    <input type="text" value={newEntreprise.localisation} onChange={e => setNewEntreprise({...newEntreprise, localisation: e.target.value})} placeholder="Cotonou, Benin" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Plan d&apos;abonnement</label>
                    <select value={newEntreprise.plan_slug} onChange={e => setNewEntreprise({...newEntreprise, plan_slug: e.target.value})} className="input-field">
                      {plans.map(p => <option key={p.slug} value={p.slug}>{p.nom} {p.prix_mensuel > 0 ? `(${p.prix_mensuel.toLocaleString()} FCFA/mois)` : '(Gratuit)'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={createEntreprise} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                <CheckCircle size={14} />{saving ? 'Creation...' : 'Creer l\'entreprise'}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary py-2.5 px-4">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
