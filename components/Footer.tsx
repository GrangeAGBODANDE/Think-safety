'use client'
import Link from 'next/link'
import { Shield, Mail, MapPin, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-800 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                <Shield size={20} className="text-white" fill="white" />
              </div>
              <div className="font-display text-lg font-bold text-white">THINKS <span style={{ color: 'var(--orange)' }}>SAFETY</span></div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">Plateforme gratuite de formation securite au travail pour tous les secteurs.</p>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-widest">Secteurs populaires</h4>
            <ul className="space-y-2">
              {[
                { label: 'Construction & BTP', href: '/secteurs/construction-btp' },
                { label: 'Sante & Medical', href: '/secteurs/sante-medical' },
                { label: 'Industrie', href: '/secteurs/industrie-manufacturiere' },
                { label: 'Transport', href: '/secteurs/transport-logistique' },
              ].map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-white/50 hover:text-white flex items-center gap-1.5 transition-colors">
                    <ArrowRight size={12} />{s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/secteurs" className="text-sm font-medium hover:underline" style={{ color: 'var(--orange)' }}>Voir tous les secteurs &rarr;</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/50">
                <Mail size={14} style={{ color: 'var(--orange)' }} />contact@thinkssafety.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/50">
                <MapPin size={14} style={{ color: 'var(--orange)' }} />Cotonou, Benin
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-white/30">2026 Thinks Safety &mdash; Plateforme 100% gratuite.</p>
        </div>
      </div>
    </footer>
  )
}
