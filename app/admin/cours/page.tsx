'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  BookOpen, Plus, Users, Play, FileText,
  Edit, Trash2, Eye, EyeOff, BarChart2,
  CheckCircle, Clock, Award
} from 'lucide-react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, published: 0, students: 0, completions: 0 })
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    // Compter les inscrits par cours
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, statut')

    const enrollMap: Record<string, number> = {}
    const completeMap: Record<string, number> = {}
    enrollments?.forEach(e => {
      enrollMap[e.course_id] = (enrollMap[e.course_id] || 0) + 1
      if (e.statut === 'termine') completeMap[e.course_id] = (completeMap[e.course_id] || 0) + 1
    })

    const coursesWithStats = (data || []).map(c => ({
      ...c,
      nb_inscrits: enrollMap[c.id] || 0,
      nb_completions: completeMap[c.id] || 0,
    }))

    setCourses(coursesWithStats)
    setStats({
      total: coursesWithStats.length,
      published: coursesWithStats.filter(c => c.statut === 'published').length,
      students: Object.values(enrollMap).reduce((a, b) => a + b, 0),
      completions: Object.values(completeMap).reduce((a, b) => a + b, 0),
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(course: any) {
    const newStatus = course.statut === 'published' ? 'draft' : 'published'
    await supabase.from('courses').update({ statut: newStatus }).eq('id', course.id)
    setMsg(`Cours "${course.titre}" ${newStatus === 'published' ? 'publié' : 'mis en brouillon'} !`)
    setTimeout(() => setMsg(''), 3000)
    load()
  }

  async function deleteCourse(course: any) {
    if (!confirm(`Supprimer "${course.titre}" et tout son contenu ?`)) return
    await supabase.from('courses').delete().eq('id', course.id)
    setMsg(`Cours supprimé.`)
    setTimeout(() => setMsg(''), 3000)
    load()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Gestion des cours
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            {stats.total} cours · {stats.students} apprenants inscrits
          </p>
        </div>
        <Link href="/admin/cours/nouveau" className="btn-primary py-2.5 px-5">
          <Plus size={16} />Nouveau cours
        </Link>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BookOpen, label: 'Total cours', value: stats.total, color: '#2196F3' },
          { icon: Eye, label: 'Publiés', value: stats.published, color: 'var(--safe)' },
          { icon: Users, label: 'Apprenants', value: stats.students, color: 'var(--orange)' },
          { icon: Award, label: 'Certifiés', value: stats.completions, color: 'var(--warn)' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}20` }}>
                  <Icon size={16} style={{ color: s.color }} />
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

      {/* Liste des cours */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Chargement...</div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={48} style={{ color: 'var(--text-secondary)' }} className="mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Aucun cours créé</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Créez votre premier cours pour commencer.
          </p>
          <Link href="/admin/cours/nouveau" className="btn-primary py-2.5 px-6">
            <Plus size={16} />Créer un cours
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden"
                  style={{ background: 'var(--bg-secondary)' }}>
                  {course.image_couverture
                    ? <img src={course.image_couverture} alt="" className="w-full h-full object-cover" />
                    : '📚'}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{course.titre}</h3>
                    <span className={`badge text-[10px] ${course.statut === 'published' ? 'badge-safe' : 'badge-warn'}`}>
                      {course.statut === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    {course.est_certifiant && (
                      <span className="badge badge-orange text-[10px]">Certifiant</span>
                    )}
                  </div>
                  <p className="text-sm mb-3 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                    {course.description_courte || 'Aucune description'}
                  </p>

                  {/* Mini stats */}
                  <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <Users size={12} />{course.nb_inscrits} inscrits
                    </span>
                    <span className="flex items-center gap-1">
                      <Play size={12} />{course.nb_modules || 0} modules · {course.nb_lecons || 0} leçons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{course.duree_totale_minutes || 0} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={12} />{course.nb_completions || 0} certifiés
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/cours/${course.slug}`} target="_blank"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-blue-400 hover:bg-blue-500/10"
                    title="Voir le cours">
                    <Eye size={15} />
                  </Link>
                  <Link href={`/admin/cours/${course.id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--navy-700)]"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Modifier">
                    <Edit size={15} />
                  </Link>
                  <button onClick={() => toggleStatus(course)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${course.statut === 'published' ? 'text-orange-400 hover:bg-orange-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                    title={course.statut === 'published' ? 'Dépublier' : 'Publier'}>
                    {course.statut === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => deleteCourse(course)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                    title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Barre de progression globale */}
              {course.nb_inscrits > 0 && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>Taux de complétion</span>
                    <span>{Math.round((course.nb_completions / course.nb_inscrits) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.round((course.nb_completions / course.nb_inscrits) * 100)}%`,
                      background: 'var(--safe)'
                    }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
