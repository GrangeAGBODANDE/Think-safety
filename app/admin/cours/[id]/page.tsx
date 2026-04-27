'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import FileUpload from '@/components/FileUpload'
import RichTextEditor from '@/components/RichTextEditor'
import QuizEditor from '@/components/QuizEditor'
import {
  ChevronLeft, Plus, Trash2, GripVertical,
  Video, FileText, HelpCircle, Save, Eye,
  ChevronDown, ChevronUp, X, Check
} from 'lucide-react'

export default function AdminCourseEditorPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const isNew = courseId === 'nouveau'

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeSection, setActiveSection] = useState<'infos' | 'modules' | 'objectifs'>('infos')

  const [course, setCourse] = useState({
    titre: '', slug: '', description: '', description_courte: '',
    image_couverture: '', secteur_slug: '', niveau: 'debutant',
    est_gratuit: true, prix_acces: 0, est_certifiant: true,
    statut: 'draft', duree_totale_minutes: 0,
  })
  const [objectifs, setObjectifs] = useState<string[]>([''])
  const [prerequis, setPrerequis] = useState<string[]>([''])
  const [modules, setModules] = useState<any[]>([])

  useEffect(() => { if (!isNew) loadCourse() }, [courseId])

  async function loadCourse() {
    const { data: c } = await supabase.from('courses').select('*').eq('id', courseId).single()
    if (c) {
      setCourse({
        titre: c.titre || '', slug: c.slug || '',
        description: c.description || '', description_courte: c.description_courte || '',
        image_couverture: c.image_couverture || '', secteur_slug: c.secteur_slug || '',
        niveau: c.niveau || 'debutant', est_gratuit: c.est_gratuit ?? true,
        prix_acces: c.prix_acces || 0, est_certifiant: c.est_certifiant ?? true,
        statut: c.statut || 'draft', duree_totale_minutes: c.duree_totale_minutes || 0,
      })
      setObjectifs(c.objectifs?.length ? c.objectifs : [''])
      setPrerequis(c.prerequis?.length ? c.prerequis : [''])
    }
    const { data: mods } = await supabase
      .from('course_modules')
      .select(`*, course_lessons(*)`)
      .eq('course_id', courseId)
      .order('ordre')
    if (mods) {
      setModules(mods.map(m => ({
        ...m,
        course_lessons: (m.course_lessons || []).sort((a: any, b: any) => a.ordre - b.ordre),
        expanded: true,
      })))
    }
  }

  function generateSlug(title: string) {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function saveCourse() {
    if (!course.titre) { setMsg('⚠️ Le titre est requis'); return }
    setSaving(true)
    const slug = course.slug || generateSlug(course.titre)
    const payload = {
      ...course, slug,
      objectifs: objectifs.filter(o => o.trim()),
      prerequis: prerequis.filter(p => p.trim()),
      nb_modules: modules.length,
      nb_lecons: modules.reduce((acc, m) => acc + (m.course_lessons?.length || 0), 0),
    }
    if (isNew) {
      const { data, error } = await supabase.from('courses').insert(payload).select().single()
      if (error) { setMsg('❌ ' + error.message); setSaving(false); return }
      setMsg('✅ Cours créé ! Ajoutez maintenant vos modules.')
      setTimeout(() => router.push(`/admin/cours/${data.id}`), 1500)
    } else {
      const { error } = await supabase.from('courses').update(payload).eq('id', courseId)
      if (error) { setMsg('❌ ' + error.message); setSaving(false); return }
      setMsg('✅ Cours sauvegardé !')
      loadCourse()
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function addModule() {
    if (isNew) { setMsg('⚠️ Sauvegardez d\'abord le cours'); return }
    const ordre = modules.length + 1
    const { data } = await supabase.from('course_modules').insert({
      course_id: courseId, titre: `Module ${ordre}`, description: '', ordre
    }).select().single()
    if (data) setModules(prev => [...prev, { ...data, course_lessons: [], expanded: true }])
  }

  async function updateModuleTitle(moduleId: string, titre: string) {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, titre } : m))
    await supabase.from('course_modules').update({ titre }).eq('id', moduleId)
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Supprimer ce module et toutes ses leçons ?')) return
    await supabase.from('course_modules').delete().eq('id', moduleId)
    setModules(prev => prev.filter(m => m.id !== moduleId))
  }

  async function addLesson(moduleId: string, type: 'video' | 'pdf' | 'quiz') {
    const mod = modules.find(m => m.id === moduleId)
    const ordre = (mod?.course_lessons?.length || 0) + 1
    const { data } = await supabase.from('course_lessons').insert({
      module_id: moduleId, course_id: courseId,
      titre: type === 'video' ? `Vidéo ${ordre}` : type === 'pdf' ? `Document ${ordre}` : `Quiz ${ordre}`,
      type, ordre, est_obligatoire: true,
    }).select().single()
    if (data) {
      setModules(prev => prev.map(m => m.id === moduleId
        ? { ...m, course_lessons: [...(m.course_lessons || []), { ...data, expanded: true }] }
        : m
      ))
    }
  }

  async function updateLesson(lessonId: string, moduleId: string, field: string, value: any) {
    setModules(prev => prev.map(m => m.id === moduleId
      ? { ...m, course_lessons: m.course_lessons.map((l: any) => l.id === lessonId ? { ...l, [field]: value } : l) }
      : m
    ))
    await supabase.from('course_lessons').update({ [field]: value }).eq('id', lessonId)
  }

  async function deleteLesson(lessonId: string, moduleId: string) {
    await supabase.from('course_lessons').delete().eq('id', lessonId)
    setModules(prev => prev.map(m => m.id === moduleId
      ? { ...m, course_lessons: m.course_lessons.filter((l: any) => l.id !== lessonId) }
      : m
    ))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/cours" className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              {isNew ? 'Nouveau cours' : 'Modifier le cours'}
            </h1>
            {!isNew && course.slug && (
              <Link href={`/cours/${course.slug}`} target="_blank"
                className="text-xs hover:underline flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                <Eye size={11} />Voir le cours
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={course.statut}
            onChange={e => setCourse(p => ({ ...p, statut: e.target.value }))}
            className="input-field py-2 text-sm w-36">
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
          <button onClick={saveCourse} disabled={saving} className="btn-primary py-2 px-5 text-sm">
            <Save size={15} />{saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.startsWith('✅') ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg}
        </div>
      )}

      {/* Navigation sections */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'infos', label: 'Informations' },
          { key: 'objectifs', label: 'Objectifs' },
          { key: 'modules', label: `Modules ${!isNew ? `(${modules.length})` : ''}` },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key as any)}
            className="px-4 py-3 text-sm font-medium transition-all relative"
            style={activeSection === s.key ? { color: 'var(--orange)' } : { color: 'var(--text-secondary)' }}>
            {s.label}
            {activeSection === s.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--orange)' }} />
            )}
          </button>
        ))}
      </div>

      {/* ===== INFOS ===== */}
      {activeSection === 'infos' && (
        <div className="space-y-5">
          {/* Image de couverture avec upload direct */}
          <FileUpload
            bucket="course-covers"
            accept="image/jpeg,image/png,image/webp"
            label="Image de couverture"
            currentUrl={course.image_couverture}
            onUpload={(url) => setCourse(p => ({ ...p, image_couverture: url }))}
            maxSizeMB={5}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Titre du cours *</label>
              <input type="text" value={course.titre}
                onChange={e => setCourse(p => ({ ...p, titre: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="Ex: Sécurité sur chantier BTP" className="input-field" />
            </div>
            <div>
              <label className="input-label">Secteur</label>
              <select value={course.secteur_slug}
                onChange={e => setCourse(p => ({ ...p, secteur_slug: e.target.value }))}
                className="input-field">
                <option value="">Choisir un secteur</option>
                {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Niveau</label>
              <select value={course.niveau}
                onChange={e => setCourse(p => ({ ...p, niveau: e.target.value }))}
                className="input-field">
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Description courte (résumé)</label>
            <input type="text" value={course.description_courte}
              onChange={e => setCourse(p => ({ ...p, description_courte: e.target.value }))}
              placeholder="Résumé en une phrase..." className="input-field" />
          </div>

          <div>
            <label className="input-label">Description complète</label>
            <textarea value={course.description}
              onChange={e => setCourse(p => ({ ...p, description: e.target.value }))}
              placeholder="Décrivez le cours..." rows={4} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Durée totale (minutes)</label>
              <input type="number" value={course.duree_totale_minutes}
                onChange={e => setCourse(p => ({ ...p, duree_totale_minutes: parseInt(e.target.value) || 0 }))}
                className="input-field" />
            </div>
            <div>
              <label className="input-label">Slug URL</label>
              <input type="text" value={course.slug}
                onChange={e => setCourse(p => ({ ...p, slug: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={course.est_gratuit}
                onChange={e => setCourse(p => ({ ...p, est_gratuit: e.target.checked }))}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Cours gratuit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={course.est_certifiant}
                onChange={e => setCourse(p => ({ ...p, est_certifiant: e.target.checked }))}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Cours certifiant</span>
            </label>
          </div>
        </div>
      )}

      {/* ===== OBJECTIFS ===== */}
      {activeSection === 'objectifs' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="input-label mb-0">Objectifs pédagogiques</label>
              <button onClick={() => setObjectifs(p => [...p, ''])}
                className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                <Plus size={12} />Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {objectifs.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={obj}
                    onChange={e => { const n = [...objectifs]; n[i] = e.target.value; setObjectifs(n) }}
                    placeholder={`Objectif ${i + 1}...`} className="input-field flex-1" />
                  <button onClick={() => setObjectifs(p => p.filter((_, j) => j !== i))}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="input-label mb-0">Prérequis</label>
              <button onClick={() => setPrerequis(p => [...p, ''])}
                className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                <Plus size={12} />Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {prerequis.map((pre, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={pre}
                    onChange={e => { const n = [...prerequis]; n[i] = e.target.value; setPrerequis(n) }}
                    placeholder={`Prérequis ${i + 1}...`} className="input-field flex-1" />
                  <button onClick={() => setPrerequis(p => p.filter((_, j) => j !== i))}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODULES ===== */}
      {activeSection === 'modules' && (
        <div>
          {isNew ? (
            <div className="card p-8 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                Sauvegardez d'abord les informations du cours.
              </p>
              <button onClick={() => { setActiveSection('infos'); saveCourse() }} className="btn-primary mt-4 py-2 px-6">
                Sauvegarder et continuer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, mi) => (
                <ModuleEditor
                  key={module.id}
                  module={module}
                  index={mi}
                  courseId={courseId}
                  onUpdateTitle={(titre: string) => updateModuleTitle(module.id, titre)}
                  onDelete={() => deleteModule(module.id)}
                  onAddLesson={(type: any) => addLesson(module.id, type)}
                  onUpdateLesson={(lessonId: string, field: string, value: any) => updateLesson(lessonId, module.id, field, value)}
                  onDeleteLesson={(lessonId: string) => deleteLesson(lessonId, module.id)}
                  onToggle={() => setModules(prev => prev.map(m => m.id === module.id ? { ...m, expanded: !m.expanded } : m))}
                />
              ))}
              <button onClick={addModule}
                className="w-full py-4 border-2 border-dashed rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <Plus size={16} />Ajouter un module
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MODULE EDITOR
// ============================================================
function ModuleEditor({ module, index, courseId, onUpdateTitle, onDelete, onAddLesson, onUpdateLesson, onDeleteLesson, onToggle }: any) {
  const [title, setTitle] = useState(module.titre)
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <GripVertical size={16} style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: 'var(--orange)' }}>M{index + 1}</span>
        <input type="text" value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => onUpdateTitle(title)}
          className="flex-1 bg-transparent border-none outline-none font-semibold text-sm"
          style={{ color: 'var(--text-primary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {module.course_lessons?.length || 0} leçons
        </span>
        <button onClick={onToggle} style={{ color: 'var(--text-secondary)' }}>
          {module.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button onClick={onDelete} className="text-red-400 hover:bg-red-500/10 p-1 rounded">
          <Trash2 size={14} />
        </button>
      </div>

      {module.expanded && (
        <div className="p-4">
          <div className="space-y-2 mb-4">
            {(module.course_lessons || []).map((lesson: any, li: number) => (
              <LessonEditorFull
                key={lesson.id}
                lesson={lesson}
                index={li}
                onUpdate={(field: string, value: any) => onUpdateLesson(lesson.id, field, value)}
                onDelete={() => onDeleteLesson(lesson.id)}
              />
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onAddLesson('video')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all"
              style={{ borderColor: 'var(--border)', color: '#2196F3' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(33,150,243,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Video size={13} />Vidéo
            </button>
            <button onClick={() => onAddLesson('pdf')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--safe)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,200,150,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <FileText size={13} />Document PDF
            </button>
            <button onClick={() => onAddLesson('quiz')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--warn)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <HelpCircle size={13} />Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// LESSON EDITOR COMPLET
// ============================================================
function LessonEditorFull({ lesson, index, onUpdate, onDelete }: any) {
  const [expanded, setExpanded] = useState(false)
  const [quizTab, setQuizTab] = useState(false)

  const ICON: Record<string, any> = {
    video: <Video size={13} className="text-blue-400" />,
    pdf: <FileText size={13} className="text-green-400" />,
    quiz: <HelpCircle size={13} className="text-yellow-400" />,
  }

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: 'var(--bg-secondary)' }}>
        <GripVertical size={13} style={{ color: 'var(--text-secondary)' }} />
        {ICON[lesson.type]}
        <input type="text" value={lesson.titre}
          onChange={e => onUpdate('titre', e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-xs font-medium"
          style={{ color: 'var(--text-primary)' }} />
        <span className="badge text-[10px]" style={{ background: 'var(--navy-600)', color: 'var(--text-secondary)' }}>
          {lesson.type}
        </span>
        <button onClick={() => setExpanded(!expanded)} style={{ color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button onClick={onDelete} className="text-red-400"><Trash2 size={13} /></button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="input-label">Titre de la leçon</label>
            <input type="text" value={lesson.titre}
              onChange={e => onUpdate('titre', e.target.value)}
              className="input-field text-sm" />
          </div>

          {/* VIDÉO */}
          {lesson.type === 'video' && (
            <>
              <div>
                <label className="input-label">Lien YouTube</label>
                <input type="url" value={lesson.youtube_url || ''}
                  onChange={e => onUpdate('youtube_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..." className="input-field text-sm" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  La vidéo sera intégrée sans logo YouTube ni bouton rouge.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Durée (minutes)</label>
                  <input type="number" value={lesson.duree_minutes || 0}
                    onChange={e => onUpdate('duree_minutes', parseInt(e.target.value) || 0)}
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="input-label">% vidéo requis pour valider</label>
                  <input type="number" min="50" max="100" value={lesson.seuil_completion_video || 80}
                    onChange={e => onUpdate('seuil_completion_video', parseInt(e.target.value) || 80)}
                    className="input-field text-sm" />
                </div>
              </div>
            </>
          )}

          {/* PDF avec upload direct */}
          {lesson.type === 'pdf' && (
            <>
              <FileUpload
                bucket="lesson-pdfs"
                accept="application/pdf"
                label="Fichier PDF"
                currentUrl={lesson.pdf_url}
                onUpload={(url, name) => { onUpdate('pdf_url', url); onUpdate('pdf_nom', name) }}
                maxSizeMB={20}
              />
              <div>
                <label className="input-label">Nombre de pages</label>
                <input type="number" value={lesson.nb_pages || 0}
                  onChange={e => onUpdate('nb_pages', parseInt(e.target.value) || 0)}
                  className="input-field text-sm" />
              </div>
            </>
          )}

          {/* CONTENU TEXTE RICHE (tous types) */}
          {lesson.type !== 'quiz' && (
            <div>
              <label className="input-label">Contenu textuel de la leçon</label>
              <RichTextEditor
                value={lesson.contenu_riche || ''}
                onChange={(html) => onUpdate('contenu_riche', html)}
                placeholder="Rédigez le contenu de la leçon..."
                minHeight={200}
              />
            </div>
          )}

          {/* QUIZ */}
          {lesson.type === 'quiz' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={16} style={{ color: 'var(--warn)' }} />
                <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Questions du quiz</h4>
              </div>
              <QuizEditor lessonId={lesson.id} />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={lesson.est_obligatoire ?? true}
                onChange={e => onUpdate('est_obligatoire', e.target.checked)}
                className="accent-orange-500" />
              Obligatoire pour progresser
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
