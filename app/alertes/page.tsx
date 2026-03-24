'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AlertTriangle, Bookmark, Share2 } from 'lucide-react'

const ALERTES = [
  { id: 1, titre: 'Accident mortel chantier Cotonou', contenu: 'Un ouvrier a perdu la vie suite a une chute de hauteur sur un chantier du quartier Cadjehoun. Les autorites rappellent l obligation du harnais de securite.', niveau: 'urgence', secteur: 'Construction BTP', region: 'Cotonou, Benin', date: '18 Dec 2024', source: 'MTFPSS' },
  { id: 2, titre: 'Fuite produits chimiques zone industrielle', contenu: 'Une fuite de solvants detectee dans la zone industrielle de Seme-Podji. Les riverains sont invites a rester a l interieur et a fermer les fenetres.', niveau: 'danger', secteur: 'Chimie', region: 'Seme-Podji, Benin', date: '17 Dec 2024', source: 'ABE' },
  { id: 3, titre: 'Utilisation excessive pesticides detectee', contenu: 'Des controles ont revele des taux de pesticides depassant les normes dans plusieurs exploitations. Des formations urgentes sont programmees.', niveau: 'attention', secteur: 'Agriculture', region: 'Atlantique, Benin', date: '16 Dec 2024', source: 'MAEP' },
  { id: 4, titre: 'Casques de chantier contrefaits en circulation', contenu: 'Des EPI non conformes ont ete detectes sur plusieurs marches. Verifiez toujours le marquage CE et la norme EN 397 avant achat.', niveau: 'attention', secteur: 'Construction BTP', region: 'Cotonou, Benin', date: '15 Dec 2024', source: 'Think Safety' },
  { id: 5, titre: 'Mise a jour reglementation incendie 2025', contenu: 'Le decret portant sur les normes incendie dans les etablissements recevant du public a ete mis a jour. Application obligatoire au 1er janvier 2025.', niveau: 'info', secteur: 'Tous secteurs', region: 'National', date: '10 Dec 2024', source: 'Journal Officiel' },
  { id: 6, titre: 'Programme national formation securite annonce', contenu: 'Le Ministere du Travail lance un programme de formation gratuite pour 5000 travailleurs du secteur informel. Inscriptions ouvertes.', niveau: 'info', secteur: 'Tous secteurs', region: 'National', date: '08 Dec 2024', source: 'MTFPSS' },
]

const niveauCfg: Record<string, { color: string; bg: string; border: string }> = {
  urgence:   { color: '#FF4757', bg: 'rgba(255,71,87,0.1)',   border: 'rgba(255,71,87,0.3)' },
  danger:    { color: '#FF6B35', bg: 'rgba(255,107,53,0.1)',  border: 'rgba(255,107,53,0.3)' },
  attention: { color: '#FFD700', bg: 'rgba(255,215,0,0.1)',   border: 'rgba(255,215,0,0.3)' },
  info:      { color: '#2196F3', bg: 'rgba(33,150,243,0.1)',  border: 'rgba(33,150,243,0.3)' },
}

export default function AlertesPage() {
  const [filtre, setFiltre] = useState('tous')
  const filtered = filtre === 'tous' ? ALERTES : ALERTES.filter(a => a.niveau === filtre)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10">
            <div className="section-eyebrow mb-3">Securite en temps reel</div>
            <h1 className="section-title text-white mb-2">Alertes &amp; Actualites</h1>
            <p className="text-white/50 text-sm">Restez informe des incidents et nouvelles reglementations securite.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'tous', label: 'Toutes', count: ALERTES.length },
              { id: 'urgence', label: 'Urgence', count: ALERTES.filter(a => a.niveau === 'urgence').length },
              { id: 'danger', label: 'Danger', count: ALERTES.filter(a => a.niveau === 'danger').length },
              { id: 'attention', label: 'Attention', count: ALERTES.filter(a => a.niveau === 'attention').length },
              { id: 'info', label: 'Info', count: ALERTES.filter(a => a.niveau === 'info').length },
            ].map((f) => (
              <button key={f.id} onClick={() => setFiltre(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${filtre === f.id ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'}`}>
                {f.label}
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{f.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((alerte) => {
              const cfg = niveauCfg[alerte.niveau]
              return (
                <div key={alerte.id} className="card p-5" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                        <AlertTriangle size={18} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="badge text-[10px]" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{alerte.niveau.toUpperCase()}</span>
                          <span className="badge badge-orange text-[10px]">{alerte.secteur}</span>
                          <span className="text-white/30 text-xs">{alerte.region}</span>
                        </div>
                        <h3 className="text-white font-medium mb-2">{alerte.titre}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{alerte.contenu}</p>
                        <div className="flex items-center gap-3 mt-3 text-white/30 text-xs">
                          <span>{alerte.date}</span>
                          <span>&bull;</span>
                          <span>Source : {alerte.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><Bookmark size={15} /></button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><Share2 size={15} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
