import Link from 'next/link'
import { Shield, Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255,107,53,0.15)' }}>
          <Wrench size={40} style={{ color: 'var(--orange)' }} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span>
          </span>
        </div>
        <h1 className="text-white font-display font-bold text-2xl mb-3">
          Site en maintenance
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          Nous effectuons des améliorations pour vous offrir une meilleure expérience. 
          Nous serons de retour très bientôt.
        </p>
        <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          Travaux en cours...
        </div>
        <div className="mt-8">
          <Link href="/auth" className="text-white/30 text-xs hover:text-white transition-colors">
            Accès administrateur
          </Link>
        </div>
      </div>
    </div>
  )
}
