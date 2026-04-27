'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ChevronLeft, ChevronRight, CheckCircle, Play,
  FileText, HelpCircle, Lock, Menu, X,
  Award, Clock, ChevronDown
} from 'lucide-react'

export default function CoursePlayerPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'transcription' | 'notes' | 'telechargements'>('transcription')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth'); return }
      setUser(u)

      // Charger le cours
      const { data: c } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('statut', 'published')
        .single()

      if (!c) { router.push('/secteurs'); return }
      setCourse(c)

      // Charger modules + leçons
      const { data: mods } = await supabase
        .from('course_modules')
        .select(`*, course_lessons(*)`)
        .eq('course_id', c.id)
        .order('ordre')

      if (mods) {
        const sortedMods = mods.map(m => ({
          ...m,
          course_lessons: (m.course_lessons || []).sort((a: any, b: any) => a.ordre - b.ordre)
        }))
        setModules(sortedMods)
        // Expander le premier module
        if (sortedMods.length > 0) {
          setExpandedModules(new Set([sortedMods[0].id]))
          // Ouvrir la première leçon
          if (sortedMods[0].course_lessons?.length > 0) {
            setCurrentLesson(sortedMods[0].course_lessons[0])
          }
        }
      }

      // Vérifier inscription
      const { data: enr } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', u.id)
        .eq('course_id', c.id)
        .single()

      if (!enr) {
        // Auto-inscription
        const { data: newEnr } = await supabase
          .from('course_enrollments')
          .insert({ user_id: u.id, course_id: c.id })
          .select()
          .single()
        setEnrollment(newEnr)
      } else {
        setEnrollment(enr)
      }

      // Charger la progression
      const { data: prog } = await supabase
        .from('lesson_progress')
        .select('lesson_id, est_complete')
        .eq('user_id', u.id)
        .eq('course_id', c.id)

      const progMap: Record<string, boolean> = {}
      prog?.forEach(p => { progMap[p.lesson_id] = p.est_complete })
      setProgress(progMap)

      setLoading(false)
    }
    load()
  }, [slug, router])

  // Marquer une leçon comme complète
  async function markComplete(lessonId: string) {
    if (!user || !course) return
    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: course.id,
      est_complete: true,
      date_completion: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' })

    setProgress(prev => ({ ...prev, [lessonId]: true }))

    // Passer à la leçon suivante
    const allLessons = modules.flatMap(m => m.course_lessons || [])
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx < allLessons.length - 1) {
      setCurrentLesson(allLessons[idx + 1])
    }
  }

  function toggleModule(moduleId: string) {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  function getLessonIcon(type: string) {
    if (type === 'video') return <Play size={13} />
    if (type === 'pdf') return <FileText size={13} />
    if (type === 'quiz') return <HelpCircle size={13} />
    return <FileText size={13} />
  }

  // Compter progression
  const allLessons = modules.flatMap(m => m.course_lessons || [])
  const completedCount = allLessons.filter(l => progress[l.id]).length
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl animate-pulse mx-auto mb-3" style={{ background: 'var(--orange)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Chargement du cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>

      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Mon espace</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h1 className="font-semibold text-sm truncate max-w-64" style={{ color: 'var(--text-primary)' }}>
            {course?.titre}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Progression globale */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${progressPct}%`,
                background: progressPct === 100 ? 'var(--safe)' : 'var(--orange)'
              }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {progressPct}%
            </span>
          </div>

          {progressPct === 100 && (
            <span className="badge badge-safe text-[10px]">
              <Award size={11} className="mr-1" />Certifié
            </span>
          )}

          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)', background: 'var(--navy-700)' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Layout principal */}
      <div className="flex pt-14 flex-1">

        {/* SIDEBAR - Plan du cours */}
        <aside className={`${sidebarOpen ? 'w-72 xl:w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 overflow-hidden fixed left-0 top-14 bottom-0 z-40 border-r overflow-y-auto`}
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Plan du cours</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {completedCount}/{allLessons.length} leçons · {progressPct}% terminé
            </p>
          </div>

          <div className="p-2">
            {modules.map((module, mi) => (
              <div key={module.id} className="mb-1">
                {/* Header module */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>Module {mi + 1} · {module.titre}</span>
                  <ChevronDown size={14}
                    className={`transition-transform flex-shrink-0 ${expandedModules.has(module.id) ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Leçons */}
                {expandedModules.has(module.id) && (
                  <div className="ml-2 space-y-0.5">
                    {(module.course_lessons || []).map((lesson: any) => {
                      const isActive = currentLesson?.id === lesson.id
                      const isComplete = progress[lesson.id]
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setCurrentLesson(lesson); if (window.innerWidth < 768) setSidebarOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left group"
                          style={isActive
                            ? { background: 'rgba(212,80,15,0.1)', color: 'var(--orange)', borderLeft: '3px solid var(--orange)' }
                            : { color: 'var(--text-secondary)', borderLeft: '3px solid transparent' }
                          }
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--navy-700)' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={isComplete
                              ? { background: 'var(--safe)', color: 'white' }
                              : { background: 'var(--navy-500)', color: 'var(--text-secondary)' }
                            }>
                            {isComplete ? <CheckCircle size={12} /> : getLessonIcon(lesson.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{lesson.titre}</div>
                            <div className="flex items-center gap-1 mt-0.5 opacity-70">
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {lesson.type === 'video' ? 'Vidéo' : lesson.type === 'pdf' ? 'Lecture' : 'Quiz'}
                              </span>
                              {lesson.duree_minutes > 0 && (
                                <span style={{ color: 'var(--text-secondary)' }}>· {lesson.duree_minutes} min</span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72 xl:ml-80' : 'ml-0'} overflow-y-auto`}>
          {currentLesson ? (
            <LessonViewer
              lesson={currentLesson}
              isComplete={progress[currentLesson.id] || false}
              onMarkComplete={() => markComplete(currentLesson.id)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              course={course}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <BookOpenIcon />
                <p style={{ color: 'var(--text-secondary)' }}>Sélectionnez une leçon pour commencer</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ============================================================
// LECTEUR DE LEÇON
// ============================================================
function LessonViewer({ lesson, isComplete, onMarkComplete, activeTab, setActiveTab, course }: any) {

  // Extraire l'ID YouTube
  function getYoutubeId(url: string) {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const youtubeId = lesson.type === 'video' ? getYoutubeId(lesson.youtube_url || lesson.video_url) : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Zone de contenu */}
      {lesson.type === 'video' && youtubeId && (
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={lesson.titre}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {lesson.type === 'pdf' && lesson.pdf_url && (
        <div className="bg-black" style={{ height: '70vh' }}>
          <iframe src={lesson.pdf_url} className="w-full h-full" title={lesson.titre} />
        </div>
      )}

      {lesson.type === 'quiz' && (
        <div className="p-6" style={{ background: 'var(--bg-secondary)' }}>
          <QuizViewer lesson={lesson} onComplete={onMarkComplete} isComplete={isComplete} />
        </div>
      )}

      {/* Infos leçon */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {lesson.titre}
            </h2>
            {lesson.type === 'video' && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Traduit automatiquement de Français
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <span className="badge badge-safe text-sm px-4 py-1.5">
                <CheckCircle size={14} className="mr-1.5" />Vue
              </span>
            ) : (
              <button onClick={onMarkComplete} className="btn-primary py-2 px-5 text-sm">
                <CheckCircle size={15} />Marquer comme vu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b flex" style={{ borderColor: 'var(--border)' }}>
        {(['transcription', 'notes', 'telechargements'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-3 text-sm font-medium capitalize transition-all relative"
            style={activeTab === t ? { color: 'var(--text-primary)' } : { color: 'var(--text-secondary)' }}>
            {t === 'transcription' ? 'Transcription' : t === 'notes' ? 'Notes Personnelles' : 'Téléchargements'}
            {activeTab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--text-primary)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Contenu onglet */}
      <div className="p-5">
        {activeTab === 'transcription' && (
          <div>
            {lesson.contenu_texte ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {lesson.contenu_texte}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                Aucune transcription disponible pour cette leçon.
              </p>
            )}
          </div>
        )}
        {activeTab === 'notes' && (
          <NotesEditor lessonId={lesson.id} />
        )}
        {activeTab === 'telechargements' && (
          <div>
            {lesson.pdf_url ? (
              <a href={lesson.pdf_url} download
                className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-orange-500"
                style={{ borderColor: 'var(--border)' }}>
                <FileText size={18} style={{ color: 'var(--orange)' }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {lesson.titre}.pdf
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Document PDF</div>
                </div>
              </a>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                Aucun fichier disponible pour cette leçon.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// QUIZ VIEWER
// ============================================================
function QuizViewer({ lesson, onComplete, isComplete }: any) {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    supabase.from('quiz_questions').select('*').eq('lesson_id', lesson.id).order('ordre')
      .then(({ data }) => setQuestions(data || []))
  }, [lesson.id])

  function handleAnswer(questionId: string, optionIndex: number) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  function handleSubmit() {
    let correct = 0
    questions.forEach(q => {
      const opts = q.options as any[]
      const selectedIdx = answers[q.id]
      if (selectedIdx !== undefined && opts[selectedIdx]?.correct) correct++
    })
    setScore(correct)
    setSubmitted(true)
    if (correct / questions.length >= 0.7) onComplete()
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <HelpCircle size={40} style={{ color: 'var(--text-secondary)' }} className="mx-auto mb-3" />
        <p style={{ color: 'var(--text-secondary)' }}>Aucune question disponible</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(212,80,15,0.15)' }}>
          <HelpCircle size={28} style={{ color: 'var(--orange)' }} />
        </div>
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{lesson.titre}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {questions.length} question{questions.length > 1 ? 's' : ''}
        </p>
      </div>

      {submitted ? (
        <div className="card p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score / questions.length >= 0.7 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {score / questions.length >= 0.7
              ? <CheckCircle size={40} style={{ color: 'var(--safe)' }} />
              : <HelpCircle size={40} style={{ color: 'var(--danger)' }} />
            }
          </div>
          <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {score}/{questions.length}
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {score / questions.length >= 0.7 ? '✅ Quiz réussi ! Leçon validée.' : '❌ Score insuffisant (70% requis). Réessayez.'}
          </p>
          {score / questions.length < 0.7 && (
            <button onClick={() => { setSubmitted(false); setAnswers({}) }} className="btn-secondary py-2 px-6">
              Réessayer
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, qi) => {
            const opts = q.options as any[]
            return (
              <div key={q.id} className="card p-5">
                <p className="font-medium mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="badge badge-orange text-[10px] mr-2">{qi + 1}</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {opts?.map((opt, oi) => (
                    <button key={oi} onClick={() => handleAnswer(q.id, oi)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all"
                      style={answers[q.id] === oi
                        ? { borderColor: 'var(--orange)', background: 'rgba(212,80,15,0.08)', color: 'var(--text-primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                      }>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${answers[q.id] === oi ? 'border-orange-500' : 'border-gray-500'}`}>
                        {answers[q.id] === oi && <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--orange)' }} />}
                      </div>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          <div className="text-center pt-2">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="btn-primary py-3 px-10"
            >
              Soumettre les réponses
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// NOTES EDITOR
// ============================================================
function NotesEditor({ lessonId }: { lessonId: string }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <textarea
        value={note}
        onChange={e => { setNote(e.target.value); setSaved(false) }}
        placeholder="Prenez des notes sur cette leçon..."
        className="input-field text-sm"
        rows={8}
        style={{ resize: 'vertical' }}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {saved ? '✅ Note enregistrée' : ''}
        </span>
        <button
          onClick={() => { localStorage.setItem(`note_${lessonId}`, note); setSaved(true) }}
          className="btn-primary py-1.5 px-4 text-xs"
        >
          Enregistrer la note
        </button>
      </div>
    </div>
  )
}

function BookOpenIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{ background: 'var(--bg-secondary)' }}>
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
        style={{ color: 'var(--text-secondary)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    </div>
  )
}
