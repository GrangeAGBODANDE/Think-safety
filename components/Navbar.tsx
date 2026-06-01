'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, Bell, ShoppingCart, Menu, X, ChevronDown, User, LogOut, Shield, BookOpen, AlertTriangle, Package, Star, Users, Settings } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'

const SECTEURS = [
  {slug:'construction-btp',     nom:'Construction & BTP',   emoji:'🏗️'},
  {slug:'sante-medical',        nom:'Sante & Medical',       emoji:'🏥'},
  {slug:'industrie-manufacturiere',nom:'Industrie',          emoji:'🏭'},
  {slug:'transport-logistique', nom:'Transport',             emoji:'🚛'},
  {slug:'agriculture',          nom:'Agriculture',           emoji:'🌾'},
  {slug:'mines-carrieres',      nom:'Mines & Carrieres',     emoji:'⛏️'},
  {slug:'petrole-gaz',          nom:'Petrole & Gaz',         emoji:'⚡'},
  {slug:'bureaux-services',     nom:'Bureaux & Services',    emoji:'🏢'},
  {slug:'education-formation',  nom:'Education',             emoji:'📚'},
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mobile, setMobile] = useState(false)
  const [dropdown, setDropdown] = useState<string|null>(null)
  const [userMenu, setUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user:u}}) => {
      setUser(u)
      if (u) supabase.from('profiles').select('*').eq('id',u.id).single().then(({data})=>setProfile(data))
    })
  },[])

  useEffect(() => {
    const h = (e:MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setDropdown(null); setUserMenu(false) } }
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h)
  },[])

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); router.push('/') }
  const isAdmin = profile?.role==='admin'||profile?.role==='superadmin'||profile?.role==='moderateur'
  const active = (h:string) => pathname===h||(h!=='/'&&pathname.startsWith(h))

  const NavBtn = ({id,label}:{id:string,label:string}) => (
    <button onClick={()=>setDropdown(dropdown===id?null:id)}
      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all select-none"
      style={{color:dropdown===id||active('/'+id)?'var(--orange)':'var(--text-secondary)',background:dropdown===id?'rgba(212,80,15,0.08)':'transparent'}}>
      {label}<ChevronDown size={13} style={{transform:dropdown===id?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
    </button>
  )

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50" style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(20px)'}}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:no-underline">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm" style={{background:'linear-gradient(135deg,var(--orange),#e06010)'}}>
            <Shield size={18} className="text-white"/>
          </div>
          <div className="leading-none">
            <div className="font-black text-sm tracking-tight" style={{color:'var(--text-primary)'}}>THINKS<span style={{color:'var(--orange)'}}> SAFETY</span></div>
            <div className="text-[9px] font-medium tracking-wider uppercase" style={{color:'var(--text-secondary)'}}>Formation securite</div>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-2">

          {/* Formations */}
          <div className="relative">
            <NavBtn id="formations" label="Formations"/>
            {dropdown==='formations'&&(
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl shadow-2xl border py-2 z-50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Catalogue</p>
                {[
                  {href:'/secteurs',    icon:BookOpen,   label:'Toutes les formations', desc:'500+ formations disponibles'},
                  {href:'/secteurs',    icon:Star,       label:'Formations populaires',  desc:'Les plus suivies'},
                  {href:'/abonnements', icon:Users,      label:'Pour les entreprises',   desc:'Solutions equipes et groupes'},
                ].map(item=>{const Icon=item.icon;return(
                  <Link key={item.label} href={item.href} onClick={()=>setDropdown(null)}
                    className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl hover:no-underline transition-all"
                    style={{color:'var(--text-primary)'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(212,80,15,0.1)'}}>
                      <Icon size={15} style={{color:'var(--orange)'}}/>
                    </div>
                    <div><div className="text-sm font-semibold">{item.label}</div><div className="text-xs" style={{color:'var(--text-secondary)'}}>{item.desc}</div></div>
                  </Link>
                )})}
              </div>
            )}
          </div>

          {/* Secteurs megamenu */}
          <div className="relative">
            <NavBtn id="secteurs" label="Secteurs"/>
            {dropdown==='secteurs'&&(
              <div className="absolute top-full left-0 mt-1.5 w-80 rounded-2xl shadow-2xl border py-2 z-50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>9 secteurs professionnels</p>
                <div className="grid grid-cols-3 gap-0.5 px-2 pb-1">
                  {SECTEURS.map(s=>(
                    <Link key={s.slug} href={'/secteurs/'+s.slug} onClick={()=>setDropdown(null)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:no-underline transition-all text-center"
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight" style={{color:'var(--text-secondary)'}}>{s.nom}</span>
                    </Link>
                  ))}
                </div>
                <div className="mx-3 pt-2 border-t" style={{borderColor:'var(--border)'}}>
                  <Link href="/secteurs" onClick={()=>setDropdown(null)}
                    className="flex items-center justify-center py-2 rounded-xl text-xs font-bold hover:no-underline"
                    style={{color:'var(--orange)',background:'rgba(212,80,15,0.08)'}}>
                    Voir tous les secteurs →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Marketplace */}
          <div className="relative">
            <NavBtn id="marketplace" label="Marketplace"/>
            {dropdown==='marketplace'&&(
              <div className="absolute top-full left-0 mt-1.5 w-60 rounded-2xl shadow-2xl border py-2 z-50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Marketplace</p>
                {[
                  {href:'/marketplace', icon:Package,      label:'Equipements EPI',   desc:'Protection certifiee'},
                  {href:'/abonnements', icon:Star,          label:'Abonnements',        desc:'Devenir partenaire'},
                  {href:'/alertes',     icon:AlertTriangle, label:'Alertes securite',   desc:'Temps reel'},
                ].map(item=>{const Icon=item.icon;return(
                  <Link key={item.label} href={item.href} onClick={()=>setDropdown(null)}
                    className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl hover:no-underline transition-all"
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(212,80,15,0.1)'}}>
                      <Icon size={13} style={{color:'var(--orange)'}}/>
                    </div>
                    <div><div className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{item.label}</div><div className="text-xs" style={{color:'var(--text-secondary)'}}>{item.desc}</div></div>
                  </Link>
                )})}
              </div>
            )}
          </div>

          {[{href:'/alertes',label:'Alertes'},{href:'/abonnements',label:'Abonnements'}].map(item=>(
            <Link key={item.href} href={item.href} className="px-3 py-2 rounded-xl text-sm font-semibold hover:no-underline transition-all"
              style={{color:active(item.href)?'var(--orange)':'var(--text-secondary)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {searchOpen?(
            <form onSubmit={e=>{e.preventDefault();if(searchQ)router.push('/recherche?q='+encodeURIComponent(searchQ));setSearchOpen(false)}} className="flex items-center gap-1">
              <input autoFocus type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher..." className="input-field py-1.5 px-3 text-sm w-44 rounded-xl"/>
              <button type="button" onClick={()=>setSearchOpen(false)} className="p-1.5" style={{color:'var(--text-secondary)'}}><X size={15}/></button>
            </form>
          ):(
            <button onClick={()=>setSearchOpen(true)} className="p-2 rounded-xl transition-all" style={{color:'var(--text-secondary)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Search size={17}/>
            </button>
          )}
          {[{href:'/alertes',Icon:Bell},{href:'/panier',Icon:ShoppingCart}].map(({href,Icon})=>(
            <Link key={href} href={href} className="p-2 rounded-xl transition-all hover:no-underline" style={{color:'var(--text-secondary)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Icon size={17}/>
            </Link>
          ))}
          <div className="hidden sm:flex items-center gap-1"><LanguageSelector/><ThemeToggle/></div>

          {user?(
            <div className="relative">
              <button onClick={()=>setUserMenu(!userMenu)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-sm font-semibold transition-all" style={{background:'var(--bg-secondary)',color:'var(--text-primary)'}}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:'var(--orange)'}}>{profile?.prenom?.[0]?.toUpperCase()||user.email?.[0]?.toUpperCase()}</div>
                <span className="hidden sm:block">{profile?.prenom||'Compte'}</span>
                <ChevronDown size={12}/>
              </button>
              {userMenu&&(
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl shadow-2xl border py-2 z-50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="px-4 py-2 border-b mb-1" style={{borderColor:'var(--border)'}}>
                    <p className="text-sm font-bold" style={{color:'var(--text-primary)'}}>{profile?.prenom||'Utilisateur'}</p>
                    <p className="text-xs truncate" style={{color:'var(--text-secondary)'}}>{user.email}</p>
                  </div>
                  {isAdmin&&<Link href="/admin/dashboard" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:no-underline transition-all" style={{color:'var(--orange)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Settings size={13}/>Administration</Link>}
                  <Link href="/profil" onClick={()=>setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:no-underline transition-all" style={{color:'var(--text-primary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><User size={13}/>Mon profil</Link>
                  <div className="border-t my-1" style={{borderColor:'var(--border)'}}/>
                  <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left text-red-500 transition-all" onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><LogOut size={13}/>Deconnexion</button>
                </div>
              )}
            </div>
          ):(
            <Link href="/auth" className="px-4 py-1.5 rounded-xl text-sm font-black text-white hover:no-underline hover:opacity-90 transition-opacity" style={{background:'var(--orange)'}}>Se connecter</Link>
          )}
          <button onClick={()=>setMobile(!mobile)} className="lg:hidden p-2 rounded-xl" style={{color:'var(--text-secondary)'}}>{mobile?<X size={19}/>:<Menu size={19}/>}</button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile&&(
        <div className="lg:hidden border-t px-4 pb-4 pt-3" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="space-y-0.5">
            {[{href:'/secteurs',label:'Formations'},{href:'/marketplace',label:'Marketplace'},{href:'/alertes',label:'Alertes'},{href:'/abonnements',label:'Abonnements'}].map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMobile(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold hover:no-underline" style={{color:active(item.href)?'var(--orange)':'var(--text-primary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{item.label}</Link>
            ))}
            <div className="pt-2 border-t mt-2" style={{borderColor:'var(--border)'}}>
              <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Secteurs</p>
              <div className="grid grid-cols-3 gap-1">
                {SECTEURS.map(s=><Link key={s.slug} href={'/secteurs/'+s.slug} onClick={()=>setMobile(false)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:no-underline text-center" onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span className="text-xl">{s.emoji}</span><span className="text-[9px] font-medium" style={{color:'var(--text-secondary)'}}>{s.nom}</span></Link>)}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2"><LanguageSelector/><ThemeToggle/></div>
          </div>
        </div>
      )}
    </header>
  )
}
