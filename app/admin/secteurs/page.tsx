'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { Layers, BookOpen, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AdminSecteursPage() {
  const [modulesCounts, setModulesCounts] = useState<Record<string,number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('modules').select('secteur_slug').then(({ data }) => {
      const counts: Record<string,number> = {}
      data?.forEach(m => { counts[m.secteur_slug] = (counts[m.secteur_slug]||0)+1 })
      setModulesCounts(counts)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{padding:'24px',maxWidth:'1200px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Secteurs d&apos;activité</h1>
        <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
          {SECTEURS.length} secteurs · {Object.values(modulesCounts).reduce((a,b)=>a+b,0)} modules au total
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px'}}>
        {SECTEURS.map(s => {
          const count = modulesCounts[s.slug] || 0
          return (
            <div key={s.slug} style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
              <div style={{height:'5px',background:`linear-gradient(to right,${s.couleur},${s.couleur}50)`}}/>
              <div style={{padding:'16px'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'10px'}}>
                  <div>
                    <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>{s.nom}</h3>
                    <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{s.description}</p>
                  </div>
                  <span style={{fontSize:'11px',padding:'3px 8px',borderRadius:'8px',background:s.couleur+'18',color:s.couleur,fontWeight:700,flexShrink:0,marginLeft:'10px'}}>{s.nb_contenus}</span>
                </div>

                <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'12px'}}>
                  {s.risques.slice(0,3).map(r => (
                    <span key={r} style={{fontSize:'10px',padding:'2px 7px',borderRadius:'6px',background:s.couleur+'12',color:s.couleur,border:'1px solid '+s.couleur+'20',fontWeight:600}}>{r}</span>
                  ))}
                </div>

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'var(--text-secondary)'}}>
                    <BookOpen size={12} style={{color:s.couleur}}/>
                    {loading ? '...' : count} module{count!==1?'s':''}
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    <Link href={`/admin/modules/nouveau?secteur=${s.slug}`}
                      style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'11px',fontWeight:600}}>
                      + Module
                    </Link>
                    <Link href={`/secteurs/${s.slug}`} target="_blank"
                      style={{padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',display:'flex',alignItems:'center'}}>
                      <ExternalLink size={11} style={{color:'var(--text-secondary)'}}/>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}