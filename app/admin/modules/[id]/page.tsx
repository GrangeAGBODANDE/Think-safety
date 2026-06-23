'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, Upload, Eye } from 'lucide-react'

const RichEditor = dynamic(() => import('@/components/RichEditor'), {
  ssr: false,
  loading: () => <div style={{padding:'20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'13px'}}>Chargement éditeur...</div>
})

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{marginBottom:'16px'}}>
    <label style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>
    {children}
  </div>
)

const iStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border:'1px solid var(--border)', background:'var(--bg-secondary)',
  color:'var(--text-primary)', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s'
}

const TYPE_OPTS = [
  { v:'text',     l:'Cours texte',    c:'#22c55e' },
  { v:'video',    l:'Vidéo YouTube',  c:'#ef4444' },
  { v:'document', l:'Document PDF',   c:'#3b82f6' },
  { v:'image',    l:'Images',         c:'#8b5cf6' },
]

interface Doc { id?: string; titre: string; url: string; pages: string; taille: string; uploading?: boolean }

export default function EditModulePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')
  const [notFound, setNotFound] = useState(false)

  const [secteurSlug, setSecteurSlug] = useState('')
  const [numero,      setNumero]      = useState('')
  const [titre,       setTitre]       = useState('')
  const [slug,        setSlug]        = useState('')
  const [description, setDescription] = useState('')
  const [contenu,     setContenu]     = useState('')
  const [libre,       setLibre]       = useState(true)
  const [statut,      setStatut]      = useState('published')
  const [types,       setTypes]       = useState<string[]>([])
  const [youtubeId,   setYoutubeId]   = useState('')
  const [duree,       setDuree]       = useState('')
  const [ordre,       setOrdre]       = useState(1)
  const [vues,        setVues]        = useState(0)
  const [docs,        setDocs]        = useState<Doc[]>([])

  const selectedSect = SECTEURS.find(s => s.slug === secteurSlug)

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase.from('modules').select('*').eq('id', id).single()
      if (!m) { setNotFound(true); setLoading(false); return }
      setSecteurSlug(m.secteur_slug || '')
      setNumero(m.numero || '')
      setTitre(m.titre || '')
      setSlug(m.slug || '')
      setDescription(m.description || '')
      setContenu(m.contenu_texte || '<p></p>')
      setLibre(m.libre)
      setStatut(m.statut || 'published')
      setTypes(m.types || [])
      setYoutubeId(m.youtube_id || '')
      setDuree(m.duree || '')
      setOrdre(m.ordre || 1)
      setVues(m.vues || 0)
      const { data: d } = await supabase.from('module_documents').select('*').eq('module_id', id)
      setDocs((d || []).map(x => ({ id:x.id, titre:x.titre||'', url:x.url||'', pages:x.pages?String(x.pages):'', taille:x.taille||'' })))
      setLoading(false)
    }
    load()
  }, [id])

  const toggleType = (t: string) => setTypes(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t])

  const uploadPdf = async (file: File, i: number) => {
    setDocs(d => d.map((x,j) => j===i ? {...x, uploading:true} : x))
    const path = `docs/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('modules-documents').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('modules-documents').getPublicUrl(data.path)
      const sizeMb = Math.round(file.size / 1024 / 10) / 100
      setDocs(d => d.map((x,j) => j===i ? { ...x, url: urlData.publicUrl, taille: `${sizeMb} MB`, uploading: false } : x))
    } else {
      setDocs(d => d.map((x,j) => j===i ? {...x, uploading:false} : x))
    }
  }

  const handleSave = async () => {
    if (!secteurSlug || !titre || !slug) { setError('Secteur, titre et slug obligatoires.'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('modules').update({
      secteur_slug: secteurSlug, numero, titre, slug, description,
      libre, statut, types, youtube_id: youtubeId, duree,
      contenu_texte: contenu, ordre,
    }).eq('id', id)
    if (err) { setError(err.message); setSaving(false); return }

    // Gérer les documents : supprimer les anciens, réinsérer
    await supabase.from('module_documents').delete().eq('module_id', id)
    const validDocs = docs.filter(d => d.titre && d.url)
    if (validDocs.length > 0) {
      await supabase.from('module_documents').insert(
        validDocs.map(d => ({
          module_id: id, titre: d.titre, url: d.url,
          pages: d.pages ? Number(d.pages) : null, taille: d.taille || null
        }))
      )
    }
    setSaving(false)
    setMsg('Modifications enregistrées !')
    setTimeout(() => setMsg(''), 2500)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement ce module et tous ses documents ?')) return
    await supabase.from('modules').delete().eq('id', id)
    router.push('/admin/modules')
  }

  if (loading) return <div style={{padding:'40px',color:'var(--text-secondary)'}}>Chargement du module...</div>
  if (notFound) return (
    <div style={{padding:'40px',textAlign:'center'}}>
      <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Module introuvable</p>
      <Link href="/admin/modules" style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700,fontSize:'13px'}}>Retour à la liste</Link>
    </div>
  )

  return (
    <div style={{padding:'24px', maxWidth:'1100px'}}>

      {msg && <div style={{position:'fixed',top:'80px',right:'24px',padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>{msg}</div>}

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px',flexWrap:'wrap'}}>
        <Link href="/admin/modules" style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'9px',border:'1px solid var(--border)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'12px'}}>
          <ArrowLeft size={13}/> Retour
        </Link>
        <div>
          <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Modifier le module</h1>
          <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>{vues.toLocaleString()} vues · {selectedSect?.nom}</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:'8px'}}>
          {slug && secteurSlug && (
            <Link href={`/secteurs/${secteurSlug}/${slug}`} target="_blank"
              style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'9px 14px',borderRadius:'11px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
              <Eye size={13}/> Aperçu
            </Link>
          )}
          <button onClick={handleDelete}
            style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'9px 14px',borderRadius:'11px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',color:'#ef4444',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
            <Trash2 size={13}/> Supprimer
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'9px 18px',borderRadius:'11px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1}}>
            <Save size={13}/>{saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && <div style={{padding:'12px 14px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'16px',color:'#ef4444',fontSize:'13px'}}>{error}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'20px',alignItems:'start'}}>

        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Infos */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 14px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Informations</p>
            <Field label="Secteur *">
              <div style={{position:'relative'}}>
                <select value={secteurSlug} onChange={e=>setSecteurSlug(e.target.value)} style={{...iStyle, paddingRight:'28px', appearance:'none', cursor:'pointer'}}>
                  {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
                </select>
                <ChevronDown size={12} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
              </div>
            </Field>
            <div style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'12px'}}>
              <Field label="N°">
                <input value={numero} onChange={e=>setNumero(e.target.value)} style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
              <Field label="Titre *">
                <input value={titre} onChange={e=>setTitre(e.target.value)} style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
            </div>
            <Field label="Slug URL *">
              <input value={slug} onChange={e=>setSlug(e.target.value)} style={iStyle}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
            </Field>
            <Field label="Description courte">
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}
                style={{...iStyle, resize:'vertical', lineHeight:1.6}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
            </Field>
            {types.includes('video') && (
              <Field label="Lien YouTube">
                <input value={youtubeId} onChange={e=>setYoutubeId(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
            )}
          </div>

          {/* Contenu */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 14px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Contenu du cours</p>
            <RichEditor value={contenu} onChange={setContenu} color={selectedSect?.couleur || 'var(--orange)'}/>
          </div>

          {/* Documents */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:0,textTransform:'uppercase',letterSpacing:'0.06em'}}>Documents PDF</p>
              <button onClick={()=>setDocs(d=>[...d,{titre:'',url:'',pages:'',taille:''}])}
                style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                <Plus size={11}/> Ajouter
              </button>
            </div>
            {docs.length === 0 ? (
              <p style={{fontSize:'12px',color:'var(--text-secondary)',textAlign:'center',padding:'16px',opacity:0.6}}>Aucun document</p>
            ) : docs.map((doc, i) => (
              <div key={i} style={{padding:'12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',marginBottom:'8px'}}>
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px'}}>
                  <input value={doc.titre} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,titre:e.target.value}:x))} placeholder="Titre du document"
                    style={{...iStyle, fontSize:'12px', padding:'7px 10px'}}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  <button onClick={()=>setDocs(d=>d.filter((_,j)=>j!==i))}
                    style={{padding:'7px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}>
                    <Trash2 size={12} style={{color:'#ef4444'}}/>
                  </button>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <label style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'8px',border:'1px solid',cursor:'pointer',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',flexShrink:0,
                    borderColor: doc.url ? '#22c55e40' : '#3b82f640',
                    background:  doc.url ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
                    color:       doc.url ? '#22c55e' : '#3b82f6'}}>
                    <Upload size={11}/>{doc.uploading ? 'Upload...' : doc.url ? '✓ PDF chargé' : 'Choisir PDF'}
                    <input type="file" accept=".pdf" style={{display:'none'}} disabled={doc.uploading}
                      onChange={async e=>{ const f=e.target.files?.[0]; if(f) await uploadPdf(f,i) }}/>
                  </label>
                  <input value={doc.pages} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,pages:e.target.value}:x))} placeholder="Pages" type="number"
                    style={{...iStyle, width:'90px', fontSize:'12px', padding:'7px 10px'}}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  <input value={doc.taille} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,taille:e.target.value}:x))} placeholder="Taille"
                    style={{...iStyle, width:'100px', fontSize:'12px', padding:'7px 10px'}}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px',position:'sticky',top:'80px'}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'18px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Publication</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Statut</span>
                <select value={statut} onChange={e=>setStatut(e.target.value)}
                  style={{padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="published">✓ Publié</option>
                  <option value="draft">✏ Brouillon</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Accès</span>
                <select value={libre?'libre':'membre'} onChange={e=>setLibre(e.target.value==='libre')}
                  style={{padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="libre">🔓 Gratuit</option>
                  <option value="membre">🔒 Membres</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Durée</span>
                <input value={duree} onChange={e=>setDuree(e.target.value)} placeholder="25 min"
                  style={{width:'80px',padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Ordre</span>
                <input value={ordre} onChange={e=>setOrdre(Number(e.target.value))} type="number" min={1}
                  style={{width:'60px',padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
            </div>
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'18px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 10px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Types de contenu</p>
            {TYPE_OPTS.map(t => {
              const active = types.includes(t.v)
              return (
                <button key={t.v} onClick={()=>toggleType(t.v)}
                  style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderRadius:'9px',border:'1px solid',width:'100%',marginBottom:'5px',cursor:'pointer',
                    background:   active ? t.c+'12' : 'var(--bg-secondary)',
                    borderColor:  active ? t.c+'40' : 'var(--border)',
                    color:        active ? t.c     : 'var(--text-secondary)'}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:active?t.c:'var(--border)',flexShrink:0}}/>
                  <span style={{fontSize:'12px',fontWeight:active?700:400,flex:1,textAlign:'left'}}>{t.l}</span>
                  {active && <span style={{fontSize:'10px'}}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}