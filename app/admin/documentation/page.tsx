'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BookOpen, Database, Code, Globe, Server, Shield,
  ChevronDown, ChevronRight, Copy, CheckCircle,
  Play, Terminal, FileText, Layers, Key, Zap,
  GitBranch, Package, Settings, AlertTriangle
} from 'lucide-react'

// ========================================
// TYPES
// ========================================
interface Section {
  id: string
  title: string
  icon: any
  color: string
}

interface ApiTest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  table: string
  description: string
  filter?: string
  body?: string
}

// ========================================
// SECTIONS DE DOCUMENTATION
// ========================================
const SECTIONS: Section[] = [
  { id: 'overview', title: 'Vue d\'ensemble', icon: Globe, color: '#FF6B35' },
  { id: 'stack', title: 'Stack technique', icon: Layers, color: '#2196F3' },
  { id: 'github', title: 'Structure GitHub', icon: GitBranch, color: '#9C27B0' },
  { id: 'database', title: 'Base de données', icon: Database, color: '#00C896' },
  { id: 'components', title: 'Composants & Classes', icon: Code, color: '#FFD700' },
  { id: 'apis', title: 'APIs & Services', icon: Zap, color: '#FF4757' },
  { id: 'deployment', title: 'Déploiement', icon: Server, color: '#607D8B' },
  { id: 'testing', title: 'Testeur API', icon: Terminal, color: '#FF6B35' },
]

// ========================================
// TABLES DB
// ========================================
const DB_TABLES = [
  {
    name: 'profiles',
    description: 'Profils utilisateurs — créé automatiquement à l\'inscription via trigger',
    columns: [
      { name: 'id', type: 'UUID', note: 'FK → auth.users(id)' },
      { name: 'email', type: 'TEXT', note: 'Email de connexion' },
      { name: 'prenom', type: 'TEXT', note: '' },
      { name: 'nom', type: 'TEXT', note: '' },
      { name: 'role', type: 'TEXT', note: 'user | moderateur | admin | superadmin' },
      { name: 'is_seller', type: 'BOOLEAN', note: 'true si compte entreprise' },
      { name: 'secteur_activite', type: 'TEXT', note: 'Slug du secteur principal' },
      { name: 'organisation', type: 'TEXT', note: '' },
      { name: 'region', type: 'TEXT', note: '' },
      { name: 'created_at', type: 'TIMESTAMPTZ', note: '' },
    ]
  },
  {
    name: 'secteurs',
    description: '18 secteurs d\'activité prédéfinis (BTP, Santé, Industrie...)',
    columns: [
      { name: 'slug', type: 'TEXT PK', note: 'ex: construction-btp' },
      { name: 'nom', type: 'TEXT', note: 'Nom affiché' },
      { name: 'description', type: 'TEXT', note: '' },
      { name: 'icon', type: 'TEXT', note: 'Emoji' },
      { name: 'couleur', type: 'TEXT', note: 'Code hex' },
      { name: 'nb_contenus', type: 'INTEGER', note: 'Compteur approximatif' },
    ]
  },
  {
    name: 'contenus',
    description: 'Tous les contenus pédagogiques (vidéos, documents, FAQ)',
    columns: [
      { name: 'id', type: 'UUID PK', note: '' },
      { name: 'type', type: 'TEXT', note: 'video | document | faq' },
      { name: 'titre', type: 'TEXT', note: '' },
      { name: 'description', type: 'TEXT', note: '' },
      { name: 'secteur_slug', type: 'TEXT', note: 'FK → secteurs(slug)' },
      { name: 'niveau', type: 'TEXT', note: 'Debutant | Intermediaire | Avance' },
      { name: 'status', type: 'TEXT', note: 'draft | review | published' },
      { name: 'youtube_url', type: 'TEXT', note: 'Lien YouTube (vidéos)' },
      { name: 'duree_minutes', type: 'INTEGER', note: '' },
      { name: 'fichier_url', type: 'TEXT', note: 'URL PDF (documents)' },
      { name: 'nb_pages', type: 'INTEGER', note: '' },
      { name: 'question', type: 'TEXT', note: 'Pour les FAQ' },
      { name: 'reponse', type: 'TEXT', note: 'Pour les FAQ' },
      { name: 'tags', type: 'TEXT[]', note: 'Tableau de tags' },
      { name: 'is_paid', type: 'BOOLEAN', note: 'Contenu payant ?' },
      { name: 'prix_acces', type: 'INTEGER', note: 'Prix en FCFA' },
      { name: 'vues', type: 'INTEGER', note: 'Compteur de vues' },
    ]
  },
  {
    name: 'alertes',
    description: 'Alertes sécurité publiées sur le site',
    columns: [
      { name: 'id', type: 'UUID PK', note: '' },
      { name: 'titre', type: 'TEXT', note: '' },
      { name: 'contenu', type: 'TEXT', note: '' },
      { name: 'niveau', type: 'TEXT', note: 'info | attention | danger | urgence' },
      { name: 'secteur_slug', type: 'TEXT', note: 'NULL = tous secteurs' },
      { name: 'region', type: 'TEXT', note: '' },
      { name: 'pays', type: 'TEXT', note: '' },
      { name: 'source', type: 'TEXT', note: 'ex: MTFPSS, OIT' },
      { name: 'status', type: 'TEXT', note: 'active | archived' },
    ]
  },
  {
    name: 'marketplace_annonces',
    description: 'Annonces de produits et services sur le marketplace',
    columns: [
      { name: 'id', type: 'UUID PK', note: '' },
      { name: 'titre', type: 'TEXT', note: '' },
      { name: 'description', type: 'TEXT', note: '' },
      { name: 'categorie', type: 'TEXT', note: 'EPI | Formation | Service HSE...' },
      { name: 'secteur_slug', type: 'TEXT', note: '' },
      { name: 'prix', type: 'INTEGER', note: 'En FCFA. 0 = sur devis' },
      { name: 'prix_type', type: 'TEXT', note: 'fixe | devis | location | abonnement' },
      { name: 'localisation', type: 'TEXT', note: '' },
      { name: 'vendeur_nom', type: 'TEXT', note: 'Masqué sur le site public' },
      { name: 'vendeur_telephone', type: 'TEXT', note: '' },
      { name: 'vendeur_email', type: 'TEXT', note: '' },
      { name: 'vendeur_whatsapp', type: 'TEXT', note: '' },
      { name: 'vendeur_certifie', type: 'BOOLEAN', note: 'Badge bleu certifié' },
      { name: 'images', type: 'TEXT[]', note: 'URLs des images' },
      { name: 'status', type: 'TEXT', note: 'pending | approved | rejected' },
    ]
  },
  {
    name: 'seller_profiles',
    description: 'Profils entreprises vendeurs',
    columns: [
      { name: 'id', type: 'UUID PK', note: '' },
      { name: 'user_id', type: 'UUID', note: 'FK → profiles(id) UNIQUE' },
      { name: 'entreprise_nom', type: 'TEXT', note: '' },
      { name: 'domaine_activite', type: 'TEXT', note: 'Slug secteur' },
      { name: 'telephone', type: 'TEXT', note: '' },
      { name: 'email_contact', type: 'TEXT', note: '' },
      { name: 'localisation', type: 'TEXT', note: '' },
      { name: 'certifie', type: 'BOOLEAN', note: '' },
      { name: 'actif', type: 'BOOLEAN', note: 'Compte suspendu ?' },
    ]
  },
  {
    name: 'subscription_plans',
    description: 'Plans d\'abonnement pour les entreprises (Gratuit, Basic, Pro, Entreprise)',
    columns: [
      { name: 'slug', type: 'TEXT UNIQUE', note: 'gratuit | basic | professionnel | entreprise' },
      { name: 'nom', type: 'TEXT', note: '' },
      { name: 'prix_mensuel', type: 'INTEGER', note: 'En FCFA' },
      { name: 'prix_annuel', type: 'INTEGER', note: 'En FCFA' },
      { name: 'limite_annonces', type: 'INTEGER', note: '999 = illimité' },
      { name: 'acces_commandes', type: 'BOOLEAN', note: '' },
      { name: 'acces_details_commandes', type: 'BOOLEAN', note: 'Voir téléphone/email client' },
      { name: 'fonctionnalites', type: 'TEXT[]', note: 'Liste des features affichées' },
    ]
  },
  {
    name: 'company_subscriptions',
    description: 'Abonnements actifs des entreprises',
    columns: [
      { name: 'seller_profile_id', type: 'UUID', note: 'FK → seller_profiles(id)' },
      { name: 'plan_id', type: 'UUID', note: 'FK → subscription_plans(id)' },
      { name: 'statut', type: 'TEXT', note: 'actif | expire | suspendu | annule' },
      { name: 'date_debut', type: 'TIMESTAMPTZ', note: '' },
      { name: 'date_fin', type: 'TIMESTAMPTZ', note: 'NULL = pas de fin' },
      { name: 'mode_paiement', type: 'TEXT', note: 'gratuit | mensuel | annuel' },
    ]
  },
  {
    name: 'orders',
    description: 'Commandes passées depuis le panier marketplace',
    columns: [
      { name: 'order_number', type: 'TEXT UNIQUE', note: 'Format: CMD-XXXXXXXX' },
      { name: 'client_user_id', type: 'UUID', note: 'NULL si non connecté' },
      { name: 'client_prenom', type: 'TEXT', note: '' },
      { name: 'client_nom', type: 'TEXT', note: '' },
      { name: 'client_email', type: 'TEXT', note: '' },
      { name: 'client_telephone', type: 'TEXT', note: '' },
      { name: 'client_adresse', type: 'TEXT', note: '' },
      { name: 'statut', type: 'TEXT', note: 'en_attente | confirmee | en_cours | livree | annulee' },
      { name: 'total', type: 'INTEGER', note: 'En FCFA' },
    ]
  },
  {
    name: 'order_items',
    description: 'Articles dans chaque commande',
    columns: [
      { name: 'order_id', type: 'UUID', note: 'FK → orders(id)' },
      { name: 'annonce_id', type: 'UUID', note: 'FK → marketplace_annonces(id)' },
      { name: 'seller_profile_id', type: 'UUID', note: 'FK → seller_profiles(id)' },
      { name: 'quantite', type: 'INTEGER', note: '' },
      { name: 'prix_unitaire', type: 'INTEGER', note: '' },
      { name: 'sous_total', type: 'INTEGER', note: '' },
    ]
  },
  {
    name: 'payment_configs',
    description: 'Configuration des passerelles de paiement (Stripe, FedaPay, KakiaPay...)',
    columns: [
      { name: 'provider', type: 'TEXT UNIQUE', note: 'stripe | fedapay | kakiapay | mtn_momo...' },
      { name: 'nom_affichage', type: 'TEXT', note: '' },
      { name: 'actif', type: 'BOOLEAN', note: '' },
      { name: 'mode', type: 'TEXT', note: 'test | production' },
      { name: 'config_json', type: 'JSONB', note: 'Clés API chiffrées' },
    ]
  },
  {
    name: 'site_settings',
    description: 'Paramètres globaux du site (maintenance, inscription...)',
    columns: [
      { name: 'key', type: 'TEXT PK', note: 'maintenance_mode | inscription_ouverte...' },
      { name: 'value', type: 'TEXT', note: 'true | false | texte' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', note: '' },
    ]
  },
  {
    name: 'user_progress',
    description: 'Progression des utilisateurs dans les formations',
    columns: [
      { name: 'user_id', type: 'UUID', note: 'FK → profiles(id)' },
      { name: 'contenu_id', type: 'UUID', note: 'FK → contenus(id)' },
      { name: 'progression', type: 'INTEGER', note: '0-100' },
      { name: 'termine', type: 'BOOLEAN', note: '' },
    ]
  },
  {
    name: 'certificats',
    description: 'Certificats obtenus après formation complète',
    columns: [
      { name: 'user_id', type: 'UUID', note: 'FK → profiles(id)' },
      { name: 'contenu_id', type: 'UUID', note: 'FK → contenus(id)' },
      { name: 'score', type: 'INTEGER', note: '/100' },
      { name: 'delivre_le', type: 'TIMESTAMPTZ', note: '' },
    ]
  },
]

// ========================================
// TESTS API PREDÉFINIS
// ========================================
const API_TESTS: ApiTest[] = [
  { method: 'GET', table: 'profiles', description: 'Lister tous les utilisateurs', filter: 'select=id,email,prenom,nom,role&order=created_at.desc&limit=10' },
  { method: 'GET', table: 'profiles', description: 'Compter les superadmins', filter: 'select=id&role=eq.superadmin' },
  { method: 'GET', table: 'contenus', description: 'Contenus publiés', filter: 'select=id,titre,type,secteur_slug&status=eq.published&order=created_at.desc&limit=10' },
  { method: 'GET', table: 'contenus', description: 'Compter par type', filter: 'select=type,id&order=type' },
  { method: 'GET', table: 'alertes', description: 'Alertes actives', filter: 'select=*&status=eq.active&order=created_at.desc' },
  { method: 'GET', table: 'marketplace_annonces', description: 'Annonces approuvées', filter: 'select=id,titre,categorie,prix&status=eq.approved&limit=10' },
  { method: 'GET', table: 'marketplace_annonces', description: 'Annonces en attente', filter: 'select=id,titre,vendeur_nom,created_at&status=eq.pending' },
  { method: 'GET', table: 'orders', description: 'Commandes récentes', filter: 'select=order_number,client_prenom,total,statut&order=created_at.desc&limit=10' },
  { method: 'GET', table: 'subscription_plans', description: 'Tous les plans', filter: 'select=*&order=ordre' },
  { method: 'GET', table: 'company_subscriptions', description: 'Abonnements actifs', filter: 'select=*,plan:subscription_plans(nom)&statut=eq.actif' },
  { method: 'GET', table: 'payment_configs', description: 'Config paiements', filter: 'select=provider,nom_affichage,actif,mode' },
  { method: 'GET', table: 'site_settings', description: 'Paramètres du site', filter: 'select=*' },
]

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [openTables, setOpenTables] = useState<string[]>([])
  const [copied, setCopied] = useState('')
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [customQuery, setCustomQuery] = useState({ table: 'profiles', filter: 'select=id,email,role&limit=5', method: 'GET' })
  const [customResult, setCustomResult] = useState<any>(null)
  const [customLoading, setCustomLoading] = useState(false)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  function toggleTable(name: string) {
    setOpenTables(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])
  }

  async function runApiTest(test: ApiTest, id: string) {
    setTestLoading(id)
    try {
      let query = supabase.from(test.table).select('*')
      if (test.filter) {
        const params = new URLSearchParams(test.filter)
        const selectParam = params.get('select')
        if (selectParam) query = supabase.from(test.table).select(selectParam)

        // Appliquer les filtres
        params.forEach((value, key) => {
          if (key === 'select' || key === 'order' || key === 'limit') return
          const [col, op] = key.split('=').length > 1 ? key.split('=') : [key, 'eq']
          const operator = value.split('.')[0]
          const val = value.split('.').slice(1).join('.')
          if (operator === 'eq') (query as any) = (query as any).eq(col, val)
        })

        const orderParam = params.get('order')
        if (orderParam) {
          const [col, dir] = orderParam.split('.')
          ;(query as any) = (query as any).order(col, { ascending: dir !== 'desc' })
        }
        const limitParam = params.get('limit')
        if (limitParam) (query as any) = (query as any).limit(parseInt(limitParam))
      }
      const { data, error, count } = await (query as any)
      setTestResults(prev => ({
        ...prev,
        [id]: error ? { error: error.message } : { data, count, rows: data?.length || 0 }
      }))
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [id]: { error: e.message } }))
    }
    setTestLoading(null)
  }

  async function runCustomQuery() {
    setCustomLoading(true)
    setCustomResult(null)
    try {
      const { data, error } = await supabase
        .from(customQuery.table)
        .select(customQuery.filter.includes('select=') ? customQuery.filter.split('select=')[1].split('&')[0] : '*')
        .limit(20)
      setCustomResult(error ? { error: error.message } : { data, rows: data?.length })
    } catch (e: any) {
      setCustomResult({ error: e.message })
    }
    setCustomLoading(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--navy-900)' }}>

      {/* Sidebar navigation */}
      <aside className="w-56 bg-navy-800 border-r border-white/5 flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: 'var(--orange)' }} />
            <span className="text-white font-display font-bold text-sm">Documentation</span>
          </div>
          <p className="text-white/30 text-xs mt-1">Guide développeur complet</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === s.id
                    ? 'bg-orange-500/10 border border-orange-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                style={activeSection === s.id ? { color: s.color } : {}}>
                <Icon size={15} className="flex-shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <p className="text-orange-400 text-xs font-bold mb-1">🔒 Accès restreint</p>
            <p className="text-white/40 text-[10px]">Page visible uniquement pour admin, superadmin et moderateur.</p>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* ============================
            SECTION: VUE D'ENSEMBLE
        ============================ */}
        {activeSection === 'overview' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-display text-white mb-2">Think Safety — Documentation Développeur</h1>
              <p className="text-white/50">Guide complet pour comprendre, maintenir et faire évoluer la plateforme.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Nom du projet', value: 'Think Safety' },
                { label: 'Version', value: 'Next.js 14.2.5' },
                { label: 'Repository GitHub', value: 'github.com/GrangeAGBODANDE/Think-safety', link: 'https://github.com/GrangeAGBODANDE/Think-safety' },
                { label: 'Déploiement', value: 'Vercel (Production automatique depuis main)' },
                { label: 'Base de données', value: 'Supabase (PostgreSQL)' },
                { label: 'Project ID Supabase', value: 'fyrtznukoaudzceelwza' },
                { label: 'URL Supabase', value: 'fyrtznukoaudzceelwza.supabase.co' },
                { label: 'Branche principale', value: 'main (deploy auto sur push)' },
              ].map((item, i) => (
                <div key={i} className="card p-4">
                  <p className="text-white/40 text-xs mb-1">{item.label}</p>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-orange-400 text-sm font-medium hover:underline">{item.value}</a>
                  ) : (
                    <p className="text-white text-sm font-medium">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-3">🎯 Description du projet</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-3">
                Think Safety est une plateforme de formation à la sécurité au travail destinée aux professionnels 
                d&apos;Afrique de l&apos;Ouest (principalement Bénin). Elle comprend :
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                {[
                  '📚 Bibliothèque de formations (vidéos YouTube intégrées sans branding, documents PDF, FAQ) organisées par secteur',
                  '🛒 Marketplace d\'équipements de sécurité et services HSE avec panier et commandes',
                  '🚨 Système d\'alertes sécurité en temps réel avec niveaux (info, attention, danger, urgence)',
                  '👤 Espace utilisateur avec suivi de progression et certificats',
                  '🏢 Espace entreprise avec gestion des annonces et commandes reçues',
                  '⚙️ Centre d\'administration complet (superadmin, admin, modérateur)',
                  '💳 Système d\'abonnements pour entreprises (Gratuit, Basic, Pro, Entreprise)',
                  '🔔 Mode maintenance géré depuis l\'admin',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-3">🔑 Accès importants</h2>
              <div className="space-y-3">
                {[
                  { label: 'GitHub', url: 'https://github.com/GrangeAGBODANDE/Think-safety', note: 'Code source complet' },
                  { label: 'Vercel Dashboard', url: 'https://vercel.com/grangeagbodandes-projects/think-safety', note: 'Déploiements, logs, env vars' },
                  { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard/project/fyrtznukoaudzceelwza', note: 'DB, Auth, Storage, SQL Editor' },
                  { label: 'Site en production', url: 'https://think-safety-git-main-grangeagbodandes-projects.vercel.app', note: 'URL Vercel auto-générée' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-navy-700 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{item.label}</p>
                      <p className="text-white/40 text-xs">{item.note}</p>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer"
                      className="text-orange-400 text-xs hover:underline flex items-center gap-1">
                      Ouvrir →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 border-orange-500/20 bg-orange-500/5">
              <h2 className="font-display font-bold text-orange-400 mb-3">⚠️ Points d&apos;attention critiques</h2>
              <ul className="space-y-2 text-sm text-white/60">
                <li>🔴 Le fichier <code className="text-orange-300">.env.local</code> est dans le repo GitHub — <strong className="text-white">supprimer et ajouter au .gitignore</strong></li>
                <li>🟡 Next.js 14.2.5 a une vulnérabilité de sécurité — mettre à jour vers une version corrigée</li>
                <li>🟡 Les packages Supabase auth-helpers sont dépréciés — migrer vers @supabase/ssr</li>
                <li>🟢 RLS (Row Level Security) activé sur toutes les tables principales</li>
                <li>🟢 Fonction <code className="text-orange-300">get_my_role()</code> SECURITY DEFINER pour éviter la récursion infinie</li>
              </ul>
            </div>
          </div>
        )}

        {/* ============================
            SECTION: STACK TECHNIQUE
        ============================ */}
        {activeSection === 'stack' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold font-display text-white">Stack Technique</h1>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  category: 'Frontend', color: '#2196F3',
                  items: [
                    { name: 'Next.js 14.2.5', note: 'App Router, SSR/ISR, Server Components' },
                    { name: 'React 18', note: 'Hooks, Client Components' },
                    { name: 'TypeScript', note: 'Typage strict' },
                    { name: 'Tailwind CSS', note: 'Utility-first CSS' },
                    { name: 'Lucide React', note: 'Icônes cohérentes' },
                  ]
                },
                {
                  category: 'Backend / BaaS', color: '#00C896',
                  items: [
                    { name: 'Supabase', note: 'PostgreSQL, Auth, Storage, Realtime' },
                    { name: 'Supabase Auth', note: 'JWT, email/password, magic link' },
                    { name: 'Row Level Security', note: 'Sécurité au niveau DB' },
                    { name: 'Supabase Edge Functions', note: 'Serverless (non utilisé actuellement)' },
                  ]
                },
                {
                  category: 'Déploiement', color: '#FF6B35',
                  items: [
                    { name: 'Vercel', note: 'CI/CD auto depuis GitHub main' },
                    { name: 'GitHub', note: 'Repo: GrangeAGBODANDE/Think-safety' },
                    { name: 'Middleware Next.js', note: 'Mode maintenance, protection routes' },
                  ]
                },
                {
                  category: 'Intégrations prévues', color: '#FFD700',
                  items: [
                    { name: 'FedaPay', note: 'Paiement mobile Afrique (configuré, non activé)' },
                    { name: 'KakiaPay', note: 'Paiement mobile Bénin (configuré, non activé)' },
                    { name: 'MTN MoMo', note: 'Mobile Money (configuré, non activé)' },
                    { name: 'Stripe', note: 'Carte bancaire (configuré, non activé)' },
                    { name: 'Orange Money / Moov / Wave', note: 'Configurés, non activés' },
                  ]
                },
              ].map(cat => (
                <div key={cat.category} className="card p-5">
                  <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    {cat.category}
                  </h3>
                  <ul className="space-y-2">
                    {cat.items.map(item => (
                      <li key={item.name} className="flex flex-col">
                        <span className="text-white text-sm font-medium">{item.name}</span>
                        <span className="text-white/40 text-xs">{item.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Variables d&apos;environnement requises</h2>
              <div className="space-y-3">
                {[
                  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://fyrtznukoaudzceelwza.supabase.co', where: 'Supabase Dashboard > Project Settings > API' },
                  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGc...', where: 'Supabase Dashboard > Project Settings > API' },
                ].map(env => (
                  <div key={env.key} className="bg-navy-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-orange-400 font-mono text-sm">{env.key}</p>
                        <p className="text-white/40 text-xs mt-0.5">{env.where}</p>
                      </div>
                      <button onClick={() => copy(env.key, env.key)}
                        className="text-white/30 hover:text-white flex-shrink-0">
                        {copied === env.key ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-3">
                ⚠️ Ces variables doivent être configurées dans Vercel → Project Settings → Environment Variables et dans le fichier <code>.env.local</code> en local.
              </p>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Commandes de développement local</h2>
              {[
                { cmd: 'git clone https://github.com/GrangeAGBODANDE/Think-safety.git', note: 'Cloner le repo' },
                { cmd: 'cd Think-safety && npm install', note: 'Installer les dépendances' },
                { cmd: 'cp .env.local.example .env.local', note: 'Créer le fichier env (puis remplir les valeurs)' },
                { cmd: 'npm run dev', note: 'Démarrer en développement → http://localhost:3000' },
                { cmd: 'npm run build', note: 'Build de production (teste avant de pusher)' },
                { cmd: 'git add . && git commit -m "message" && git push', note: 'Déployer (Vercel déploie automatiquement)' },
              ].map((cmd, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-center justify-between bg-navy-700 rounded-xl px-4 py-3">
                    <code className="text-green-400 text-sm">{cmd.cmd}</code>
                    <button onClick={() => copy(cmd.cmd, `cmd-${i}`)} className="text-white/30 hover:text-white ml-3 flex-shrink-0">
                      {copied === `cmd-${i}` ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-white/30 text-xs mt-1 px-1">{cmd.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================
            SECTION: STRUCTURE GITHUB
        ============================ */}
        {activeSection === 'github' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold font-display text-white">Structure GitHub</h1>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Arborescence complète</h2>
              <div className="font-mono text-sm space-y-1">
                {[
                  { path: 'app/', note: 'Routes Next.js (App Router)', level: 0, type: 'folder' },
                  { path: 'app/page.tsx', note: 'Page d\'accueil publique (landing)', level: 1, type: 'file' },
                  { path: 'app/layout.tsx', note: 'Layout racine (polices, metadata)', level: 1, type: 'file' },
                  { path: 'app/globals.css', note: 'CSS global + variables + classes custom', level: 1, type: 'file' },
                  { path: 'app/auth/', note: 'Authentification', level: 1, type: 'folder' },
                  { path: 'app/auth/page.tsx', note: 'Connexion + inscription (2 étapes: apprenant/entreprise)', level: 2, type: 'file' },
                  { path: 'app/auth/reset/page.tsx', note: 'Reset mot de passe', level: 2, type: 'file' },
                  { path: 'app/dashboard/page.tsx', note: 'Espace personnel utilisateur', level: 1, type: 'file' },
                  { path: 'app/secteurs/', note: 'Formations par secteur', level: 1, type: 'folder' },
                  { path: 'app/secteurs/page.tsx', note: 'Liste des 18 secteurs', level: 2, type: 'file' },
                  { path: 'app/secteurs/[slug]/page.tsx', note: 'Page d\'un secteur (vidéos, docs, FAQ)', level: 2, type: 'file' },
                  { path: 'app/alertes/page.tsx', note: 'Alertes sécurité avec filtres', level: 1, type: 'file' },
                  { path: 'app/marketplace/', note: 'Marketplace d\'équipements', level: 1, type: 'folder' },
                  { path: 'app/marketplace/page.tsx', note: 'Liste annonces + panier + filtre catégorie', level: 2, type: 'file' },
                  { path: 'app/marketplace/publier/page.tsx', note: 'Formulaire publication (admin + vendeurs seulement)', level: 2, type: 'file' },
                  { path: 'app/panier/page.tsx', note: 'Panier d\'achat + checkout + confirmation commande', level: 1, type: 'file' },
                  { path: 'app/abonnements/page.tsx', note: 'Plans d\'abonnement entreprises', level: 1, type: 'file' },
                  { path: 'app/mes-commandes/page.tsx', note: 'Commandes reçues (vendeurs) avec accès conditionnel', level: 1, type: 'file' },
                  { path: 'app/recherche/page.tsx', note: 'Recherche full-text', level: 1, type: 'file' },
                  { path: 'app/maintenance/page.tsx', note: 'Page affichée en mode maintenance', level: 1, type: 'file' },
                  { path: 'app/admin/', note: '🔒 Centre d\'administration (admin/superadmin/modérateur)', level: 1, type: 'folder' },
                  { path: 'app/admin/layout.tsx', note: 'Sidebar admin + vérification rôle', level: 2, type: 'file' },
                  { path: 'app/admin/page.tsx', note: 'Redirection → /admin/dashboard', level: 2, type: 'file' },
                  { path: 'app/admin/dashboard/page.tsx', note: 'Stats temps réel + actions rapides', level: 2, type: 'file' },
                  { path: 'app/admin/utilisateurs/page.tsx', note: 'CRUD utilisateurs + création de compte', level: 2, type: 'file' },
                  { path: 'app/admin/entreprises/page.tsx', note: 'Gestion entreprises + abonnements', level: 2, type: 'file' },
                  { path: 'app/admin/contenus/page.tsx', note: 'Liste contenus avec filtres', level: 2, type: 'file' },
                  { path: 'app/admin/contenus/nouveau/page.tsx', note: 'Création/édition contenu (vidéo/doc/FAQ + is_paid)', level: 2, type: 'file' },
                  { path: 'app/admin/alertes/page.tsx', note: 'CRUD alertes avec modal', level: 2, type: 'file' },
                  { path: 'app/admin/marketplace/page.tsx', note: 'Modération + création annonces', level: 2, type: 'file' },
                  { path: 'app/admin/commandes/page.tsx', note: 'Toutes les commandes avec détails', level: 2, type: 'file' },
                  { path: 'app/admin/abonnements/page.tsx', note: 'CRUD plans d\'abonnement', level: 2, type: 'file' },
                  { path: 'app/admin/paiements/page.tsx', note: 'Config passerelles (Stripe, FedaPay, KakiaPay...)', level: 2, type: 'file' },
                  { path: 'app/admin/parametres/page.tsx', note: 'Mode maintenance + paramètres globaux', level: 2, type: 'file' },
                  { path: 'app/admin/documentation/page.tsx', note: '📄 Cette page', level: 2, type: 'file' },
                  { path: 'components/', note: 'Composants réutilisables', level: 0, type: 'folder' },
                  { path: 'components/Navbar.tsx', note: 'Navigation + menu mobile + CartButton + menu profil', level: 1, type: 'file' },
                  { path: 'components/Footer.tsx', note: 'Pied de page', level: 1, type: 'file' },
                  { path: 'components/VideoPlayer.tsx', note: 'Lecteur YouTube sans branding (youtube-nocookie.com)', level: 1, type: 'file' },
                  { path: 'components/DocumentViewer.tsx', note: 'Visionneuse PDF inline + fullscreen + zoom', level: 1, type: 'file' },
                  { path: 'components/CartButton.tsx', note: 'Icône panier avec compteur (localStorage)', level: 1, type: 'file' },
                  { path: 'lib/', note: 'Utilitaires', level: 0, type: 'folder' },
                  { path: 'lib/supabase.ts', note: 'Client Supabase (createClientComponentClient)', level: 1, type: 'file' },
                  { path: 'lib/secteurs-data.ts', note: 'Données statiques des 18 secteurs (slug, nom, icon, couleur)', level: 1, type: 'file' },
                  { path: 'types/index.ts', note: 'Types TypeScript globaux', level: 1, type: 'file' },
                  { path: 'middleware.ts', note: 'Mode maintenance + protection routes admin', level: 0, type: 'file' },
                  { path: 'next.config.js', note: 'Config Next.js', level: 0, type: 'file' },
                  { path: 'tailwind.config.ts', note: 'Config Tailwind (couleurs navy-*)', level: 0, type: 'file' },
                  { path: '.env.local', note: '⚠️ Variables d\'environnement (NE PAS commiter !)', level: 0, type: 'file' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 py-0.5 ${item.type === 'folder' ? 'mt-2' : ''}`}
                    style={{ paddingLeft: `${item.level * 20}px` }}>
                    <span className={`flex-shrink-0 ${item.type === 'folder' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {item.type === 'folder' ? '📁' : '📄'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`${item.type === 'folder' ? 'text-yellow-300' : 'text-white/80'} text-sm`}>
                        {item.path}
                      </span>
                      <span className="text-white/30 text-xs ml-2">— {item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================
            SECTION: BASE DE DONNÉES
        ============================ */}
        {activeSection === 'database' && (
          <div className="max-w-5xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display text-white">Base de données</h1>
                <p className="text-white/40 text-sm">PostgreSQL via Supabase — {DB_TABLES.length} tables</p>
              </div>
              <a href="https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/editor" target="_blank" rel="noreferrer"
                className="btn-secondary py-2 px-4 text-sm">
                Ouvrir SQL Editor →
              </a>
            </div>

            <div className="card p-4 bg-blue-500/5 border-blue-500/20">
              <p className="text-blue-400 text-sm font-medium mb-2">Notes importantes sur la DB</p>
              <ul className="space-y-1 text-white/50 text-xs">
                <li>• RLS (Row Level Security) activé sur toutes les tables — vérifiez les policies si une requête échoue</li>
                <li>• Trigger <code>handle_new_user()</code> crée automatiquement un profil dans <code>profiles</code> à chaque inscription</li>
                <li>• Fonction <code>get_my_role()</code> SECURITY DEFINER — utilisée pour éviter la récursion dans les policies</li>
                <li>• Les videos YouTube sont stockées comme URLs — le lecteur utilise youtube-nocookie.com pour masquer l&apos;origine</li>
                <li>• Le panier est en localStorage (côté client) — pas en DB</li>
              </ul>
            </div>

            {DB_TABLES.map(table => (
              <div key={table.name} className="card overflow-hidden">
                <button onClick={() => toggleTable(table.name)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Database size={14} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-mono font-bold">{table.name}</p>
                      <p className="text-white/40 text-xs">{table.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">{table.columns.length} colonnes</span>
                    {openTables.includes(table.name)
                      ? <ChevronDown size={16} className="text-white/40" />
                      : <ChevronRight size={16} className="text-white/40" />}
                  </div>
                </button>

                {openTables.includes(table.name) && (
                  <div className="border-t border-white/5 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-navy-700">
                          <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Colonne</th>
                          <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Type</th>
                          <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {table.columns.map(col => (
                          <tr key={col.name} className="hover:bg-white/2">
                            <td className="px-4 py-2 font-mono text-orange-300 text-sm">{col.name}</td>
                            <td className="px-4 py-2 text-blue-400 text-xs font-mono">{col.type}</td>
                            <td className="px-4 py-2 text-white/40 text-xs">{col.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ============================
            SECTION: COMPOSANTS & CLASSES
        ============================ */}
        {activeSection === 'components' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold font-display text-white">Composants & Classes CSS</h1>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Classes CSS custom (globals.css)</h2>
              <p className="text-white/40 text-sm mb-4">Ces classes sont définies dans <code>app/globals.css</code> avec <code>@layer components</code>. Elles peuvent être utilisées dans tout le projet comme des classes Tailwind normales.</p>
              <div className="space-y-3">
                {[
                  { cls: '.btn-primary', desc: 'Bouton principal orange avec effet hover', usage: '<button className="btn-primary">Texte</button>' },
                  { cls: '.btn-secondary', desc: 'Bouton secondaire transparent avec bordure', usage: '<button className="btn-secondary">Texte</button>' },
                  { cls: '.card', desc: 'Carte avec bg navy-800, border, hover effect', usage: '<div className="card p-5">Contenu</div>' },
                  { cls: '.card-glow', desc: 'Carte avec gradient orange doux', usage: '<div className="card-glow p-5">Contenu</div>' },
                  { cls: '.input-field', desc: 'Champ de saisie stylisé dark', usage: '<input className="input-field" />' },
                  { cls: '.input-label', desc: 'Label de formulaire', usage: '<label className="input-label">Texte</label>' },
                  { cls: '.badge', desc: 'Badge générique', usage: 'Toujours combiner avec une variante' },
                  { cls: '.badge-orange', desc: 'Badge orange (admin, catégorie)', usage: '<span className="badge badge-orange">Admin</span>' },
                  { cls: '.badge-safe', desc: 'Badge vert (publié, actif)', usage: '<span className="badge badge-safe">Publié</span>' },
                  { cls: '.badge-warn', desc: 'Badge jaune (en attente)', usage: '<span className="badge badge-warn">Attente</span>' },
                  { cls: '.badge-danger', desc: 'Badge rouge (urgence, danger)', usage: '<span className="badge badge-danger">Urgence</span>' },
                  { cls: '.badge-info', desc: 'Badge bleu (info, certifié)', usage: '<span className="badge badge-info">Certifié</span>' },
                  { cls: '.section-title', desc: 'Titre de section (police Rajdhani, responsive)', usage: '<h1 className="section-title text-white">Titre</h1>' },
                  { cls: '.section-eyebrow', desc: 'Petit texte mono au-dessus des titres', usage: '<p className="section-eyebrow">Sous-titre</p>' },
                  { cls: '.gradient-text', desc: 'Texte avec gradient orange→jaune', usage: '<span className="gradient-text">Texte</span>' },
                  { cls: '.sidebar-link', desc: 'Lien de navigation sidebar', usage: '<a className="sidebar-link">Lien</a>' },
                  { cls: '.progress-bar', desc: 'Container barre de progression', usage: '<div className="progress-bar"><div className="progress-fill" style={{width: "60%"}} /></div>' },
                  { cls: '.hero-bg', desc: 'Background radial gradient pour hero sections', usage: '<section className="hero-bg">...</section>' },
                ].map(item => (
                  <div key={item.cls} className="bg-navy-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <code className="text-orange-400 font-mono text-sm">{item.cls}</code>
                        <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className="bg-navy-800 rounded-lg px-3 py-2 flex items-center justify-between">
                      <code className="text-green-400 text-xs">{item.usage}</code>
                      <button onClick={() => copy(item.usage, item.cls)} className="text-white/30 hover:text-white ml-2">
                        {copied === item.cls ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Variables CSS (couleurs)</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { var: '--orange', hex: '#FF6B35', usage: 'Couleur principale' },
                  { var: '--orange-deep', hex: '#E55A25', usage: 'Hover boutons' },
                  { var: '--navy-900', hex: '#0D1117', usage: 'Background principal' },
                  { var: '--navy-800', hex: '#161B22', usage: 'Cards, sidebar' },
                  { var: '--navy-700', hex: '#1C2333', usage: 'Inputs, secondary bg' },
                  { var: '--navy-600', hex: '#21262D', usage: 'Toggles off' },
                  { var: '--safe', hex: '#00C896', usage: 'Succès, publié, actif' },
                  { var: '--warn', hex: '#FFD700', usage: 'Avertissement, attention' },
                  { var: '--danger', hex: '#FF4757', usage: 'Erreur, danger, urgence' },
                ].map(v => (
                  <div key={v.var} className="flex items-center gap-3 bg-navy-700 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: v.hex }} />
                    <div>
                      <code className="text-white/80 text-xs">{v.var}</code>
                      <p className="text-white/40 text-xs">{v.hex} — {v.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Couleurs Tailwind custom (tailwind.config.ts)</h2>
              <p className="text-white/50 text-sm mb-3">Les classes <code>bg-navy-*</code> et <code>text-navy-*</code> sont définies dans la config Tailwind :</p>
              <div className="bg-navy-700 rounded-xl p-4 font-mono text-sm">
                <p className="text-purple-400">{'navy: {'}</p>
                {[700, 800, 900].map(n => (
                  <p key={n} className="pl-4 text-white/70">{`'${n}': 'var(--navy-${n})',`}</p>
                ))}
                <p className="text-purple-400">{'}'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================
            SECTION: APIs & SERVICES
        ============================ */}
        {activeSection === 'apis' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold font-display text-white">APIs & Services</h1>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Supabase — Client JavaScript</h2>
              <p className="text-white/50 text-sm mb-3">Le client Supabase est défini dans <code>lib/supabase.ts</code> et utilisé dans tous les composants :</p>
              <div className="bg-navy-700 rounded-xl p-4 font-mono text-sm mb-3">
                <p className="text-purple-400">import {'{ createClientComponentClient }'} from &apos;@supabase/auth-helpers-nextjs&apos;</p>
                <p className="text-white/70">export const supabase = createClientComponentClient()</p>
              </div>
              <p className="text-white/30 text-xs">Les credentials sont lus automatiquement depuis les variables d&apos;environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Patterns Supabase fréquents</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Lecture simple',
                    code: `const { data, error } = await supabase
  .from('contenus')
  .select('id, titre, type')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)`
                  },
                  {
                    title: 'Lecture avec jointure',
                    code: `const { data } = await supabase
  .from('order_items')
  .select('*, order:orders(*), annonce:marketplace_annonces(titre)')
  .eq('seller_profile_id', sellerId)`
                  },
                  {
                    title: 'Insertion',
                    code: `const { data, error } = await supabase
  .from('alertes')
  .insert({ titre: '...', contenu: '...', niveau: 'info', status: 'active' })
  .select()
  .single()`
                  },
                  {
                    title: 'Mise à jour',
                    code: `const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)`
                  },
                  {
                    title: 'Authentification',
                    code: `// Connexion
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Déconnexion  
await supabase.auth.signOut()

// Utilisateur courant
const { data: { user } } = await supabase.auth.getUser()`
                  },
                ].map(item => (
                  <div key={item.title}>
                    <p className="text-white/60 text-sm mb-2">{item.title}</p>
                    <div className="bg-navy-700 rounded-xl p-4 flex items-start justify-between gap-3">
                      <pre className="text-green-400 font-mono text-xs overflow-x-auto">{item.code}</pre>
                      <button onClick={() => copy(item.code, item.title)} className="text-white/30 hover:text-white flex-shrink-0">
                        {copied === item.title ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Rôles et permissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-3 py-2 text-left text-xs text-white/40">Fonctionnalité</th>
                      <th className="px-3 py-2 text-center text-xs text-white/40">user</th>
                      <th className="px-3 py-2 text-center text-xs text-white/40">moderateur</th>
                      <th className="px-3 py-2 text-center text-xs text-white/40">admin</th>
                      <th className="px-3 py-2 text-center text-xs text-white/40">superadmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { feat: 'Voir les formations', user: '✅', mod: '✅', admin: '✅', super: '✅' },
                      { feat: 'Voir le marketplace', user: '✅', mod: '✅', admin: '✅', super: '✅' },
                      { feat: 'Publier une annonce', user: '❌', mod: '✅', admin: '✅', super: '✅' },
                      { feat: 'Accès /admin', user: '❌', mod: '✅', admin: '✅', super: '✅' },
                      { feat: 'Gérer les contenus', user: '❌', mod: '✅', admin: '✅', super: '✅' },
                      { feat: 'Gérer les utilisateurs', user: '❌', mod: '❌', admin: '✅', super: '✅' },
                      { feat: 'Gérer les abonnements', user: '❌', mod: '❌', admin: '✅', super: '✅' },
                      { feat: 'Config paiements', user: '❌', mod: '❌', admin: '✅', super: '✅' },
                      { feat: 'Mode maintenance', user: '❌', mod: '❌', admin: '✅', super: '✅' },
                    ].map(row => (
                      <tr key={row.feat} className="hover:bg-white/2">
                        <td className="px-3 py-2 text-white/70 text-sm">{row.feat}</td>
                        <td className="px-3 py-2 text-center text-sm">{row.user}</td>
                        <td className="px-3 py-2 text-center text-sm">{row.mod}</td>
                        <td className="px-3 py-2 text-center text-sm">{row.admin}</td>
                        <td className="px-3 py-2 text-center text-sm">{row.super}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================
            SECTION: DÉPLOIEMENT
        ============================ */}
        {activeSection === 'deployment' && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold font-display text-white">Déploiement</h1>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Flux de déploiement</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Modifier un fichier sur GitHub', desc: 'Éditer directement sur GitHub.com ou via git push depuis local', color: '#2196F3' },
                  { step: '2', title: 'Commit sur la branche main', desc: 'Vercel détecte automatiquement le push sur main', color: '#9C27B0' },
                  { step: '3', title: 'Build Vercel (~2 min)', desc: 'npm run build — si erreur, le déploiement s\'arrête et l\'ancien reste en ligne', color: '#FF6B35' },
                  { step: '4', title: 'Déploiement automatique', desc: 'Si build réussi, le site est mis à jour en production', color: '#00C896' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-4 p-4 bg-navy-700 rounded-xl">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: s.color }}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-white font-medium">{s.title}</p>
                      <p className="text-white/40 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Vérifications avant de pousser sur GitHub</h2>
              <ul className="space-y-2">
                {[
                  'Le fichier se termine par la dernière } de la fonction — vérifiez en mode Raw sur GitHub',
                  'Aucun texte markdown (```, ---, ###) dans les fichiers .tsx',
                  'Tester npm run build en local avant de pusher',
                  'Les imports correspondent aux fichiers existants',
                  'Les variables d\'environnement sont configurées dans Vercel',
                  'Ne jamais commiter .env.local (ajouter au .gitignore)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Supabase — Actions importantes</h2>
              <div className="space-y-3">
                {[
                  { title: 'SQL Editor', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/sql/new`, desc: 'Exécuter des requêtes SQL directement' },
                  { title: 'Table Editor', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/editor`, desc: 'Voir/modifier les données des tables' },
                  { title: 'Authentication', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/auth/users`, desc: 'Gérer les utilisateurs, email templates, URL Config' },
                  { title: 'Storage', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/storage/buckets`, desc: 'Upload de fichiers PDF et images' },
                  { title: 'API Keys', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/settings/api`, desc: 'URL et clés anon/service_role' },
                  { title: 'Policies (RLS)', url: `https://supabase.com/dashboard/project/fyrtznukoaudzceelwza/auth/policies`, desc: 'Règles de sécurité par table' },
                ].map(item => (
                  <div key={item.title} className="flex items-center justify-between p-3 bg-navy-700 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-orange-400 text-xs hover:underline whitespace-nowrap ml-4">
                      Ouvrir →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================
            SECTION: TESTEUR API
        ============================ */}
        {activeSection === 'testing' && (
          <div className="max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Testeur API Supabase</h1>
              <p className="text-white/40 text-sm">Exécutez des requêtes directement sur la base de données depuis cette interface.</p>
            </div>

            {/* Requêtes prédéfinies */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4">Requêtes prédéfinies</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {API_TESTS.map((test, i) => {
                  const id = `test-${i}`
                  const result = testResults[id]
                  return (
                    <div key={i} className="bg-navy-700 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="badge badge-safe text-[10px]">{test.method}</span>
                            <code className="text-orange-300 text-xs">{test.table}</code>
                          </div>
                          <p className="text-white/60 text-xs">{test.description}</p>
                        </div>
                        <button
                          onClick={() => runApiTest(test, id)}
                          disabled={testLoading === id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                          style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--orange)', border: '1px solid rgba(255,107,53,0.25)' }}
                        >
                          <Play size={11} />
                          {testLoading === id ? '...' : 'Run'}
                        </button>
                      </div>

                      {test.filter && (
                        <code className="text-white/30 text-[10px] block mb-2 break-all">{test.filter}</code>
                      )}

                      {result && (
                        <div className={`rounded-lg p-3 text-xs font-mono ${result.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {result.error ? (
                            <p>❌ {result.error}</p>
                          ) : (
                            <>
                              <p className="text-green-400 mb-1">✅ {result.rows} résultat(s)</p>
                              <pre className="text-white/60 text-[10px] overflow-x-auto max-h-32">
                                {JSON.stringify(result.data?.slice(0, 3), null, 2)}
                                {(result.rows || 0) > 3 && `\n... +${(result.rows || 0) - 3} autres`}
                              </pre>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Requête personnalisée */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Terminal size={18} style={{ color: 'var(--orange)' }} />
                Requête personnalisée
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Table</label>
                    <select
                      value={customQuery.table}
                      onChange={e => setCustomQuery(prev => ({ ...prev, table: e.target.value }))}
                      className="input-field"
                    >
                      {DB_TABLES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Méthode</label>
                    <select
                      value={customQuery.method}
                      onChange={e => setCustomQuery(prev => ({ ...prev, method: e.target.value }))}
                      className="input-field"
                    >
                      <option value="GET">GET — Lecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Filtre (format: select=col1,col2&colonne=eq.valeur&limit=10)</label>
                  <input
                    type="text"
                    value={customQuery.filter}
                    onChange={e => setCustomQuery(prev => ({ ...prev, filter: e.target.value }))}
                    placeholder="select=id,email,role&role=eq.superadmin&limit=5"
                    className="input-field font-mono text-sm"
                  />
                </div>

                <div className="p-3 bg-navy-700 rounded-xl">
                  <p className="text-white/40 text-xs">
                    Exemples de filtres : <code className="text-orange-300">select=*&limit=5</code> | <code className="text-orange-300">select=id,titre&status=eq.published</code> | <code className="text-orange-300">select=*&order=created_at.desc&limit=3</code>
                  </p>
                </div>

                <button
                  onClick={runCustomQuery}
                  disabled={customLoading}
                  className="btn-primary py-2.5 px-6"
                >
                  <Play size={14} />
                  {customLoading ? 'Exécution...' : 'Exécuter la requête'}
                </button>

                {customResult && (
                  <div className={`rounded-xl p-4 font-mono text-xs ${customResult.error ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                    {customResult.error ? (
                      <p className="text-red-400">❌ Erreur : {customResult.error}</p>
                    ) : (
                      <>
                        <p className="text-green-400 mb-2">✅ {customResult.rows} résultat(s) retourné(s)</p>
                        <pre className="text-white/60 overflow-x-auto max-h-64">
                          {JSON.stringify(customResult.data, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Avertissement */}
            <div className="card p-4 border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-sm mb-1">Attention</p>
                  <p className="text-white/50 text-sm">
                    Ce testeur utilise le client Supabase avec les permissions de l&apos;utilisateur connecté (RLS appliquée). 
                    Pour des opérations d&apos;écriture ou de modification directe, utilisez le SQL Editor de Supabase avec le service_role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
