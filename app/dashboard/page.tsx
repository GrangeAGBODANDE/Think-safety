'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import {
  BookOpen, Award, Clock, CheckCircle, Play,
  ChevronRight, Zap
} from 'lucide-react'

const TABS = [
  { label: 'En cours',    key: 'en_cours' },
  { label: 'Terminés',   key: 'termine'  },
  { label: 'Certificats', key: 'certificats' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const [profile, setProfile] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    en_cours: 0, termines: 0, certificats: 0, minutes_total: 0
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: p } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      // 1. Charger les inscriptions avec les cours
      const { data: enr } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id, slug, titre, description_courte, image_couverture,
            niveau, secteur_slug, nb_lecons, nb_modules,
            duree_totale_minutes, est_certifiant
          )
        `)
        .eq('user_id', user.id)
        .order('date_inscription', { ascending: false })

      if (!enr || enr.length === 0) {
        setEnrollments([])
        setLoading(false)
        return
      }

      // 2. ✅ Calculer la vraie progression depuis lesson_progress
      const courseIds = enr.map(e => e.course_id)

      // Compter les leçons totales par cours
      const { data: allLessons } = await supabase
        .from('course_lessons')
        .select('id, course_id, est_obligatoire')
        .in('course_id', courseIds)

      // Compter les leçons complétées par cours
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id, course_id, est_complete')
        .eq('user_id', user.id)
        .eq('est_complete', true)
        .in('course_id', courseIds)

      // Construire les maps
      const totalMap: Record<string, number> = {}
      const doneMap: Record<string, number> = {}

      allLessons?.forEach((l: any) => {
        if (!totalMap[l.course_id]) totalMap[l.course_id] = 0
        // Compter seulement les leçons obligatoires (ou toutes si est_obligatoire est null)
        if (l.est_obligatoire !== false) {
          totalMap[l.course_id]++
        }
      })

      completedLessons?.forEach((l: any) => {
        if (!doneMap[l.course_id]) doneMap[l.course_id] = 0
        doneMap[l.course_id]++
      })

      // Enrichir les inscriptions avec la vraie progression
      const enriched = enr.map(e => {
        const total = totalMap[e.course_id] || 0
        const done = doneMap[e.course_id] || 0
        const realPct = total > 0 ? Math.round((done / total) * 100) : 0

        return {
          ...e,
          realProgression: realPct,
          lessonsTotal: total,
          lessonsDone: done,
        }
      })

      // Mettre à jour la progression en DB si elle a changé
      for (const e of enriched) {
        if (e.realProgression !== e.progression) {
          await supabase.from('course_enrollments').update({
            progression: e.realProgression,
            statut: e.realProgression >= 100 ? 'termine' : 'en_cours',
          }).eq('id', e.id)
        }
      }

      setEnrollments(enriched)

      // 3. Certificats
      const { data: certs } = await supabase
        .from('course_certificates')
        .select(`*, courses (titre, slug, secteur_slug)`)
        .eq('user_id', user.id)

      setCertificates(certs || [])

      // 4. Stats
      setStats({
        en_cours: enriched.filter(e => e.realProgression < 100).length,
        termines: enriched.filter(e => e.realProgression >= 100).length,
        certificats: (certs || []).length,
        minutes_total: enriched.reduce((acc, e) => acc + (e.courses?.duree_totale_minutes || 0), 0),
      })

      setLoading(false)
    }
    load()
  }, [router])

  const enCours  = enrollments.filter(e => e.realProgression < 100)
  const termines = enrollments.filter(e => e.realProgression >= 100)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl animate-pulse mx-auto mb-3"
            style={{ background: 'var(--orange)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">

        {/* Header utilisateur */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--orange), var(--warn))' }}>
              {profile?.prenom?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display"
                style={{ color: 'var(--text-primary)' }}>
                Bonsoir, {profile?.prenom} 👋
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Votre espace formation personnel
              </p>
            </div>
          </div>
          <Link href="/secteurs" className="btn-primary py-2.5 px-5 text-sm">
            <BookOpen size={16} />Découvrir des formations
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Play,        label: 'En cours',    value: stats.en_cours,      color: '#2196F3' },
            { icon: CheckCircle, label: 'Terminés',    value: stats.termines,      color: 'var(--safe)' },
            { icon: Award,       label: 'Certificats', value: stats.certificats,   color: 'var(--warn)' },
            { icon: Clock,       label: 'Minutes',     value: stats.minutes_total, color: 'var(--orange)' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </span>
                </div>
                <div className="text-2xl font-bold font-display"
                  style={{ color: 'var(--text-primary)' }}>
                  {s.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setTab(i)}
              className="px-5 py-3 text-sm font-medium transition-all relative">
              <span style={tab === i ? { color: 'var(--orange)' } : { color: 'var(--text-secondary)' }}>
                {t.label}
              </span>
              {i === 0 && stats.en_cours > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'var(--orange)' }}>
                  {stats.en_cours}
                </span>
              )}
              {tab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'var(--orange)' }} />
              )}
            </button>
          ))}
        </div>

        {/* EN COURS */}
        {tab === 0 && (
          <div>
            {enCours.length === 0 ? (
              <EmptyState
                icon={<Play size={40} />}
                title="Aucune formation en cours"
                desc="Commencez votre première formation gratuitement."
                cta="Explorer les formations"
                href="/secteurs"
              />
            ) : (
              <div className="space-y-4">
                {enCours.map(e => <CourseCard key={e.id} enrollment={e} />)}
              </div>
            )}
            <SuggestedCourses enrolled={enrollments.map(e => e.course_id)} />
          </div>
        )}

        {/* TERMINÉS */}
        {tab === 1 && (
          <div>
            {termines.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={40} />}
                title="Aucune formation terminée"
                desc="Continuez vos formations en cours."
                cta="Voir mes formations"
                href="#"
                onClick={() => setTab(0)}
              />
            ) : (
              <div className="space-y-4">
                {termines.map(e => <CourseCard key={e.id} enrollment={e} />)}
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATS */}
        {tab === 2 && (
          <div>
            {certificates.length === 0 ? (
              <EmptyState
                icon={<Award size={40} />}
                title="Aucun certificat obtenu"
                desc="Terminez une formation à 100% pour obtenir votre certificat."
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
                  {certificates.map(cert => <CertCard key={cert.id} cert={cert} />)}
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
// COURSE CARD — bouton dynamique + vraie progression
// ============================================================
function CourseCard({ enrollment }: { enrollment: any }) {
  const course = enrollment.courses
  if (!course) return null

  const prog = enrollment.realProgression || 0
  const isTermine = prog >= 100

  // ✅ Bouton dynamique selon la progression
  const btnLabel = isTermine ? 'Revoir' : prog === 0 ? 'Commencer' : 'Continuer'
  const btnIcon  = isTermine ? <CheckCircle size={14} /> : <Play size={14} />

  return (
    <div className="card p-5 group">
      <div className="flex gap-4 flex-wrap">
        {/* Image de couverture responsive */}
        <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)' }}>
          {course.image_couverture ? (
            <img
              src={course.image_couverture}
              alt={course.titre}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <span className="text-3xl">📚</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
            <div>
              <span className="text-xs font-mono" style={{ color: 'var(--orange)' }}>
                {course.secteur_slug?.replace(/-/g, ' ').toUpperCase()}
              </span>
              <h3 className="font-bold text-base group-hover:text-orange-500 transition-colors"
                style={{ color: 'var(--text-primary)' }}>
                {course.titre}
              </h3>
            </div>
            <span className={`badge text-[10px] flex-shrink-0 ${isTermine ? 'badge-safe' : 'badge-info'}`}>
              {isTermine ? '✓ Terminé' : 'En cours'}
            </span>
          </div>

          <p className="text-sm mb-3 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {course.description_courte}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-32">
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {prog}% terminé
                  {enrollment.lessonsTotal > 0 && (
                    <> · {enrollment.lessonsDone}/{enrollment.lessonsTotal} leçons</>
                  )}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${prog}%`,
                    background: isTermine
                      ? 'var(--safe)'
                      : 'linear-gradient(90deg, var(--orange), var(--warn))'
                  }} />
              </div>
            </div>

            <Link
              href={`/cours/${course.slug}`}
              className="btn-primary py-2 px-4 text-xs flex-shrink-0">
              {btnIcon}{btnLabel}<ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// CERTIFICAT CARD
// ============================================================
function CertCard({ cert }: any) {
  return (
    <div className="card overflow-hidden group">
      <div className="h-44 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
            style={{ background: 'rgba(255,215,0,0.15)', border: '2px solid rgba(255,215,0,0.4)' }}>
            <Award size={32} style={{ color: '#FFD700' }} />
          </div>
          <div className="text-white/50 text-xs font-mono">{cert.numero_certificat}</div>
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
          <button className="flex-1 btn-secondary py-1.5 text-xs justify-center">
            Télécharger
          </button>
          <button className="flex-1 btn-primary py-1.5 text-xs justify-center">
            Partager
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ icon, title, desc, cta, href, onClick }: any) {
  return (
    <div className="card p-12 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-4"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
        {desc}
      </p>
      {onClick
        ? <button onClick={onClick} className="btn-primary py-2.5 px-6">{cta}</button>
        : <Link href={href} className="btn-primary py-2.5 px-6">{cta}</Link>
      }
    </div>
  )
}

// ============================================================
// SUGGESTIONS
// ============================================================
function SuggestedCourses({ enrolled }: { enrolled: string[] }) {
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    supabase.from('courses')
      .select('*')
      .eq('statut', 'published')
      .limit(6)
      .then(({ data }) => {
        setCourses((data || []).filter(c => !enrolled.includes(c.id)).slice(0, 3))
      })
  }, [])

  if (courses.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} style={{ color: 'var(--orange)' }} />
        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
          Formations recommandées
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Link key={c.id} href={`/cours/${c.slug}`}
            className="card p-4 group hover:no-underline">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
              style={{ background: 'var(--bg-secondary)' }}>
              {c.image_couverture
                ? <img src={c.image_couverture} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : <span className="text-2xl">📚</span>}
            </div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-orange-500 transition-colors"
              style={{ color: 'var(--text-primary)' }}>
              {c.titre}
            </h3>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {c.description_courte}
            </p>
            <div className="flex items-center justify-between">
              <span className="badge badge-safe text-[10px]">
                {c.est_gratuit ? 'Gratuit' : `${c.prix_acces} FCFA`}
              </span>
              {c.est_certifiant && (
                <span className="badge badge-orange text-[10px]">
                  <Award size={9} className="mr-0.5" />Certifiant
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
