'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import {
  Play, FileText, HelpCircle, ChevronRight,
  ChevronLeft, Download, Share2, Clock,
  ChevronDown, ChevronUp, BookOpen, List
} from 'lucide-react'

export default function CoursPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const slug         = params?.slug as string
  const lessonParam  = searchParams?.get('lecon')

  const [course,        setCourse]        = useState<any>(null)
  const [modules,       setModules]       = useState<any[]>([])
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [allLessons,    setAllLessons]    = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [showPlaylist,  setShowPlaylist]  = useState(true)
  const [expandedMods,  setExpandedMods]  = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
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

      const all = sorted.flatMap(m => m.course_lessons || [])
      setAllLessons(all)

      // Ouvrir la leçon demandée ou la première
      const target = lessonParam
        ? all.find(l => l.id === lessonParam) || all[0]
        : all[0]
      setCurrentLesson(target)
      setLoading(false)
    }
    load()
  }, [slug, router])

  function selectLesson(lesson: any) {
    setCurrentLesson(lesson)
    router.replace(`/cours/${slug}?lecon=${lesson.id}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function getYtId(url: string) {
    const m = (url || '').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  const currentIdx  = allLessons.findIndex(l => l.id === currentLesson?.id)
  const prevLesson  = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson  = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null
  const ytId        = getYtId(currentLesson?.youtube_url || '')
  const totalDuree  = allLessons.reduce((a, l) => a + (l.duree_minutes || 0), 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl animate-pulse mx-auto mb-3" style={{ background: 'var(--orange)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Navbar />

      <div className="pt-16">

        {/* ===== VIDÉO PLEINE LARGEUR ===== */}
        {ytId && (
          <div className="w-full bg-black" style={{ maxHeight: '75vh' }}>
            <div className="mx-auto" style={{ maxWidth: '1400px' }}>
              <YtEmbed videoId={ytId} />
            </div>
          </div>
        )}

        {/* ===== IMAGE si pas de vidéo ===== */}
        {!ytId && currentLesson?.type !== 'pdf' && (
          <div className="w-full" style={{ maxHeight: '60vh', overflow: 'hidden' }}>
            {course?.image_couverture ? (
              <img src={course.image_couverture} alt={course.titre}
                className="w-full object-cover" style={{ maxHeight: '60vh' }} />
            ) : (
              <div className="w-full flex items-center justify-center py-20"
                style={{ background: 'var(--navy-800)' }}>
                <BookOpen size={64} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}
          </div>
        )}

        {/* ===== PDF viewer ===== */}
        {currentLesson?.type === 'pdf' && currentLesson?.pdf_url && (
          <div style={{ height: '70vh', background: '#000' }}>
            <iframe src={currentLesson.pdf_url} className="w-full h-full border-0" title={currentLesson.titre} />
          </div>
        )}

        {/* ===== CONTENU PRINCIPAL — style JW.org ===== */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-8 items-start" style={{ flexDirection: 'row' }}>

            {/* COLONNE GAUCHE — Contenu principal (65%) */}
            <div className="flex-1 min-w-0">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs mb-4 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                <Link href="/secteurs" className="hover:text-orange-500 transition-colors">Formations</Link>
                <ChevronRight size={12} />
                <Link href={`/secteurs/${course?.secteur_slug}`} className="hover:text-orange-500 transition-colors capitalize">
                  {course?.secteur_slug?.replace(/-/g, ' ')}
                </Link>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--text-primary)' }}>{course?.titre}</span>
              </div>

              {/* Titre de la leçon courante */}
              <h1 className="text-2xl font-bold mb-3 font-display" style={{ color: 'var(--text-primary)' }}>
                {currentLesson?.titre || course?.titre}
              </h1>

              {/* Méta */}
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                {currentLesson?.duree_minutes > 0 && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Clock size={14} />Durée : {currentLesson.duree_minutes} min
                  </span>
                )}
                {allLessons.length > 1 && (
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Étape {currentIdx + 1} / {allLessons.length}
                  </span>
                )}
                <span className="badge badge-orange text-[10px] capitalize">
                  {currentLesson?.type === 'video' ? '▶ Vidéo' : currentLesson?.type === 'pdf' ? '📄 Document' : currentLesson?.type === 'quiz' ? '❓ Quiz' : '📖 Lecture'}
                </span>
              </div>

              {/* Boutons d'action style JW.org */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b flex-wrap" style={{ borderColor: 'var(--border)' }}>
                {currentLesson?.pdf_url && (
                  <a href={currentLesson.pdf_url} download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <Download size={15} />Télécharger
                  </a>
                )}
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => navigator.share?.({ title: currentLesson?.titre, url: window.location.href })}>
                  <Share2 size={15} />Partager
                </button>
              </div>

              {/* Contenu texte riche */}
              {currentLesson?.contenu_riche && (
                <div
                  className="prose max-w-none text-base leading-relaxed mb-8"
                  style={{ color: 'var(--text-primary)' }}
                  dangerouslySetInnerHTML={{ __html: currentLesson.contenu_riche }}
                />
              )}

              {/* Description du cours si première leçon */}
              {!currentLesson?.contenu_riche && course?.description && (
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                  {course.description}
                </p>
              )}

              {/* Navigation Précédent / Suivant */}
              <div className="flex items-center justify-between pt-6 border-t gap-4" style={{ borderColor: 'var(--border)' }}>
                {prevLesson ? (
                  <button onClick={() => selectLesson(prevLesson)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--orange)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                    <ChevronLeft size={16} />
                    <div className="text-left">
                      <div className="text-[10px] opacity-60">Précédent</div>
                      <div className="truncate max-w-32">{prevLesson.titre}</div>
                    </div>
                  </button>
                ) : <div />}

                {nextLesson ? (
                  <button onClick={() => selectLesson(nextLesson)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: 'var(--orange)', color: 'white' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <div className="text-right">
                      <div className="text-[10px] opacity-80">Suivant</div>
                      <div className="truncate max-w-32">{nextLesson.titre}</div>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(0,200,150,0.1)', color: 'var(--safe)', border: '1px solid rgba(0,200,150,0.2)' }}>
                    ✓ Fin du cours
                  </div>
                )}
              </div>

              {/* Section "Découvrez aussi" */}
              <SuggestedContent courseId={course?.id} sectorSlug={course?.secteur_slug} />
            </div>

            {/* COLONNE DROITE — Playlist / Sidebar (35%) */}
            <div className="flex-shrink-0 hidden lg:block" style={{ width: '320px' }}>

              {/* Info du cours */}
              <div className="card p-4 mb-4">
                {course?.image_couverture && (
                  <img src={course.image_couverture} alt={course.titre}
                    className="w-full h-36 object-cover rounded-xl mb-3" />
                )}
                <h2 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {course?.titre}
                </h2>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {course?.description_courte}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1"><List size={12} />{allLessons.length} leçons</span>
                  {totalDuree > 0 && <span className="flex items-center gap-1"><Clock size={12} />{totalDuree} min</span>}
                </div>
              </div>

              {/* Playlist des leçons */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: 'var(--border)' }}>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Contenu du cours
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {allLessons.length} étapes
                  </span>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                  {modules.map((mod, mi) => (
                    <div key={mod.id}>
                      {/* Header module */}
                      {modules.length > 1 && (
                        <button
                          onClick={() => setExpandedMods(prev => {
                            const n = new Set(prev); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n
                          })}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          <span>Module {mi + 1} · {mod.titre}</span>
                          {expandedMods.has(mod.id)
                            ? <ChevronUp size={12} />
                            : <ChevronDown size={12} />}
                        </button>
                      )}

                      {/* Leçons */}
                      {(modules.length === 1 || expandedMods.has(mod.id)) && (
                        (mod.course_lessons || []).map((lesson: any, li: number) => {
                          const globalIdx = allLessons.findIndex(l => l.id === lesson.id)
                          const isActive  = currentLesson?.id === lesson.id
                          const ytThumb   = getYtId(lesson.youtube_url || '')

                          return (
                            <button key={lesson.id}
                              onClick={() => selectLesson(lesson)}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b"
                              style={isActive
                                ? { background: 'rgba(212,80,15,0.08)', borderColor: 'var(--border)', borderLeft: '3px solid var(--orange)' }
                                : { borderColor: 'var(--border)', borderLeft: '3px solid transparent' }
                              }
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--navy-700)' }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>

                              {/* Thumbnail ou numéro */}
                              <div className="relative flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden"
                                style={{ background: 'var(--navy-600)' }}>
                                {ytThumb ? (
                                  <>
                                    <img
                                      src={`https://img.youtube.com/vi/${ytThumb}/mqdefault.jpg`}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center"
                                      style={{ background: 'rgba(0,0,0,0.3)' }}>
                                      <Play size={14} className="text-white" fill="white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg font-bold"
                                    style={{ color: isActive ? 'var(--orange)' : 'var(--text-secondary)' }}>
                                    {globalIdx + 1}
                                  </div>
                                )}
                              </div>

                              {/* Titre et méta */}
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-medium line-clamp-2 mb-0.5 ${isActive ? 'text-orange-500' : ''}`}
                                  style={!isActive ? { color: 'var(--text-primary)' } : {}}>
                                  {lesson.titre}
                                </div>
                                <div className="text-[10px] flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                  {lesson.type === 'video'
                                    ? <><Play size={9} />Vidéo</>
                                    : lesson.type === 'pdf'
                                    ? <><FileText size={9} />Document</>
                                    : lesson.type === 'quiz'
                                    ? <><HelpCircle size={9} />Quiz</>
                                    : <><BookOpen size={9} />Lecture</>}
                                  {lesson.duree_minutes > 0 && <> · {lesson.duree_minutes}min</>}
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Playlist mobile (bas de page) */}
        <div className="lg:hidden max-w-6xl mx-auto px-4 pb-8">
          <button onClick={() => setShowPlaylist(!showPlaylist)}
            className="w-full flex items-center justify-between p-4 card mb-2">
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Contenu du cours ({allLessons.length} étapes)
            </span>
            {showPlaylist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPlaylist && (
            <div className="card overflow-hidden">
              {allLessons.map((lesson, idx) => {
                const isActive = currentLesson?.id === lesson.id
                const ytThumb  = getYtId(lesson.youtube_url || '')
                return (
                  <button key={lesson.id} onClick={() => selectLesson(lesson)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-all"
                    style={isActive
                      ? { background: 'rgba(212,80,15,0.08)', borderColor: 'var(--border)', borderLeft: '3px solid var(--orange)' }
                      : { borderColor: 'var(--border)', borderLeft: '3px solid transparent' }}>
                    <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--navy-600)' }}>
                      {ytThumb ? (
                        <img src={`https://img.youtube.com/vi/${ytThumb}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                          style={{ color: isActive ? 'var(--orange)' : 'var(--text-secondary)' }}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--orange)' : 'var(--text-primary)' }}>
                        {lesson.titre}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.type === 'video' ? 'Vidéo' : lesson.type === 'pdf' ? 'Document' : 'Lecture'}
                        {lesson.duree_minutes > 0 && ` · ${lesson.duree_minutes}min`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ============================================================
// YOUTUBE EMBED — Sans branding + Logo Thinks Safety
// ============================================================
function YtEmbed({ videoId }: { videoId: string }) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&color=white&fs=1`

  const Logo = () => (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--orange)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2zm0 2.5L19 8.5v7L12 19.5 5 15.5v-7L12 4.5z"/>
        </svg>
      </div>
      <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
        THINKS <span style={{ color: 'var(--orange)' }}>SAFETY</span>
      </span>
    </div>
  )

  return (
    <div className="relative bg-black w-full" style={{ aspectRatio: '16/9', maxHeight: '75vh' }}>
      <iframe
        src={src}
        title="Vidéo"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen"
        allowFullScreen
        className="w-full h-full border-0 absolute inset-0"
      />
      {/* Overlay bas droite — logo Thinks Safety à la place de YouTube */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '220px', height: '44px', background: 'rgba(0,0,0,0.9)', zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '14px' }}>
        <Logo />
      </div>
      {/* Overlay haut droite */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '220px', height: '44px', background: 'rgba(0,0,0,0.85)', zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '14px' }}>
        <Logo />
      </div>
    </div>
  )
}

// ============================================================
// SECTION "DÉCOUVREZ AUSSI" — style JW.org
// ============================================================
function SuggestedContent({ courseId, sectorSlug }: { courseId?: string; sectorSlug?: string }) {
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    if (!sectorSlug) return
    supabase.from('courses')
      .select('id, slug, titre, description_courte, image_couverture, secteur_slug')
      .eq('statut', 'published')
      .eq('secteur_slug', sectorSlug)
      .neq('id', courseId || '')
      .limit(3)
      .then(({ data }) => setCourses(data || []))
  }, [courseId, sectorSlug])

  if (!courses.length) return null

  return (
    <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
        Découvrez aussi…
      </h2>
      <div className="space-y-4">
        {courses.map(c => (
          <Link key={c.id} href={`/cours/${c.slug}`}
            className="flex gap-4 group hover:no-underline">
            <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
              {c.image_couverture
                ? <img src={c.image_couverture} alt={c.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--orange)' }}>
                {c.secteur_slug?.replace(/-/g, ' ')}
              </span>
              <h3 className="text-sm font-semibold mt-0.5 group-hover:text-orange-500 transition-colors line-clamp-2"
                style={{ color: 'var(--text-primary)' }}>
                {c.titre}
              </h3>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                {c.description_courte}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
