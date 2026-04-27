'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ChevronLeft, CheckCircle, Check, Play, FileText,
  HelpCircle, Lock, Menu, X, Award, ChevronDown, AlertTriangle
} from 'lucide-react'

export default function CoursePlayerPage() {
  const router   = useRouter()
  const params   = useParams()
  const slug     = params?.slug as string

  const [user,           setUser]           = useState<any>(null)
  const [course,         setCourse]         = useState<any>(null)
  const [modules,        setModules]        = useState<any[]>([])
  const [currentLesson,  setCurrentLesson]  = useState<any>(null)
  const [progress,       setProgress]       = useState<Record<string, boolean>>({})
  const [loading,        setLoading]        = useState(true)
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [activeTab,      setActiveTab]      = useState<'contenu' | 'quiz' | 'telechargements'>('contenu')
  const [expandedMods,   setExpandedMods]   = useState<Set<string>>(new Set())
  const [lockMsg,        setLockMsg]        = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth'); return }
      setUser(u)

      const { data: c } = await supabase
        .from('courses').select('*').eq('slug', slug).single()
      if (!c) { router.push('/secteurs'); return }
      setCourse(c)

      const { data: mods } = await supabase
        .from('course_modules')
        .select('*, course_lessons(*)')
        .eq('course_id', c.id)
        .order('ordre')

      const sorted = (mods || []).map(m => ({
        ...m,
        course_lessons: (m.course_lessons || []).sort((a: any, b: any) => a.ordre - b.ordre)
      }))
      setModules(sorted)
      setExpandedMods(new Set(sorted.map(m => m.id)))

      // Inscription auto
      const { data: existingEnroll } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', u.id)
        .eq('course_id', c.id)
        .single()

      if (!existingEnroll) {
        await supabase.from('course_enrollments').insert({
          user_id: u.id,
          course_id: c.id,
          progression: 0,
          statut: 'en_cours',
        })
      }

      // Charger progression depuis DB
      const { data: savedProg } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', u.id)
        .eq('course_id', c.id)
        .eq('est_complete', true)

      const progMap: Record<string, boolean> = {}
      ;(savedProg || []).forEach((p: any) => { progMap[p.lesson_id] = true })
      setProgress(progMap)

      // Ouvrir la première leçon non terminée
      const allL = sorted.flatMap(m => m.course_lessons || [])
      const next = allL.find(l => !progMap[l.id]) || allL[0]
      if (next) setCurrentLesson(next)

      setLoading(false)
    }
    init()
  }, [slug, router])

  function isUnlocked(lesson: any) {
    const all = modules.flatMap(m => m.course_lessons || [])
    const idx = all.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true
    return progress[all[idx - 1]?.id] === true
  }

  function selectLesson(lesson: any) {
    if (!isUnlocked(lesson) && lesson.est_obligatoire !== false) {
      setLockMsg('Terminez la leçon précédente avant de continuer.')
      setTimeout(() => setLockMsg(''), 4000)
      return
    }
    setCurrentLesson(lesson)
    setActiveTab('contenu')
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  async function markComplete(lessonId: string) {
    if (!user || !course) return

    // ✅ Vérifier si la leçon est déjà enregistrée
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single()

    if (existing) {
      // Mettre à jour
      await supabase.from('lesson_progress')
        .update({
          est_complete: true,
          date_completion: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Insérer
      await supabase.from('lesson_progress').insert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: course.id,
        est_complete: true,
        date_completion: new Date().toISOString(),
      })
    }

    // Mettre à jour l'état local
    const newProg = { ...progress, [lessonId]: true }
    setProgress(newProg)

    // Calculer la nouvelle progression globale
    const allL = modules.flatMap(m => m.course_lessons || [])
    const done  = allL.filter(l => newProg[l.id]).length
    const total = allL.length
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0

    // ✅ Mettre à jour course_enrollments
    await supabase.from('course_enrollments')
      .update({
        progression:      pct,
        statut:           pct >= 100 ? 'termine' : 'en_cours',
        date_completion:  pct >= 100 ? new Date().toISOString() : null,
      })
      .eq('user_id', user.id)
      .eq('course_id', course.id)

    // Générer certificat si terminé
    if (pct >= 100) {
      const cert = `TS-${course.id.slice(0,8).toUpperCase()}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`
      const { data: existCert } = await supabase
        .from('course_certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single()
      if (!existCert) {
        await supabase.from('course_certificates').insert({
          user_id: user.id,
          course_id: course.id,
          numero_certificat: cert,
        })
      }
    }

    // Passer à la leçon suivante
    const idx = allL.findIndex(l => l.id === lessonId)
    if (idx < allL.length - 1) {
      setTimeout(() => { setCurrentLesson(allL[idx + 1]); setActiveTab('contenu') }, 400)
    }
  }

  const allLessons     = modules.flatMap(m => m.course_lessons || [])
  const completedCount = allLessons.filter(l => progress[l.id]).length
  const progressPct    = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl animate-pulse mx-auto mb-3" style={{ background: 'var(--orange)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Chargement du cours...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} /><span className="hidden sm:inline">Mon espace</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h1 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {course?.titre}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: progressPct===100 ? 'var(--safe)' : 'var(--orange)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{progressPct}%</span>
          </div>
          {progressPct === 100 && (
            <span className="badge badge-safe text-[10px]"><Award size={11} className="mr-1" />Certifié</span>
          )}
          <button onClick={() => setSidebarOpen(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--navy-700)', color: 'var(--text-secondary)' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {lockMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium"
          style={{ background: 'var(--danger)', color: 'white' }}>
          <Lock size={15} />{lockMsg}
        </div>
      )}

      <div className="flex pt-14 flex-1">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72 xl:w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 fixed left-0 top-14 bottom-0 z-40 border-r overflow-y-auto`}
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Plan du cours</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--navy-600)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width:`${progressPct}%`, background: progressPct===100?'var(--safe)':'var(--orange)' }} />
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                {completedCount}/{allLessons.length}
              </span>
            </div>
          </div>

          <div className="p-2">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="mb-1">
                <button
                  onClick={() => setExpandedMods(prev => {
                    const n = new Set(prev); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n
                  })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--navy-700)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span className="truncate">Module {mi+1} · {mod.titre}</span>
                  <ChevronDown size={13} className={`transition-transform flex-shrink-0 ${expandedMods.has(mod.id)?'rotate-180':''}`}
                    style={{ color: 'var(--text-secondary)' }} />
                </button>

                {expandedMods.has(mod.id) && (
                  <div className="ml-1 space-y-0.5 mt-0.5">
                    {(mod.course_lessons||[]).map((lesson: any) => {
                      const isActive   = currentLesson?.id === lesson.id
                      const isComplete = progress[lesson.id] === true
                      const unlocked   = isUnlocked(lesson)
                      return (
                        <button key={lesson.id} onClick={() => selectLesson(lesson)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left"
                          style={isActive
                            ? { background:'rgba(212,80,15,0.1)', color:'var(--orange)', borderLeft:'3px solid var(--orange)' }
                            : { color:'var(--text-secondary)', opacity: unlocked?1:0.4, borderLeft:'3px solid transparent' }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='var(--navy-700)' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent' }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={isComplete
                              ? { background:'var(--safe)', color:'white' }
                              : isActive
                              ? { background:'var(--orange)', color:'white' }
                              : { background:'var(--navy-500)', color:'var(--text-secondary)' }}>
                            {isComplete ? <CheckCircle size={12} /> :
                             !unlocked   ? <Lock size={10} /> :
                             lesson.type==='video' ? <Play size={10} /> :
                             lesson.type==='quiz'  ? <HelpCircle size={10} /> :
                             <FileText size={10} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`truncate font-medium ${isComplete?'opacity-60':''}`}>
                              {lesson.titre}
                            </div>
                            <div className="text-[10px] mt-0.5 opacity-60">
                              {lesson.type==='video'?'Vidéo':lesson.type==='pdf'?'Document':lesson.type==='quiz'?'Quiz':'Lecture'}
                              {lesson.duree_minutes>0 && ` · ${lesson.duree_minutes}min`}
                            </div>
                          </div>
                          {isComplete && <Check size={12} style={{ color:'var(--safe)', flexShrink:0 }} />}
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
        <main className={`flex-1 ${sidebarOpen?'ml-72 xl:ml-80':'ml-0'} transition-all duration-300 min-h-screen overflow-y-auto`}>
          {currentLesson ? (
            <LessonViewer
              lesson={currentLesson}
              isComplete={progress[currentLesson.id]===true}
              onMarkComplete={() => markComplete(currentLesson.id)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onQuizPass={() => markComplete(currentLesson.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <p style={{ color:'var(--text-secondary)' }}>Sélectionnez une leçon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function LessonViewer({ lesson, isComplete, onMarkComplete, activeTab, setActiveTab, onQuizPass }: any) {
  const [videoReady, setVideoReady]   = useState(isComplete)
  const [showWarn,   setShowWarn]     = useState('')

  useEffect(() => { setVideoReady(isComplete); setShowWarn('') }, [lesson.id, isComplete])

  function getYtId(url: string) {
    if (!url) return null
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }
  const ytId = getYtId(lesson.youtube_url||'')

  function handleComplete() {
    if (lesson.type==='video' && !videoReady) {
      setShowWarn('Regardez la vidéo avant de continuer.')
      setTimeout(()=>setShowWarn(''),4000)
      return
    }
    onMarkComplete()
  }

  const tabs = [
    { key:'contenu',          label:'Contenu' },
    { key:'quiz',             label:'Quiz' },
    ...(lesson.pdf_url ? [{ key:'telechargements', label:'Téléchargements' }] : []),
  ]

  return (
    <div>
      {/* Vidéo YouTube */}
      {ytId && (
        <YtPlayer videoId={ytId} alreadyWatched={isComplete} onWatched={()=>setVideoReady(true)} />
      )}

      {/* Avertissement */}
      {showWarn && (
        <div className="mx-5 mt-3 p-3 rounded-xl flex items-center gap-2 text-sm"
          style={{ background:'rgba(255,71,87,0.1)', border:'1px solid rgba(255,71,87,0.3)', color:'var(--danger)' }}>
          <AlertTriangle size={15}/>{showWarn}
        </div>
      )}

      {/* Titre + bouton */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor:'var(--border)' }}>
        <h2 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>{lesson.titre}</h2>
        {lesson.type!=='quiz' && (
          isComplete
            ? <span className="badge badge-safe text-sm px-4 py-1.5 flex-shrink-0"><CheckCircle size={14} className="mr-1.5"/>Terminé</span>
            : <button onClick={handleComplete} className="btn-primary py-2 px-5 text-sm flex-shrink-0"><CheckCircle size={14}/>Marquer comme terminé</button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex border-b" style={{ borderColor:'var(--border)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setActiveTab(t.key as any)}
            className="px-5 py-3 text-sm font-medium transition-all relative"
            style={activeTab===t.key ? { color:'var(--text-primary)' } : { color:'var(--text-secondary)' }}>
            {t.label}
            {activeTab===t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background:'var(--orange)' }} />}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab==='contenu' && (
          lesson.contenu_riche
            ? <div className="prose max-w-none text-sm" style={{ color:'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html:lesson.contenu_riche }} />
            : <p className="text-sm italic" style={{ color:'var(--text-secondary)' }}>Aucun contenu textuel pour cette leçon.</p>
        )}
        {activeTab==='quiz' && <QuizPlayer lessonId={lesson.id} onPass={onQuizPass} />}
        {activeTab==='telechargements' && lesson.pdf_url && (
          <a href={lesson.pdf_url} target="_blank" rel="noreferrer" download={lesson.pdf_nom||'document.pdf'}
            className="flex items-center gap-3 p-4 rounded-xl border transition-all"
            style={{ borderColor:'var(--border)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:'rgba(212,80,15,0.1)' }}>
              <FileText size={22} style={{ color:'var(--orange)' }} />
            </div>
            <div>
              <div className="font-medium text-sm" style={{ color:'var(--text-primary)' }}>{lesson.pdf_nom||`${lesson.titre}.pdf`}</div>
              <div className="text-xs" style={{ color:'var(--text-secondary)' }}>PDF · Cliquez pour télécharger</div>
            </div>
          </a>
        )}
      </div>
    </div>
  )
}

function YtPlayer({ videoId, onWatched, alreadyWatched }: { videoId:string; onWatched:()=>void; alreadyWatched?:boolean }) {
  const timerRef    = useRef<any>(null)
  const watchedRef  = useRef(alreadyWatched||false)

  useEffect(() => { watchedRef.current = alreadyWatched||false }, [alreadyWatched])
  useEffect(() => () => { if(timerRef.current) clearTimeout(timerRef.current) }, [videoId])

  function handleLoad() {
    if (watchedRef.current) return
    timerRef.current = setTimeout(()=>{ watchedRef.current=true; onWatched() }, 10000)
  }

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&color=white&fs=1`

  return (
    <div className="relative bg-black w-full" style={{ aspectRatio:'16/9' }}>
      <iframe src={src} title="Leçon" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen"
        allowFullScreen className="w-full h-full border-0 absolute inset-0" onLoad={handleLoad} />
      {/* Overlay bas droite — masque logo YouTube */}
      <div style={{ position:'absolute', bottom:0, right:0, width:'220px', height:'46px', background:'#000', zIndex:2, pointerEvents:'none' }} />
      {/* Overlay bas gauche */}
      <div style={{ position:'absolute', bottom:0, left:0, width:'120px', height:'46px', background:'#000', zIndex:2, pointerEvents:'none' }} />
      {alreadyWatched && (
        <div className="absolute top-3 left-3 badge badge-safe text-xs z-10">
          <CheckCircle size={11} className="mr-1"/>Déjà vue
        </div>
      )}
    </div>
  )
}

function QuizPlayer({ lessonId, onPass }: { lessonId:string; onPass:()=>void }) {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers,   setAnswers]   = useState<Record<string,any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results,   setResults]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setSubmitted(false); setAnswers({}); setResults(null)
    supabase.from('quiz_questions').select('*').eq('lesson_id',lessonId).order('ordre')
      .then(({data})=>{ setQuestions(data||[]); setLoading(false) })
  }, [lessonId])

  function submit() {
    let total=0, earned=0
    const details: any[] = []
    questions.forEach(q => {
      total += q.points||1
      const ua = answers[q.id]
      let ok = false
      if (q.type==='qcm')       ok = (q.options||[])[ua]?.correct===true
      if (q.type==='qcm_multi') { const cor=(q.options||[]).filter((o:any)=>o.correct).map((o:any)=>o.text); ok=JSON.stringify([...(ua||[])].sort())===JSON.stringify([...cor].sort()) }
      if (q.type==='vrai_faux') ok = ua===q.reponse_correcte
      if (q.type==='texte_libre') ok = q.reponse_correcte ? ua?.toLowerCase().trim()===q.reponse_correcte.toLowerCase().trim() : true
      if (q.type==='ordre')     ok = JSON.stringify(ua||[])===JSON.stringify((q.options||[]).map((o:any)=>o.text))
      if (q.type==='remplir')   ok = (q.options||[]).every((o:any,i:number)=>(ua||[])[i]?.toLowerCase().trim()===o.text?.toLowerCase().trim())
      if (ok) earned += q.points||1
      details.push({ question:q.question, ok, points:q.points||1, explication:q.explication })
    })
    const pct = total>0 ? Math.round((earned/total)*100) : 0
    const passed = pct>=70
    setResults({ earned, total, pct, passed, details })
    setSubmitted(true)
    if (passed) onPass()
  }

  if (loading) return <div className="text-center py-8" style={{ color:'var(--text-secondary)' }}>Chargement...</div>
  if (questions.length===0) return (
    <div className="text-center py-8">
      <HelpCircle size={36} className="mx-auto mb-2" style={{ color:'var(--text-secondary)' }}/>
      <p style={{ color:'var(--text-secondary)' }}>Aucune question pour ce quiz.</p>
    </div>
  )

  if (submitted && results) return (
    <div className="max-w-2xl mx-auto">
      <div className={`card p-8 text-center mb-6 border-2 ${results.passed?'border-green-500/30':'border-red-500/30'}`}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: results.passed?'rgba(0,200,150,0.15)':'rgba(255,71,87,0.15)' }}>
          <span className="text-4xl font-bold font-display" style={{ color:results.passed?'var(--safe)':'var(--danger)' }}>{results.pct}%</span>
        </div>
        <h3 className="text-xl font-bold mb-1" style={{ color:'var(--text-primary)' }}>{results.passed?'🎉 Quiz réussi !':'❌ Quiz non réussi'}</h3>
        <p className="text-sm mb-4" style={{ color:'var(--text-secondary)' }}>{results.earned}/{results.total} points · {results.passed?'Score ≥ 70% ✓':'Minimum 70% requis'}</p>
        <div className="h-3 rounded-full overflow-hidden mx-auto" style={{ maxWidth:'200px', background:'var(--navy-600)' }}>
          <div className="h-full rounded-full transition-all" style={{ width:`${results.pct}%`, background:results.pct>=70?'var(--safe)':results.pct>=50?'var(--warn)':'var(--danger)' }} />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {results.details.map((d:any,i:number)=>(
          <div key={i} className="card p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background:d.ok?'rgba(0,200,150,0.15)':'rgba(255,71,87,0.15)' }}>
              {d.ok?<CheckCircle size={14} style={{ color:'var(--safe)' }}/>:<X size={14} style={{ color:'var(--danger)' }}/>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>{i+1}. {d.question}</p>
              {d.explication && <p className="text-xs mt-1 italic" style={{ color:'var(--text-secondary)' }}>💡 {d.explication}</p>}
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color:d.ok?'var(--safe)':'var(--danger)' }}>{d.ok?`+${d.points}pt`:'0pt'}</span>
          </div>
        ))}
      </div>
      {!results.passed && (
        <button onClick={()=>{setSubmitted(false);setAnswers({});setResults(null)}} className="btn-secondary w-full justify-center py-3">🔄 Recommencer</button>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{questions.length} question{questions.length>1?'s':''} · {Object.keys(answers).length}/{questions.length} répondues</p>
        <p className="text-xs" style={{ color:'var(--text-secondary)' }}>Score minimum : 70%</p>
      </div>
      <div className="space-y-5">
        {questions.map((q,qi)=>(
          <QQuestion key={q.id} q={q} index={qi} answer={answers[q.id]} onAnswer={(v:any)=>setAnswers(p=>({...p,[q.id]:v}))} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <button onClick={submit} disabled={Object.keys(answers).length<questions.length} className="btn-primary py-3 px-12 text-base">Soumettre mes réponses</button>
        {Object.keys(answers).length<questions.length && <p className="text-xs mt-2" style={{ color:'var(--text-secondary)' }}>Répondez à toutes les questions</p>}
      </div>
    </div>
  )
}

function QQuestion({ q, index, answer, onAnswer }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="badge badge-orange text-[10px] flex-shrink-0 mt-0.5">{index+1}</span>
        <p className="font-medium text-sm" style={{ color:'var(--text-primary)' }}>{q.question}</p>
      </div>
      {(q.type==='qcm'||q.type==='qcm_multi') && (
        <div className="space-y-2">
          {(q.options||[]).map((opt:any,oi:number)=>{
            const sel = q.type==='qcm' ? answer===oi : (answer||[]).includes(opt.text)
            return (
              <button key={oi} type="button" onClick={()=>{ if(q.type==='qcm') onAnswer(oi); else { const c=answer||[]; onAnswer(c.includes(opt.text)?c.filter((x:string)=>x!==opt.text):[...c,opt.text]) } }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all"
                style={sel?{borderColor:'var(--orange)',background:'rgba(212,80,15,0.08)',color:'var(--text-primary)'}:{borderColor:'var(--border)',color:'var(--text-secondary)'}}>
                <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${q.type==='qcm'?'rounded-full':'rounded-md'}`}
                  style={sel?{background:'var(--orange)',borderColor:'var(--orange)'}:{borderColor:'var(--border)'}}>
                  {sel && <Check size={11} className="text-white"/>}
                </div>
                {opt.text}
              </button>
            )
          })}
        </div>
      )}
      {q.type==='vrai_faux' && (
        <div className="flex gap-3">
          {['Vrai','Faux'].map(val=>(
            <button key={val} type="button" onClick={()=>onAnswer(val)}
              className="flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all"
              style={answer===val?{borderColor:val==='Vrai'?'var(--safe)':'var(--danger)',background:val==='Vrai'?'rgba(0,200,150,0.1)':'rgba(255,71,87,0.1)',color:val==='Vrai'?'var(--safe)':'var(--danger)'}:{borderColor:'var(--border)',color:'var(--text-secondary)'}}>
              {val==='Vrai'?'✅':'❌'} {val}
            </button>
          ))}
        </div>
      )}
      {q.type==='texte_libre' && (
        <textarea value={answer||''} onChange={e=>onAnswer(e.target.value)} placeholder="Votre réponse..." rows={3} className="input-field text-sm"/>
      )}
      {q.type==='relier' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">{(q.options||[]).map((o:any,i:number)=><div key={i} className="p-2.5 rounded-lg text-sm text-center" style={{background:'var(--bg-secondary)',color:'var(--text-primary)'}}>{o.gauche}</div>)}</div>
          <div className="space-y-2">{(q.options||[]).map((o:any,i:number)=><div key={i} className="p-2.5 rounded-lg text-sm text-center" style={{background:'rgba(212,80,15,0.08)',color:'var(--orange)'}}>{o.droite}</div>)}</div>
        </div>
      )}
      {q.type==='remplir' && (
        <div className="text-sm leading-relaxed" style={{ color:'var(--text-primary)' }}>
          {(q.reponse_correcte||'').split(/(\{\{[0-9]+\}\})/g).map((part:string,pi:number)=>{
            const m=part.match(/\{\{([0-9]+)\}\}/)
            if (m) { const fi=parseInt(m[1])-1; return <input key={pi} type="text" value={(answer||[])[fi]||''} onChange={e=>{const n=[...(answer||[])];n[fi]=e.target.value;onAnswer(n)}} className="inline-block w-28 mx-1 text-center border-b-2 bg-transparent outline-none text-sm" style={{borderColor:'var(--orange)',color:'var(--orange)'}}/> }
            return <span key={pi}>{part}</span>
          })}
        </div>
      )}
      {q.type==='ordre' && (
        <div className="space-y-2">
          <p className="text-xs mb-1" style={{ color:'var(--text-secondary)' }}>Cliquez dans le bon ordre :</p>
          {(q.options||[]).map((opt:any,oi:number)=>{ const so=(answer||[]).indexOf(opt.text); return (
            <button key={oi} type="button" onClick={()=>{ const c=answer||[]; onAnswer(c.includes(opt.text)?c.filter((x:string)=>x!==opt.text):[...c,opt.text]) }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all"
              style={so>=0?{borderColor:'var(--orange)',color:'var(--text-primary)',background:'rgba(212,80,15,0.08)'}:{borderColor:'var(--border)',color:'var(--text-secondary)'}}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:so>=0?'var(--orange)':'var(--navy-600)',color:'white'}}>{so>=0?so+1:'?'}</span>
              {opt.text}
            </button>
          )})}
        </div>
      )}
    </div>
  )
}
