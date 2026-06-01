'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, Bell, ShoppingCart, Menu, X, ChevronDown, User, LogOut, Shield, BookOpen, AlertTriangle, Package, Star, Users, Settings, ArrowRight, Zap } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'

const SECTEURS = [
  {slug:'construction-btp',        nom:'Construction & BTP',   emoji:'🏗️'},
  {slug:'sante-medical',           nom:'Sante & Medical',       emoji:'🏥'},
  {slug:'industrie-manufacturiere',nom:'Industrie',             emoji:'🏭'},
  {slug:'transport-logistique',    nom:'Transport',             emoji:'🚛'},
  {slug:'agriculture',             nom:'Agriculture',           emoji:'🌾'},
  {slug:'mines-carrieres',         nom:'Mines & Carrieres',     emoji:'⛏️'},
  {slug:'petrole-gaz',             nom:'Petrole & Gaz',         emoji:'⚡'},
  {slug:'bureaux-services',        nom:'Bureaux & Services',    emoji:'🏢'},
  {slug:'education-formation',     nom:'Education',             emoji:'📚'},
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mobile, setMobile] = useState(false)
  const [mobileSection, setMobileSection] = useState<string|null>(null)
  const [dropdown, setDropdown] = useState<string|null>(null)
  const [userMenu, setUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user:u}})=>{
      setUser(u)
      if(u)supabase.from('profiles').select('*').eq('id',u.id).single().then(({data})=>setProfile(data))
    })
  },[])

  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node)){setDropdown(null);setUserMenu(false)}}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)
  },[])

  const signOut=async()=>{await supabase.auth.signOut();setUser(null);setProfile(null);router.push('/')}
  const isAdmin=profile?.role==='admin'||profile?.role==='superadmin'||profile?.role==='moderateur'
  const active=(h:string)=>pathname===h||(h!=='/'&&pathname.startsWith(h))

  const ddStyle = {
    background:'var(--bg-card)',
    borderColor:'var(--border)',
    boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
  }

  return (
    <header ref={ref} className="fixed top-0 left-0 right-0 z-50" style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(24px)'}}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:no-underline">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm" style={{background:'linear-gradient(135deg,var(--orange),#e06010)'}}>
            <Shield size={18} className="text-white"/>
          </div>
          <div className="leading-none">
            <div className="font-black text-sm tracking-tight" style={{color:'var(--text-primary)'}}>THINKS<span style={{color:'var(--orange)'}}> SAFETY</span></div>
            <div className="text-[9px] font-semibold tracking-widest uppercase" style={{color:'var(--text-secondary)'}}>Securite professionnelle</div>
          </div>
        </Link>

        {/* ─── NAVIGATION DESKTOP ─── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-2">

          {/* FORMATIONS — Megamenu */}
          <div className="relative">
            <button onClick={()=>setDropdown(dropdown==='formations'?null:'formations')}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all select-none"
              style={{color:dropdown==='formations'||active('/secteurs')?'var(--orange)':'var(--text-secondary)',background:dropdown==='formations'?'rgba(212,80,15,0.08)':'transparent'}}>
              Formations <ChevronDown size={13} style={{transform:dropdown==='formations'?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
            </button>

            {dropdown==='formations'&&(
              <div className="absolute top-full left-0 mt-2 w-[600px] rounded-3xl border py-4 z-50" style={ddStyle}>
                <div className="grid grid-cols-2 gap-0 divide-x" style={{divideColor:'var(--border)'}}>
                  {/* Colonne gauche — types */}
                  <div className="pr-4 pl-2">
                    <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Types de formations</p>
                    {[
                      {href:'/secteurs',    icon:BookOpen,   label:'Toutes les formations', desc:'500+ cours disponibles gratuitement',badge:null},
                      {href:'/secteurs',    icon:Star,       label:'Les plus populaires',    desc:'Formations les plus suivies',badge:'Top'},
                      {href:'/secteurs',    icon:Zap,        label:'Nouvelles formations',   desc:'Ajoutees cette semaine',badge:'New'},
                      {href:'/abonnements', icon:Users,      label:'Pour les entreprises',   desc:'Solutions pour les equipes',badge:null},
                    ].map(item=>{const Icon=item.icon;return(
                      <Link key={item.label} href={item.href} onClick={()=>setDropdown(null)}
                        className="flex items-center gap-3 mx-1 px-3 py-2.5 rounded-xl hover:no-underline transition-all group"
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(212,80,15,0.1)'}}>
                          <Icon size={15} style={{color:'var(--orange)'}}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{item.label}</span>
                            {item.badge&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{background:'var(--orange)'}}>{item.badge}</span>}
                          </div>
                          <div className="text-xs truncate" style={{color:'var(--text-secondary)'}}>{item.desc}</div>
                        </div>
                      </Link>
                    )})}
                    <div className="mx-2 mt-2 pt-2 border-t" style={{borderColor:'var(--border)'}}>
                      <Link href="/secteurs" onClick={()=>setDropdown(null)} className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold hover:no-underline" style={{color:'var(--orange)',background:'rgba(212,80,15,0.08)'}}>
                        Voir tout le catalogue <ArrowRight size={11}/>
                      </Link>
                    </div>
                  </div>

                  {/* Colonne droite — secteurs */}
                  <div className="pl-4 pr-2">
                    <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Par secteur professionnel</p>
                    <div className="grid grid-cols-3 gap-0.5">
                      {SECTEURS.map(s=>(
                        <Link key={s.slug} href={'/secteurs/'+s.slug} onClick={()=>setDropdown(null)}
                          className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:no-underline transition-all text-center"
                          onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <span className="text-xl">{s.emoji}</span>
                          <span className="text-[10px] font-semibold leading-tight" style={{color:'var(--text-secondary)'}}>{s.nom}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MARKETPLACE */}
          <div className="relative">
            <button onClick={()=>setDropdown(dropdown==='marketplace'?null:'marketplace')}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all select-none"
              style={{color:dropdown==='marketplace'||active('/marketplace')?'var(--orange)':'var(--text-secondary)',background:dropdown==='marketplace'?'rgba(212,80,15,0.08)':'transparent'}}>
              Marketplace <ChevronDown size={13} style={{transform:dropdown==='marketplace'?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
            </button>
            {dropdown==='marketplace'&&(
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border py-3 z-50" style={ddStyle}>
                <p className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Marketplace</p>
                {[
                  {href:'/marketplace', icon:Package,      label:'Equipements EPI',    desc:'Protection certifiee'},
                  {href:'/abonnements', icon:Star,          label:'Abonnements',         desc:'Devenir partenaire vendeur'},
                ].map(item=>{const Icon=item.icon;return(
                  <Link key={item.label} href={item.href} onClick={()=>setDropdown(null)}
                    className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl hover:no-underline transition-all"
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(212,80,15,0.1)'}}>
                      <Icon size={15} style={{color:'var(--orange)'}}/>
                    </div>
                    <div><div className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{item.label}</div><div className="text-xs" style={{color:'var(--text-secondary)'}}>{item.desc}</div></div>
                  </Link>
                )})}
              </div>
            )}
          </div>

          {/* Liens directs */}
          {[{href:'/alertes',label:'Alertes'},{href:'/abonnements',label:'Abonnements'},{href:'/a-propos',label:'A propos'}].map(item=>(
            <Link key={item.href} href={item.href} className="px-3.5 py-2 rounded-xl text-sm font-semibold hover:no-underline transition-all"
              style={{color:active(item.href)?'var(--orange)':'var(--text-secondary)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ─── ACTIONS ─── */}
        <div className="flex items-center gap-1 ml-auto">
          {searchOpen?(
            <form onSubmit={e=>{e.preventDefault();if(searchQ)router.push('/recherche?q='+encodeURIComponent(searchQ));setSearchOpen(false);setSearchQ('')}} className="flex items-center gap-1">
              <input autoFocus type="text" value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher une formation..." className="input-field py-1.5 px-3 text-sm w-52 rounded-xl"/>
              <button type="button" onClick={()=>setSearchOpen(false)} className="p-1.5" style={{color:'var(--text-secondary)'}}><X size={15}/></button>
            </form>
          ):(
            <button onClick={()=>setSearchOpen(true)} className="p-2 rounded-xl transition-all" style={{color:'var(--text-secondary)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Search size={17}/>
            </button>
          )}
          <Link href="/alertes" className="p-2 rounded-xl transition-all hover:no-underline" style={{color:'var(--text-secondary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Bell size={17}/></Link>
          <Link href="/panier" className="p-2 rounded-xl transition-all hover:no-underline" style={{color:'var(--text-secondary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><ShoppingCart size={17}/></Link>
          <div className="hidden sm:flex items-center gap-1"><LanguageSelector/><ThemeToggle/></div>

          {user?(
            <div className="relative">
              <button onClick={()=>setUserMenu(!userMenu)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-sm font-semibold transition-all" style={{background:'var(--bg-secondary)',color:'var(--text-primary)'}}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:'var(--orange)'}}>{profile?.prenom?.[0]?.toUpperCase()||user.email?.[0]?.toUpperCase()}</div>
                <span className="hidden sm:block">{profile?.prenom||'Compte'}</span>
                <ChevronDown size={12}/>
              </button>
              {userMenu&&(
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border py-2 z-50" style={ddStyle}>
                  <div className="px-4 py-2 border-b mb-1" style={{borderColor:'var(--border)'}}>
                    <p className="text-sm font-black" style={{color:'var(--text-primary)'}}>{profile?.prenom||'Utilisateur'}</p>
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
            <Link href="/auth" className="px-4 py-2 rounded-xl text-sm font-black text-white hover:no-underline hover:opacity-90 transition-opacity" style={{background:'var(--orange)'}}>Se connecter</Link>
          )}
          <button onClick={()=>setMobile(!mobile)} className="lg:hidden p-2 rounded-xl" style={{color:'var(--text-secondary)'}}>{mobile?<X size={20}/>:<Menu size={20}/>}</button>
        </div>
      </div>

      {/* ─── MENU MOBILE ─── */}
      {mobile&&(
        <div className="lg:hidden border-t" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            <button onClick={()=>setMobileSection(mobileSection==='formations'?null:'formations')} className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-left" style={{color:'var(--text-primary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              Formations <ChevronDown size={13} style={{transform:mobileSection==='formations'?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
            </button>
            {mobileSection==='formations'&&(
              <div className="ml-4 space-y-0.5">
                <Link href="/secteurs" onClick={()=>setMobile(false)} className="block px-3 py-2 rounded-lg text-sm hover:no-underline" style={{color:'var(--text-secondary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Toutes les formations</Link>
                <div className="grid grid-cols-3 gap-1 py-2">
                  {SECTEURS.map(s=><Link key={s.slug} href={'/secteurs/'+s.slug} onClick={()=>setMobile(false)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:no-underline text-center" onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span className="text-xl">{s.emoji}</span><span className="text-[9px] font-medium" style={{color:'var(--text-secondary)'}}>{s.nom}</span></Link>)}
                </div>
              </div>
            )}
            {[{href:'/marketplace',label:'Marketplace'},{href:'/alertes',label:'Alertes'},{href:'/abonnements',label:'Abonnements'},{href:'/a-propos',label:'A propos'}].map(item=>(
              <Link key={item.href} href={item.href} onClick={()=>setMobile(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold hover:no-underline" style={{color:active(item.href)?'var(--orange)':'var(--text-primary)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{item.label}</Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t" style={{borderColor:'var(--border)'}}><LanguageSelector/><ThemeToggle/></div>
          </div>
        </div>
      )}
    </header>
  )
}
