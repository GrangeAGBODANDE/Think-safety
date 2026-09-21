'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, X } from 'lucide-react'

export default function CompleteProfileModal() {
  const [profile, setProfile] = useState<any>(null)
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    let active = true

    const check = async (userId: string, email?: string, metadata?: any) => {
      const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!active) return

      if (!existing) {
        const meta     = metadata || {}
        const fullName = meta.full_name || meta.name || ''
        const [first, ...rest] = fullName.split(' ')
        const { data: created } = await supabase.from('profiles').insert({
          id: userId,
          email,
          prenom: meta.given_name || first || '',
          nom: meta.family_name || rest.join(' ') || '',
          role: 'user',
        }).select().maybeSingle()
        if (!active || !created) return
        setProfile(created)
        setOpen(true)
      } else if (!existing.prenom || !existing.organisation || !existing.region) {
        setProfile(existing)
        setOpen(true)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (user) check(user.id, user.email, user.user_metadata)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) check(user.id, user.email, user.user_metadata)
    })

    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const save = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      prenom: profile.prenom,
      nom: profile.nom,
      organisation: profile.organisation,
      region: profile.region,
    }).eq('id', profile.id)
    setSaving(false)
    setOpen(false)
  }

  if (!open || !profile) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4">
      <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white text-lg">Modifier l&apos;utilisateur</h2>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Prenom</label>
              <input type="text" value={profile.prenom || ''} onChange={e => setProfile({ ...profile, prenom: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="input-label">Nom</label>
              <input type="text" value={profile.nom || ''} onChange={e => setProfile({ ...profile, nom: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Role</label>
            <select value={profile.role || 'user'} disabled className="input-field opacity-60 cursor-not-allowed">
              <option value="user">user</option>
            </select>
          </div>
          <div>
            <label className="input-label">Organisation</label>
            <input type="text" value={profile.organisation || ''} onChange={e => setProfile({ ...profile, organisation: e.target.value })} placeholder="Nom de l'entreprise" className="input-field" />
          </div>
          <div>
            <label className="input-label">Region</label>
            <input type="text" value={profile.region || ''} onChange={e => setProfile({ ...profile, region: e.target.value })} placeholder="Cotonou, Benin" className="input-field" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
            <CheckCircle size={14} />{saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={() => setOpen(false)} className="btn-secondary py-2.5 px-4">Annuler</button>
        </div>
      </div>
    </div>
  )
}
