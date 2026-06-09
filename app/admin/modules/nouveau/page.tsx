'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { ArrowLeft, Save, Plus, Trash2, Video, FileText, BookOpen, Image as ImgIcon } from 'lucide-react'

const TYPE_OPTIONS = [
  { value:'video',    label:'Vidéo YouTube', icon:Video,    color:'#ef4444' },
  { value:'document', label:'Document PDF',  icon:FileText, color:'#3b82f6' },
  { value:'text',     label:'Cours texte',   icon:BookOpen, color:'#22c55e' },
  { value:'image',    label:'Images',        icon:ImgIcon,  color:'#8b5cf6' },
]

function NouveauModuleContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const defaultSect  = searchParams.get('secteur') || ''

  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    secteur_slug: defaultSect,
    numero:       '',
    titre:        '',
    description:  '',
    slug:         '',
    libre:        true,
    statut:       'published',
    types:        ['text'] as string[],
    youtube_id:   '',
    duree:        '',
    contenu_texte:'',
    ordre:        0,
  })
  const [docs, setDocs] = useState<{titre:string,url:string,pages:string,taille:string}[]>([])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  function autoSlug(titre: string) {
    return titre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s-]/g,'')
      .replace(/\s+/g,'-')
      .replace(/-+/g,'-')
      .trim()
  }

  function toggleType(t: string) {
    set('types', form.types.includes(t) ? form.types.filter(x=>x!==t) : [...form.types, t])
  }

  function addDoc() { setDocs(d => [...d, { titre:'', url:'', pages:'', taille:'' }]) }
  function removeDoc(i: number) { setDocs(d => d.filter((_,j) => j!==i)) }
  function setDoc(i: number, k: string, v: string) {
    setDocs(d => d.map((doc, j) => j===i ? {...doc,[k]:v} : doc))
  }

  async function handleSave() {
    if (!form.secteur_slug || !form.titre || !form.slug) {
      setError('Secteur, titre et slug sont obligatoires.'); return
    }
    setSaving(true); setError('')
    const { data: mod, error: err } = await supabase.from('modules').insert({
      ...form,
      types: form.types,
      ordre: Number(form.ordre),
    }).select().single()
    if (err) { setError(err.message); setSaving(false); return }

    if (docs.length > 0 && mod) {
      await supabase.from('module_documents').insert(
        docs.filter(d=>d.titre).map(d => ({
          module_id: mod.id,
          titre: d.titre,
          url: d.url || null,
          pages: d.pages ? Number(d.pages) : null,
          taille: d.taille || null,
        }))
      )
    }
    setSaving(false)
    setMsg('Module créé avec succès !')
    setTimeout(() => router.push('/admin/modules'), 1500)
  }

  const S = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{marginBottom:'20px'}}>
      <label style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
      {children}
    </div>
  )
  const input = (val:string, onChange:(v:string)=>void, placeholder='', type='text') => (
    <input type={type} value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',boxSizing:'border-box'}}
      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
  )

  return (
    <div style={{padding:'24px',maxWidth:'900px'}}>

      {msg && <div style={{position:'fixed',top:'80px',right:'24px',padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,zIndex:50}}>{msg}</div>}

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'28px'}}>
        <Link href="/admin/modules" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'13px'}}>
          <ArrowLeft size={14}/> Retour
        </Link>
        <div>
          <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Nouveau module</h1>
        </div>
        <button onClick={handleSave} disabled={saving} style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'12px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1}}>
          <Save size={14}/>{saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {error && <div style={{padding:'12px 16px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'20px',color:'#ef4444',fontSize:'13px'}}>{error}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'24px',alignItems:'start'}}>

        {/* Colonne principale */}
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'24px'}}>
          <S label="Secteur *">
            <select value={form.secteur_slug} onChange={e=>set('secteur_slug',e.target.value)}
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none'}}>
              <option value="">— Choisir un secteur —</option>
              {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
            </select>
          </S>

          <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:'12px'}}>
            <S label="N°">
              {input(form.numero, v=>set('numero',v), '01')}
            </S>
            <S label="Titre *">
              {input(form.titre, v=>{ set('titre',v); if(!form.slug||form.slug===autoSlug(form.titre)) set('slug',autoSlug(v)) }, 'Introduction et fondamentaux...')}
            </S>
          </div>

          <S label="Slug (URL) *">
            {input(form.slug, v=>set('slug',v), 'module-introduction')}
          </S>

          <S label="Description courte">
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Description visible dans la liste des modules..."
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',resize:'vertical',minHeight:'80px',boxSizing:'border-box',fontFamily:'inherit'}}
              onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
              onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
          </S>

          <S label="Contenu du cours (texte principal)">
            <textarea value={form.contenu_texte} onChange={e=>set('contenu_texte',e.target.value)} placeholder="Saisir le contenu principal du module ici. Vous pouvez utiliser du texte simple ou du Markdown..."
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',resize:'vertical',minHeight:'200px',boxSizing:'border-box',fontFamily:'monospace',lineHeight:1.7}}
              onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
              onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
          </S>

          {/* Vidéo YouTube */}
          {form.types.includes('video') && (
            <S label="ID YouTube (ex: dQw4w9WgXcQ)">
              {input(form.youtube_id, v=>set('youtube_id',v), 'ID de la vidéo YouTube...')}
            </S>
          )}

          {/* Documents */}
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
              <label style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Documents PDF</label>
              <button onClick={addDoc} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                <Plus size={11}/> Ajouter
              </button>
            </div>
            {docs.map((doc, i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 120px 80px 60px auto',gap:'8px',marginBottom:'8px',alignItems:'center'}}>
                <input value={doc.titre} onChange={e=>setDoc(i,'titre',e.target.value)} placeholder="Titre du document"
                  style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
                <input value={doc.url} onChange={e=>setDoc(i,'url',e.target.value)} placeholder="URL PDF"
                  style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
                <input value={doc.pages} onChange={e=>setDoc(i,'pages',e.target.value)} placeholder="Pages" type="number"
                  style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
                <input value={doc.taille} onChange={e=>setDoc(i,'taille',e.target.value)} placeholder="2.1 MB"
                  style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
                <button onClick={()=>removeDoc(i)} style={{padding:'8px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                  <Trash2 size={12} style={{color:'#ef4444'}}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite — paramètres */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Statut & accès */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'20px'}}>
            <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Publication</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Statut</span>
                <select value={form.statut} onChange={e=>set('statut',e.target.value)}
                  style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="published">Publié</option>
                  <option value="draft">Brouillon</option>
                </select>
              </label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Accès</span>
                <select value={form.libre?'libre':'membre'} onChange={e=>set('libre',e.target.value==='libre')}
                  style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="libre">Gratuit (tous)</option>
                  <option value="membre">Membres uniquement</option>
                </select>
              </label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Durée</span>
                <input value={form.duree} onChange={e=>set('duree',e.target.value)} placeholder="20 min"
                  style={{width:'90px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
              </label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Ordre</span>
                <input value={form.ordre} onChange={e=>set('ordre',e.target.value)} type="number" min="0"
                  style={{width:'90px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
              </label>
            </div>
          </div>

          {/* Types de contenu */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'20px'}}>
            <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Types de contenu</p>
            {TYPE_OPTIONS.map(t => {
              const Icon = t.icon
              const active = form.types.includes(t.value)
              return (
                <button key={t.value} onClick={()=>toggleType(t.value)}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:'10px',border:'1px solid',width:'100%',marginBottom:'6px',cursor:'pointer',transition:'all 0.15s',
                    background: active ? t.color+'15' : 'var(--bg-secondary)',
                    borderColor: active ? t.color+'40' : 'var(--border)',
                    color: active ? t.color : 'var(--text-secondary)',
                  }}>
                  <Icon size={14}/>
                  <span style={{fontSize:'12px',fontWeight:active?700:500}}>{t.label}</span>
                  {active && <span style={{marginLeft:'auto',fontSize:'10px',fontWeight:700}}>✓</span>}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function NouveauModulePage() {
  return (
    <Suspense fallback={<div style={{padding:'40px',color:'var(--text-secondary)'}}>Chargement...</div>}>
      <NouveauModuleContent />
    </Suspense>
  )
}