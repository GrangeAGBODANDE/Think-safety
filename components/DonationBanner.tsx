'use client'
import { useState } from 'react'
import { Heart, X, ExternalLink } from 'lucide-react'

export default function DonationBanner() {
  const [visible, setVisible] = useState(true)
  const [modal, setModal] = useState(false)

  if (!visible) return null

  return (
    <>
      {/* Bannière discrète */}
      <div style={{
        position:'fixed', bottom:'20px', left:'20px', zIndex:40,
        maxWidth:'320px', borderRadius:'18px', overflow:'hidden',
        background:'var(--bg-card)', border:'1px solid var(--border)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
        animation:'slideInLeft 0.5s ease'
      }}>
        <style>{`@keyframes slideInLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}`}</style>
        <div style={{padding:'16px 16px 0 16px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'12px',background:'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Heart size={18} style={{color:'#ef4444'}} fill="#ef4444"/>
            </div>
            <div>
              <p style={{fontSize:'13px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Soutenir Think Safety</p>
              <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>La plateforme est 100% gratuite</p>
            </div>
          </div>
          <button onClick={()=>setVisible(false)} style={{background:'none',border:'none',cursor:'pointer',padding:'2px',color:'var(--text-secondary)',flexShrink:0}}>
            <X size={14}/>
          </button>
        </div>
        <div style={{padding:'12px 16px 16px 16px'}}>
          <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'0 0 12px 0',lineHeight:1.6}}>
            Think Safety est entièrement gratuit. Si la plateforme vous a été utile, un petit geste volontaire aide à la maintenir et à l&apos;améliorer.
          </p>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={()=>setModal(true)} style={{flex:1,padding:'8px 12px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700,color:'white',background:'linear-gradient(135deg,#ef4444,#dc2626)'}}>
              Faire un don 💝
            </button>
            <button onClick={()=>setVisible(false)} style={{padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',cursor:'pointer',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)'}}>
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {/* Modal don */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'rgba(0,0,0,0.5)'}} onClick={()=>setModal(false)}>
          <div style={{maxWidth:'420px',width:'100%',borderRadius:'24px',background:'var(--bg-card)',border:'1px solid var(--border)',overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'32px',background:'linear-gradient(135deg,rgba(239,68,68,0.08),transparent)',textAlign:'center'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px auto'}}>
                <Heart size={28} style={{color:'#ef4444'}} fill="#ef4444"/>
              </div>
              <h2 style={{fontSize:'1.4rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 8px 0'}}>Merci pour votre soutien !</h2>
              <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
                Think Safety est un projet bénévole. Votre don volontaire, même modeste, aide à couvrir les coûts d&apos;hébergement et à développer de nouveaux contenus.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
                {[
                  {label:"1 000 F CFA — Un café ☕",  val:"1000"},
                  {label:"5 000 F CFA — Un repas 🍽️", val:"5000"},
                  {label:"10 000 F CFA — Super héros 🦸",val:"10000"},
                  {label:"Montant libre 🎁",           val:"custom"},
                ].map((opt,i)=>(
                  <a key={i} href={opt.val==="custom"?"https://paypal.me/thinksafety":"https://paypal.me/thinksafety/"+opt.val} target="_blank" rel="noopener noreferrer"
                    style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'12px',borderRadius:'12px',fontSize:'14px',fontWeight:600,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)',transition:'all 0.2s'}}
                    onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.3)'})}
                    onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'var(--bg-secondary)',borderColor:'var(--border)'})}>
                    {opt.label}
                  </a>
                ))}
              </div>
              <p style={{fontSize:'11px',color:'var(--text-secondary)',marginBottom:'16px'}}>
                Paiement sécurisé via PayPal. Aucune obligation. ❤️
              </p>
              <button onClick={()=>setModal(false)} style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid var(--border)',cursor:'pointer',fontSize:'14px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)'}}>
                Non merci, continuer gratuitement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
