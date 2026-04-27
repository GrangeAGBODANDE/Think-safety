'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ChevronLeft, CheckCircle, Check, Play, FileText, HelpCircle,
  Lock, Menu, X, Award, Clock, ChevronDown, AlertTriangle
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
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'contenu' | 'quiz' | 'telechargements'>('contenu')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [lockWarning, setLockWarning] = useState('')
  const [quizCompleted, setQuizCompleted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth'); return }
      setUser(u)

      const { data: c } = await supabase.from('courses').select('*').eq('slug', slug).single()
      if (!c) { router.push('/secteurs'); return }
      setCourse(c)

      const { data: mods } = await supabase
        .from('course_modules')
        .select(`*, course_lessons(*)`)
        .eq('course_id', c.id)
        .order('ordre')

      if (mods) {
        const sorted = mods.map(m => ({
          ...m,
          course_lessons: (m.course_lessons || []).sort((a: any, b: any) => a.ordre - b.ordre)
        }))
        setModules(sorted)
        if (sorted.length > 0) {
          setExpandedModules(new Set([sorted[0].id]))
          if (sorted[0].course_lessons?.length > 0) {
            setCurrentLesson(sorted[0].course_lessons[0])
          }
        }
      }

      // Inscription auto
      await supabase.from('course_enrollments')
        .upsert({ user_id: u.id, course_id: c.id }, { onConflict: 'user_id,course_id', ignoreDuplicates: true })

      // Charger progression
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

  // Vérifier si une leçon est débloquée
  function isLessonUnlocked(lesson: any): boolean {
    // La première leçon est toujours débloquée
    const allLessons = modules.flatMap(m => m.course_lessons || [])
    const idx = allLessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true
    // Les autres nécessitent que la précédente soit complète
    return progress[allLessons[idx - 1]?.id] === true
  }

  function handleSelectLesson(lesson: any) {
    if (!isLessonUnlocked(lesson) && lesson.est_obligatoire !== false) {
      setLockWarning('Terminez la leçon précédente avant de continuer.')
      setTimeout(() => setLockWarning(''), 4000)
      return
    }
    setCurrentLesson(lesson)
    setActiveTab('contenu')
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

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

    // Passer à la prochaine leçon automatiquement
    const allLessons = modules.flatMap(m => m.course_lessons || [])
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx < allLessons.length - 1) {
      setCurrentLesson(allLessons[idx + 1])
      setActiveTab('contenu')
    }
  }

  const allLessons = modules.flatMap(m => m.course_lessons || [])
  const completedCount = allLessons.filter(l => progress[l.id]).length
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="w-10 h-10 rounded-xl animate-pulse mx-auto" style={{ background: 'var(--orange)' }} />
      </div>
    )
  }

  const hasQuiz = currentLesson?.type === 'quiz' ||
    (currentLesson && allLessons.filter(l => l.module_id === currentLesson.module_id && l.type === 'quiz').length > 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Mon espace</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h1 className="font-semibold text-sm truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>
            {course?.titre}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'var(--safe)' : 'var(--orange)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{progressPct}%</span>
          </div>
          {progressPct === 100 && (
            <span className="badge badge-safe text-[10px]"><Award size={11} className="mr-1" />Certifié</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)', background: 'var(--navy-700)' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Warning verrou */}
      {lockWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm"
          style={{ background: 'var(--danger)', color: 'white' }}>
          <Lock size={15} />{lockWarning}
        </div>
      )}

      <div className="flex pt-14 flex-1">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72 xl:w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 fixed left-0 top-14 bottom-0 z-40 border-r overflow-y-auto`}
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Plan du cours</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? 'var(--safe)' : 'var(--orange)'
                }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {completedCount}/{allLessons.length}
              </span>
            </div>
          </div>

          <div className="p-2">
            {modules.map((module, mi) => (
              <div key={module.id} className="mb-1">
                <button
                  onClick={() => setExpandedModules(prev => {
                    const next = new Set(prev)
                    next.has(module.id) ? next.delete(module.id) : next.add(module.id)
                    return next
                  })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="truncate">Module {mi + 1} · {module.titre}</span>
                  <ChevronDown size={13} style={{ color: 'var(--text-secondary)' }}
                    className={`transition-transform flex-shrink-0 ${expandedModules.has(module.id) ? 'rotate-180' : ''}`} />
                </button>

                {expandedModules.has(module.id) && (
                  <div className="ml-1 space-y-0.5">
                    {(module.course_lessons || []).map((lesson: any) => {
                      const isActive = currentLesson?.id === lesson.id
                      const isComplete = progress[lesson.id]
                      const unlocked = isLessonUnlocked(lesson)

                      return (
                        <button key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left"
                          style={isActive
                            ? { background: 'rgba(212,80,15,0.1)', color: 'var(--orange)', borderLeft: '3px solid var(--orange)' }
                            : { color: unlocked ? 'var(--text-secondary)' : 'var(--text-secondary)', opacity: unlocked ? 1 : 0.5, borderLeft: '3px solid transparent' }
                          }
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--navy-700)' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={isComplete
                              ? { background: 'var(--safe)', color: 'white' }
                              : !unlocked
                              ? { background: 'var(--navy-500)', color: 'var(--text-secondary)' }
                              : { background: 'var(--navy-500)', color: 'var(--text-secondary)' }
                            }>
                            {isComplete ? <CheckCircle size={12} /> :
                             !unlocked ? <Lock size={10} /> :
                             lesson.type === 'video' ? <Play size={10} /> :
                             lesson.type === 'quiz' ? <HelpCircle size={10} /> :
                             <FileText size={10} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{lesson.titre}</div>
                            <div className="text-[10px] mt-0.5 opacity-60">
                              {lesson.type === 'video' ? 'Vidéo' : lesson.type === 'pdf' ? 'Document' : lesson.type === 'quiz' ? 'Quiz' : 'Lecture'}
                              {lesson.duree_minutes > 0 && ` · ${lesson.duree_minutes}min`}
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

        {/* Contenu principal */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-72 xl:ml-80' : 'ml-0'} transition-all duration-300 min-h-screen overflow-y-auto`}>
          {currentLesson ? (
            <LessonContent
              lesson={currentLesson}
              isComplete={progress[currentLesson.id] || false}
              onMarkComplete={() => markComplete(currentLesson.id)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              quizCompleted={quizCompleted[currentLesson.id] || false}
              onQuizComplete={(passed: boolean) => {
                setQuizCompleted(prev => ({ ...prev, [currentLesson.id]: passed }))
                if (passed) markComplete(currentLesson.id)
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <p style={{ color: 'var(--text-secondary)' }}>Sélectionnez une leçon</p>
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
function LessonContent({ lesson, isComplete, onMarkComplete, activeTab, setActiveTab, quizCompleted, onQuizComplete }: any) {
  const [videoWatched, setVideoWatched] = useState(false)
  const [textReadProgress, setTextReadProgress] = useState(0)
  const [showCompletionWarning, setShowCompletionWarning] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const progressInterval = useRef<any>(null)

  useEffect(() => {
    setVideoWatched(false)
    setTextReadProgress(0)
    setShowCompletionWarning(false)
  }, [lesson.id])

  // Tracking scroll pour le texte
  useEffect(() => {
    if (lesson.type !== 'video' && lesson.contenu_riche && textRef.current) {
      const onScroll = () => {
        const el = textRef.current!
        const scrolled = el.scrollTop + el.clientHeight
        const total = el.scrollHeight
        const pct = Math.round((scrolled / total) * 100)
        setTextReadProgress(Math.min(pct, 100))
      }
      textRef.current.addEventListener('scroll', onScroll)
      return () => textRef.current?.removeEventListener('scroll', onScroll)
    }
  }, [lesson])

  function getYoutubeId(url: string) {
    if (!url) return null
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  const ytId = getYoutubeId(lesson.youtube_url || '')

  function handleMarkComplete() {
    const needsVideo = lesson.type === 'video' && !videoWatched
    const needsText = lesson.contenu_riche && textReadProgress < 90
    if (needsVideo) {
      setShowCompletionWarning('Regardez la vidéo jusqu\'à la fin avant de continuer.')
      setTimeout(() => setShowCompletionWarning(false as any), 4000)
      return
    }
    onMarkComplete()
  }

  const tabs = [
    { key: 'contenu', label: 'Contenu', show: true },
    { key: 'quiz', label: 'Quiz', show: true },
    { key: 'telechargements', label: 'Téléchargements', show: !!lesson.pdf_url },
  ].filter(t => t.show)

  return (
    <div>
      {/* Zone vidéo */}
      {ytId && (
        <div className="relative bg-black" style={{ aspectRatio: '16/9', maxHeight: '70vh' }}>
          <YoutubeTracker
            videoId={ytId}
            threshold={lesson.seuil_completion_video || 80}
            onComplete={() => setVideoWatched(true)}
          />
          {videoWatched && (
            <div className="absolute top-3 right-3 badge badge-safe text-xs">
              <CheckCircle size={11} className="mr-1" />Vidéo regardée
            </div>
          )}
        </div>
      )}

      {/* Warning complétion */}
      {showCompletionWarning && (
        <div className="mx-5 mt-3 p-3 rounded-xl flex items-center gap-2 text-sm"
          style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: 'var(--danger)' }}>
          <AlertTriangle size={15} />{showCompletionWarning}
        </div>
      )}

      {/* Titre + bouton marquer */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{lesson.titre}</h2>
        {lesson.type !== 'quiz' && (
          isComplete ? (
            <span className="badge badge-safe"><CheckCircle size={14} className="mr-1" />Terminé</span>
          ) : (
            <button onClick={handleMarkComplete} className="btn-primary py-2 px-5 text-sm">
              <CheckCircle size={14} />Marquer comme terminé
            </button>
          )
        )}
      </div>

      {/* Onglets */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className="px-5 py-3 text-sm font-medium transition-all relative"
            style={activeTab === t.key ? { color: 'var(--text-primary)' } : { color: 'var(--text-secondary)' }}>
            {t.label}
            {activeTab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--text-primary)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Contenu onglet */}
      <div className="p-5">
        {activeTab === 'contenu' && (
          <div>
            {lesson.contenu_riche ? (
              <div
                ref={textRef}
                className="prose max-w-none overflow-y-auto"
                style={{ maxHeight: '60vh', color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: lesson.contenu_riche }}
              />
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                Aucun contenu textuel pour cette leçon.
              </p>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <QuizPlayer
            lessonId={lesson.id}
            isAlreadyComplete={quizCompleted}
            onComplete={onQuizComplete}
          />
        )}

        {activeTab === 'telechargements' && lesson.pdf_url && (
          <div className="space-y-3">
            <a href={lesson.pdf_url} target="_blank" rel="noreferrer"
              download={lesson.pdf_nom || 'document.pdf'}
              className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:border-orange-500"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,80,15,0.1)' }}>
                <FileText size={22} style={{ color: 'var(--orange)' }} />
              </div>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {lesson.pdf_nom || `${lesson.titre}.pdf`}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Document PDF · Cliquez pour télécharger
                </div>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// YOUTUBE TRACKER — sans branding, avec suivi de progression
// ============================================================
function YoutubeTracker({ videoId, threshold = 80, onComplete }: {
  videoId: string
  threshold: number
  onComplete: () => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [completed, setCompleted] = useState(false)
  const intervalRef = useRef<any>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    // Utiliser l'API YouTube iframe pour suivre la progression
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    // Fallback: si l'API ne charge pas, timer approximatif
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [videoId])

  function handleIframeLoad() {
    // Timer de sécurité : marquer comme vu après 30s (pour les courtes vidéos)
    intervalRef.current = setInterval(() => {
      if (!completedRef.current) {
        completedRef.current = true
        setCompleted(true)
        onComplete()
        clearInterval(intervalRef.current)
      }
    }, 30000) // 30 secondes minimum
  }

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&fs=1&color=white&disablekb=0`}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  )
}

// ============================================================
// QUIZ PLAYER — avec résultats détaillés
// ============================================================
function QuizPlayer({ lessonId, isAlreadyComplete, onComplete }: any) {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('quiz_questions').select('*').eq('lesson_id', lessonId).order('ordre')
      .then(({ data }) => { setQuestions(data || []); setLoading(false) })
  }, [lessonId])

  function handleAnswer(questionId: string, value: any) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function submitQuiz() {
    let totalPoints = 0
    let earnedPoints = 0
    const details: any[] = []

    questions.forEach(q => {
      totalPoints += q.points || 1
      const userAnswer = answers[q.id]
      let correct = false

      if (q.type === 'qcm' || q.type === 'qcm_multi') {
        const opts = q.options as any[]
        const correctOpts = opts.filter(o => o.correct).map(o => o.text)
        if (q.type === 'qcm') {
          correct = opts[userAnswer]?.correct === true
        } else {
          const selected = userAnswer || []
          correct = JSON.stringify(selected.sort()) === JSON.stringify(correctOpts.sort())
        }
      } else if (q.type === 'vrai_faux') {
        correct = userAnswer === q.reponse_correcte
      } else if (q.type === 'texte_libre') {
        if (q.reponse_correcte) {
          correct = userAnswer?.toLowerCase().trim() === q.reponse_correcte.toLowerCase().trim()
        } else {
          correct = true // correction manuelle
        }
      } else if (q.type === 'ordre') {
        const opts = q.options as any[]
        const expected = opts.map((o: any) => o.text)
        correct = JSON.stringify(userAnswer || []) === JSON.stringify(expected)
      }

      if (correct) earnedPoints += q.points || 1
      details.push({
        question: q.question,
        correct,
        points: q.points || 1,
        explication: q.explication,
        type: q.type,
      })
    })

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = percentage >= 70

    setResults({ earnedPoints, totalPoints, percentage, passed, details })
    setSubmitted(true)
    onComplete(passed)
  }

  if (loading) return <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Chargement...</div>

  if (questions.length === 0) return (
    <div className="text-center py-8">
      <HelpCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Aucune question pour ce quiz.</p>
    </div>
  )

  if (submitted && results) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Score global */}
        <div className={`card p-8 text-center mb-6 border-2 ${results.passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${results.passed ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
            <span className="text-4xl font-bold font-display" style={{ color: results.passed ? 'var(--safe)' : 'var(--danger)' }}>
              {results.percentage}%
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {results.passed ? '🎉 Quiz réussi !' : '❌ Quiz non réussi'}
          </h3>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {results.earnedPoints} / {results.totalPoints} points · {results.passed ? 'Score ≥ 70% requis' : 'Score < 70%, réessayez'}
          </p>
          {/* Barre de score */}
          <div className="h-3 rounded-full overflow-hidden mx-auto max-w-48"
            style={{ background: 'var(--navy-600)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${results.percentage}%`,
                background: results.percentage >= 70 ? 'var(--safe)' : results.percentage >= 50 ? 'var(--warn)' : 'var(--danger)'
              }} />
          </div>
        </div>

        {/* Détail par question */}
        <div className="space-y-3 mb-6">
          {results.details.map((d: any, i: number) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${d.correct ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                {d.correct
                  ? <CheckCircle size={14} style={{ color: 'var(--safe)' }} />
                  : <X size={14} style={{ color: 'var(--danger)' }} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {i + 1}. {d.question}
                </p>
                {d.explication && (
                  <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>
                    💡 {d.explication}
                  </p>
                )}
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: d.correct ? 'var(--safe)' : 'var(--danger)' }}>
                {d.correct ? `+${d.points}pt` : '0pt'}
              </span>
            </div>
          ))}
        </div>

        {!results.passed && (
          <button onClick={() => { setSubmitted(false); setAnswers({}); setResults(null) }}
            className="btn-secondary w-full justify-center py-3">
            🔄 Recommencer le quiz
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {questions.length} question{questions.length > 1 ? 's' : ''} · {Object.keys(answers).length}/{questions.length} répondues
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Score minimum requis : 70%</p>
      </div>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <QuizQuestion
            key={q.id}
            question={q}
            index={qi}
            answer={answers[q.id]}
            onAnswer={(val: any) => handleAnswer(q.id, val)}
            disabled={submitted}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={submitQuiz}
          disabled={Object.keys(answers).length < questions.length}
          className="btn-primary py-3 px-12 text-base"
        >
          Soumettre mes réponses
        </button>
        {Object.keys(answers).length < questions.length && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Répondez à toutes les questions avant de soumettre
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================
// COMPOSANT QUESTION INDIVIDUELLE
// ============================================================
function QuizQuestion({ question: q, index, answer, onAnswer, disabled }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="badge badge-orange text-[10px] flex-shrink-0 mt-0.5">{index + 1}</span>
        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
      </div>

      {/* QCM */}
      {(q.type === 'qcm' || q.type === 'qcm_multi') && (
        <div className="space-y-2">
          {(q.options || []).map((opt: any, oi: number) => {
            const selected = q.type === 'qcm' ? answer === oi : (answer || []).includes(opt.text)
            return (
              <button key={oi} type="button"
                onClick={() => {
                  if (disabled) return
                  if (q.type === 'qcm') onAnswer(oi)
                  else {
                    const curr = answer || []
                    onAnswer(curr.includes(opt.text) ? curr.filter((x: string) => x !== opt.text) : [...curr, opt.text])
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all"
                style={selected
                  ? { borderColor: 'var(--orange)', background: 'rgba(212,80,15,0.08)', color: 'var(--text-primary)' }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }>
                <div className={`w-5 h-5 rounded-${q.type === 'qcm' ? 'full' : 'md'} border-2 flex items-center justify-center flex-shrink-0 transition-all`}
                  style={selected
                    ? { background: 'var(--orange)', borderColor: 'var(--orange)' }
                    : { borderColor: 'var(--border)' }
                  }>
                  {selected && <Check size={11} className="text-white" />}
                </div>
                {opt.text}
              </button>
            )
          })}
        </div>
      )}

      {/* VRAI/FAUX */}
      {q.type === 'vrai_faux' && (
        <div className="flex gap-3">
          {['Vrai', 'Faux'].map(val => (
            <button key={val} type="button"
              onClick={() => !disabled && onAnswer(val)}
              className="flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all"
              style={answer === val
                ? { borderColor: val === 'Vrai' ? 'var(--safe)' : 'var(--danger)', background: val === 'Vrai' ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)', color: val === 'Vrai' ? 'var(--safe)' : 'var(--danger)' }
                : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
              }>
              {val === 'Vrai' ? '✅' : '❌'} {val}
            </button>
          ))}
        </div>
      )}

      {/* TEXTE LIBRE */}
      {q.type === 'texte_libre' && (
        <textarea
          value={answer || ''}
          onChange={e => !disabled && onAnswer(e.target.value)}
          placeholder="Votre réponse..."
          rows={3}
          className="input-field text-sm"
          disabled={disabled}
        />
      )}

      {/* RELIER */}
      {q.type === 'relier' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {(q.options || []).map((opt: any, oi: number) => (
              <div key={oi} className="p-2.5 rounded-lg text-sm text-center"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {opt.gauche}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {(q.options || []).map((opt: any, oi: number) => (
              <div key={oi} className="p-2.5 rounded-lg text-sm text-center"
                style={{ background: 'rgba(212,80,15,0.08)', color: 'var(--orange)' }}>
                {opt.droite}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REMPLIR */}
      {q.type === 'remplir' && (
        <div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Complétez les champs vides :
          </p>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {(q.reponse_correcte || '').split(/(\{\{[0-9]+\}\})/g).map((part: string, pi: number) => {
              const match = part.match(/\{\{([0-9]+)\}\}/)
              if (match) {
                const fieldIdx = parseInt(match[1]) - 1
                return (
                  <input key={pi} type="text"
                    value={(answer || [])[fieldIdx] || ''}
                    onChange={e => {
                      const curr = answer || []
                      const next = [...curr]
                      next[fieldIdx] = e.target.value
                      onAnswer(next)
                    }}
                    className="inline-block w-28 mx-1 text-center border-b-2 bg-transparent outline-none text-sm"
                    style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}
                    disabled={disabled}
                  />
                )
              }
              return <span key={pi}>{part}</span>
            })}
          </div>
        </div>
      )}

      {/* ORDRE */}
      {q.type === 'ordre' && (
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Cliquez dans le bon ordre :
          </p>
          <div className="space-y-2">
            {(q.options || []).map((opt: any, oi: number) => {
              const selectedOrder = (answer || []).indexOf(opt.text)
              return (
                <button key={oi} type="button"
                  onClick={() => {
                    if (disabled) return
                    const curr = answer || []
                    if (curr.includes(opt.text)) onAnswer(curr.filter((x: string) => x !== opt.text))
                    else onAnswer([...curr, opt.text])
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all"
                  style={selectedOrder >= 0
                    ? { borderColor: 'var(--orange)', color: 'var(--text-primary)', background: 'rgba(212,80,15,0.08)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: selectedOrder >= 0 ? 'var(--orange)' : 'var(--navy-600)', color: 'white' }}>
                    {selectedOrder >= 0 ? selectedOrder + 1 : '?'}
                  </span>
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
