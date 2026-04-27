'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import {
  BookOpen, Award, Clock, CheckCircle, Play,
  ChevronRight, TrendingUp, Calendar, Star,
  Zap, BarChart2, Lock
} from 'lucide-react'

const TABS = ['En cours', 'Terminés', 'Certificats']

const NIVEAU_LABEL: Record<string, string> = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé'
}

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const [profile, setProfile] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ en_cours: 0, termines: 0, certificats: 0, minutes: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      // Charger les inscriptions avec infos des cours
      const { data: enr } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id, slug, titre, description_courte, image_couverture,
            niveau, secteur_slug, nb_lecons, duree_totale_minutes, est_certifiant
          )
        `)
        .eq('user_id', user.id)
        .order('date_inscription', { ascending: false })

      setEnrollments(enr || [])

      // Charger les certificats
      const { data: certs } = await supabase
        .from('course_certificates')
        .select(`*, courses (titre, slug, secteur_slug)`)
        .eq('user_id', user.id)

      setCertificates(certs || [])

      const en_cours = (enr || []).filter(e => e.statut === 'en_cours').length
      const termines = (enr || []).filter(e => e.statut === 'termine').length
      setStats({
        en_cours,
        termines,
        certificats: (certs || []).length,
        minutes: (enr || []).reduce((acc, e) => acc + (e.courses?.duree_totale_minutes || 0), 0)
      })

      setLoading(false)
    }
    load()
  }, [router])

  const enCours = enrollments.filter(e => e.statut === 'en_cours')
  const termines = enrollments.filter(e => e.statut === 'termine')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'var(--orange)' }}>
            <BookOpen size={24} className="text-white" />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">

        {/* Header utilisateur */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--orange), var(--warn))' }}>
              {profile?.prenom?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Bonsoir, {profile?.prenom} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                Votre espace formation personnel
              </p>
            </div>
          </div>
          <Link href="/secteurs" className="btn-primary py-2.5 px-5 text-sm">
            <BookOpen size={16} />Découvrir des formations
          </Link>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Play, label: 'En cours', value: stats.en_cours, color: '#2196F3' },
            { icon: CheckCircle, label: 'Terminés', value: stats.termines, color: 'var(--safe)' },
            { icon: Award, label: 'Certificats', value: stats.certificats, color: 'var(--warn)' },
            { icon: Clock, label: 'Minutes', value: stats.minutes, color: 'var(--orange)' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
                <div className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                  {s.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="px-5 py-3 text-sm font-medium transition-all relative"
              style={tab === i
                ? { color: 'var(--orange)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              {t}
              {tab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'var(--orange)' }} />
              )}
              {/* Badge count */}
              {i === 0 && stats.en_cours > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'var(--orange)' }}>
                  {stats.en_cours}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ONGLET EN COURS */}
        {tab === 0 && (
          <div>
            {enCours.length === 0 ? (
              <EmptyState
                icon={<Play size={48} />}
                title="Aucune formation en cours"
                desc="Choisissez un secteur et commencez votre première formation gratuitement."
                cta="Explorer les formations"
                href="/secteurs"
              />
            ) : (
              <div className="space-y-4">
                {enCours.map(e => (
                  <CourseCard key={e.id} enrollment={e} type="en_cours" />
                ))}
              </div>
            )}

            {/* Suggestions si peu de cours */}
            {enCours.length < 3 && <SuggestedCourses />}
          </div>
        )}

        {/* ONGLET TERMINÉS */}
        {tab === 1 && (
          <div>
            {termines.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={48} />}
                title="Aucune formation terminée"
                desc="Continuez vos formations en cours pour les voir apparaître ici."
                cta="Voir mes formations en cours"
                href="#"
                onClick={() => setTab(0)}
              />
            ) : (
              <div className="space-y-4">
                {termines.map(e => (
                  <CourseCard key={e.id} enrollment={e} type="termine" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET CERTIFICATS */}
        {tab === 2 && (
          <div>
            {certificates.length === 0 ? (
              <EmptyState
                icon={<Award size={48} />}
                title="Aucun certificat obtenu"
                desc="Terminez une formation à 100% pour obtenir votre certificat automatiquement."
                cta="Voir mes formations"
                href="#"
                onClick={() => setTab(0)}
              />
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {certificates.length} certificat{certificates.length > 1 ? 's' : ''} obtenu{certificates.length > 1 ? 's' : ''}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {certificates.map(cert => (
                    <CertCard key={cert.id} cert={cert} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

// ============================================================
// COMPOSANT CARTE DE COURS
// ============================================================
function CourseCard({ enrollment, type }: { enrollment: any, type: string }) {
  const course = enrollment.courses
  if (!course) return null

  const prog = enrollment.progression || 0
  const isTermine = type === 'termine'

  return (
    <div className="card p-5 group hover:shadow-lg transition-all">
      <div className="flex gap-5 flex-wrap">
        {/* Image / Icône */}
        <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)' }}>
          {course.image_couverture
            ? <img src={course.image_couverture} alt={course.titre} className="w-full h-full object-cover" />
            : '📚'}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <div>
              <span className="text-xs font-mono" style={{ color: 'var(--orange)' }}>
                {course.secteur_slug?.replace(/-/g, ' ')}
              </span>
              <h3 className="font-bold text-base mt-0.5 group-hover:text-orange-500 transition-colors"
                style={{ color: 'var(--text-primary)' }}>
                {course.titre}
              </h3>
            </div>
            {isTermine ? (
              <span className="badge badge-safe text-xs flex-shrink-0">
                <CheckCircle size={11} className="mr-1" />Terminé
              </span>
            ) : (
              <span className="badge badge-info text-xs flex-shrink-0">
                En cours
              </span>
            )}
          </div>

          <p className="text-sm mb-3 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {course.description_courte}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-32">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {prog}% terminé
                </span>
                {course.nb_lecons && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {course.nb_lecons} leçons
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${prog}%`,
                    background: prog === 100
                      ? 'var(--safe)'
                      : 'linear-gradient(90deg, var(--orange), var(--warn))'
                  }}
                />
              </div>
            </div>

            <Link
              href={`/cours/${course.slug}`}
              className="btn-primary py-2 px-4 text-xs flex-shrink-0"
            >
              {isTermine ? 'Revoir' : prog === 0 ? 'Commencer' : 'Reprendre'}
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPOSANT CARTE CERTIFICAT
// ============================================================
function CertCard({ cert }: { cert: any }) {
  return (
    <div className="card overflow-hidden group hover:shadow-xl transition-all">
      {/* Certificat visuel */}
      <div className="h-44 relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: 'rgba(255,215,0,0.2)', border: '2px solid rgba(255,215,0,0.4)' }}>
            <Award size={32} style={{ color: '#FFD700' }} />
          </div>
          <div className="text-white text-xs font-mono opacity-60">{cert.numero_certificat}</div>
        </div>
        {/* Sceau */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
          <Star size={16} style={{ color: '#FFD700' }} fill="#FFD700" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
          {cert.courses?.titre}
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          Obtenu le {new Date(cert.date_emission).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
        <div className="flex gap-2">
          <button className="flex-1 btn-secondary py-1.5 px-3 text-xs justify-center">
            Télécharger
          </button>
          <button className="flex-1 btn-primary py-1.5 px-3 text-xs justify-center">
            Partager
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPOSANT ÉTAT VIDE
// ============================================================
function EmptyState({ icon, title, desc, cta, href, onClick }: any) {
  return (
    <div className="card p-12 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-4"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      {onClick ? (
        <button onClick={onClick} className="btn-primary py-2.5 px-6">{cta}</button>
      ) : (
        <Link href={href} className="btn-primary py-2.5 px-6">{cta}</Link>
      )}
    </div>
  )
}

// ============================================================
// SUGGESTIONS DE COURS
// ============================================================
function SuggestedCourses() {
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    supabase.from('courses').select('*').eq('statut', 'published').limit(3)
      .then(({ data }) => setCourses(data || []))
  }, [])

  if (courses.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} style={{ color: 'var(--orange)' }} />
        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Formations recommandées</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Link key={c.id} href={`/cours/${c.slug}`}
            className="card p-4 group hover:no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-2xl"
              style={{ background: 'var(--bg-secondary)' }}>
              📚
            </div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-orange-500 transition-colors"
              style={{ color: 'var(--text-primary)' }}>
              {c.titre}
            </h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {c.description_courte}
            </p>
            <div className="flex items-center justify-between">
              <span className="badge badge-safe text-[10px]">Gratuit</span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                Commencer <ChevronRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
