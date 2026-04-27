'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Check, X } from 'lucide-react'

interface QuizEditorProps {
  lessonId: string
}

const QUESTION_TYPES = [
  { value: 'qcm', label: 'QCM — Une seule bonne réponse', icon: '🔘' },
  { value: 'qcm_multi', label: 'QCM Multiple — Plusieurs bonnes réponses', icon: '☑️' },
  { value: 'vrai_faux', label: 'Vrai ou Faux', icon: '✅' },
  { value: 'texte_libre', label: 'Réponse écrite libre', icon: '✏️' },
  { value: 'relier', label: 'Relier les colonnes', icon: '🔗' },
  { value: 'remplir', label: 'Remplir les champs vides', icon: '📝' },
  { value: 'ordre', label: 'Remettre dans l\'ordre', icon: '🔢' },
]

export default function QuizEditor({ lessonId }: QuizEditorProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [lessonId])

  async function load() {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('ordre')
    setQuestions(data || [])
    setLoading(false)
  }

  async function addQuestion() {
    const ordre = questions.length + 1
    const newQ = {
      lesson_id: lessonId,
      question: '',
      type: 'qcm',
      ordre,
      options: [
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: true },
        { text: '', correct: false },
      ],
      points: 1,
    }
    const { data } = await supabase.from('quiz_questions').insert(newQ).select().single()
    if (data) setQuestions(prev => [...prev, { ...data, expanded: true }])
  }

  async function saveQuestion(q: any) {
    setSaving(q.id)
    await supabase.from('quiz_questions').update({
      question: q.question,
      type: q.type,
      options: q.options,
      reponse_correcte: q.reponse_correcte,
      explication: q.explication,
      points: q.points,
    }).eq('id', q.id)
    setSaving(null)
  }

  async function deleteQuestion(id: string) {
    await supabase.from('quiz_questions').delete().eq('id', id)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  function updateQuestion(id: string, field: string, value: any) {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q
      // Réinitialiser les options selon le type
      if (field === 'type') {
        let defaultOptions: any = q.options
        if (value === 'vrai_faux') defaultOptions = [{ text: 'Vrai', correct: true }, { text: 'Faux', correct: false }]
        if (value === 'qcm' || value === 'qcm_multi') defaultOptions = [
          { text: '', correct: false }, { text: '', correct: false },
          { text: '', correct: true }, { text: '', correct: false },
        ]
        if (value === 'relier') defaultOptions = [
          { gauche: '', droite: '' }, { gauche: '', droite: '' }
        ]
        if (value === 'ordre') defaultOptions = [
          { text: '', position: 1 }, { text: '', position: 2 }, { text: '', position: 3 }
        ]
        return { ...q, type: value, options: defaultOptions }
      }
      return { ...q, [field]: value }
    }))
  }

  function updateOption(questionId: string, optIdx: number, field: string, value: any) {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q
      const opts = [...(q.options || [])]
      opts[optIdx] = { ...opts[optIdx], [field]: value }
      // Pour QCM (une seule), désélectionner les autres si on coche correct
      if (field === 'correct' && value === true && q.type === 'qcm') {
        opts.forEach((o, i) => { if (i !== optIdx) o.correct = false })
      }
      return { ...q, options: opts }
    }))
  }

  function addOption(questionId: string) {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q
      const isRelier = q.type === 'relier'
      const isOrdre = q.type === 'ordre'
      const newOpt = isRelier
        ? { gauche: '', droite: '' }
        : isOrdre
        ? { text: '', position: (q.options?.length || 0) + 1 }
        : { text: '', correct: false }
      return { ...q, options: [...(q.options || []), newOpt] }
    }))
  }

  function removeOption(questionId: string, optIdx: number) {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q
      return { ...q, options: q.options.filter((_: any, i: number) => i !== optIdx) }
    }))
  }

  if (loading) return <div className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Total: {questions.reduce((a, q) => a + (q.points || 1), 0)} pts
        </p>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {/* Header question */}
          <div className="flex items-center gap-2 px-4 py-3"
            style={{ background: 'var(--bg-secondary)' }}>
            <GripVertical size={14} style={{ color: 'var(--text-secondary)' }} />
            <span className="badge badge-orange text-[10px]">Q{qi + 1}</span>
            <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {q.question || 'Nouvelle question'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {QUESTION_TYPES.find(t => t.value === q.type)?.icon} {q.points}pt
            </span>
            <button
              onClick={() => saveQuestion(q)}
              disabled={saving === q.id}
              className="text-xs px-2 py-1 rounded" style={{ background: 'var(--safe)', color: 'white' }}>
              {saving === q.id ? '...' : '✓'}
            </button>
            <button onClick={() => updateQuestion(q.id, 'expanded', !q.expanded)}
              style={{ color: 'var(--text-secondary)' }}>
              {q.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button onClick={() => deleteQuestion(q.id)} className="text-red-400">
              <Trash2 size={14} />
            </button>
          </div>

          {q.expanded && (
            <div className="p-4 space-y-4">
              {/* Type de question */}
              <div>
                <label className="input-label">Type de question</label>
                <select value={q.type}
                  onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                  className="input-field text-sm">
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              {/* Texte de la question */}
              <div>
                <label className="input-label">Question *</label>
                <textarea
                  value={q.question}
                  onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                  placeholder="Saisissez votre question..."
                  rows={2} className="input-field text-sm" />
              </div>

              {/* Options selon le type */}
              {(q.type === 'qcm' || q.type === 'qcm_multi') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label mb-0">
                      Options {q.type === 'qcm' ? '(1 bonne réponse)' : '(plusieurs bonnes réponses)'}
                    </label>
                    <button onClick={() => addOption(q.id)}
                      className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                      <Plus size={11} />Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, oi: number) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateOption(q.id, oi, 'correct', !opt.correct)}
                          className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                          style={opt.correct
                            ? { background: 'var(--safe)', borderColor: 'var(--safe)' }
                            : { borderColor: 'var(--border)' }
                          }
                        >
                          {opt.correct && <Check size={11} className="text-white" />}
                        </button>
                        <input
                          type="text"
                          value={opt.text || ''}
                          onChange={e => updateOption(q.id, oi, 'text', e.target.value)}
                          placeholder={`Option ${oi + 1}...`}
                          className="input-field text-sm flex-1 py-1.5"
                        />
                        <button onClick={() => removeOption(q.id, oi)}
                          className="text-red-400 flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    ✓ = Bonne(s) réponse(s)
                  </p>
                </div>
              )}

              {q.type === 'vrai_faux' && (
                <div>
                  <label className="input-label">Bonne réponse</label>
                  <div className="flex gap-3">
                    {['Vrai', 'Faux'].map(val => (
                      <button key={val} type="button"
                        onClick={() => updateQuestion(q.id, 'reponse_correcte', val)}
                        className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                        style={q.reponse_correcte === val
                          ? { borderColor: 'var(--safe)', background: 'rgba(0,200,150,0.1)', color: 'var(--safe)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                        }>
                        {val === 'Vrai' ? '✅' : '❌'} {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.type === 'texte_libre' && (
                <div>
                  <label className="input-label">Réponse attendue (pour correction automatique)</label>
                  <input
                    type="text"
                    value={q.reponse_correcte || ''}
                    onChange={e => updateQuestion(q.id, 'reponse_correcte', e.target.value)}
                    placeholder="Réponse correcte attendue..."
                    className="input-field text-sm"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Laissez vide pour une correction manuelle par l'admin.
                  </p>
                </div>
              )}

              {q.type === 'relier' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label mb-0">Paires à relier</label>
                    <button onClick={() => addOption(q.id)}
                      className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                      <Plus size={11} />Ajouter une paire
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, oi: number) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.gauche || ''}
                          onChange={e => updateOption(q.id, oi, 'gauche', e.target.value)}
                          placeholder={`Colonne gauche ${oi + 1}`}
                          className="input-field text-sm flex-1 py-1.5"
                        />
                        <span style={{ color: 'var(--orange)' }}>↔</span>
                        <input
                          type="text"
                          value={opt.droite || ''}
                          onChange={e => updateOption(q.id, oi, 'droite', e.target.value)}
                          placeholder={`Colonne droite ${oi + 1}`}
                          className="input-field text-sm flex-1 py-1.5"
                        />
                        <button onClick={() => removeOption(q.id, oi)} className="text-red-400 flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.type === 'remplir' && (
                <div>
                  <label className="input-label">Texte avec champs vides</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Utilisez <code className="px-1 rounded" style={{ background: 'var(--navy-600)' }}>{'{{1}}'}</code>,{' '}
                    <code className="px-1 rounded" style={{ background: 'var(--navy-600)' }}>{'{{2}}'}</code>, etc. pour marquer les champs à compléter.
                  </p>
                  <textarea
                    value={q.reponse_correcte || ''}
                    onChange={e => updateQuestion(q.id, 'reponse_correcte', e.target.value)}
                    placeholder="Ex: La securite au travail est la {'{{1}}'} de tout employeur."
                    rows={3} className="input-field text-sm font-mono"
                  />
                  <div className="mt-3 space-y-2">
                    <label className="input-label">Réponses correctes pour chaque champ</label>
                    {[1, 2, 3].map(n => (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs flex-shrink-0 px-2 py-1 rounded"
                          style={{ background: 'var(--navy-600)', color: 'var(--text-secondary)' }}>
                          {`{{${n}}}`}
                        </span>
                        <input
                          type="text"
                          value={(q.options || [])[n - 1]?.text || ''}
                          onChange={e => {
                            const opts = [...(q.options || [{ text: '' }, { text: '' }, { text: '' }])]
                            while (opts.length < n) opts.push({ text: '' })
                            opts[n - 1] = { text: e.target.value }
                            updateQuestion(q.id, 'options', opts)
                          }}
                          placeholder={`Réponse pour champ ${n}...`}
                          className="input-field text-sm flex-1 py-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.type === 'ordre' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="input-label mb-0">Éléments à remettre dans l'ordre</label>
                    <button onClick={() => addOption(q.id)}
                      className="text-xs flex items-center gap-1" style={{ color: 'var(--orange)' }}>
                      <Plus size={11} />Ajouter
                    </button>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Saisissez les éléments dans le bon ordre.
                  </p>
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, oi: number) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--orange)', color: 'white' }}>
                          {oi + 1}
                        </span>
                        <input
                          type="text"
                          value={opt.text || ''}
                          onChange={e => updateOption(q.id, oi, 'text', e.target.value)}
                          placeholder={`Étape ${oi + 1}...`}
                          className="input-field text-sm flex-1 py-1.5"
                        />
                        <button onClick={() => removeOption(q.id, oi)} className="text-red-400 flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points et explication */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Points</label>
                  <input
                    type="number" min="1" max="10"
                    value={q.points || 1}
                    onChange={e => updateQuestion(q.id, 'points', parseInt(e.target.value) || 1)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">Explication (après réponse)</label>
                  <input
                    type="text"
                    value={q.explication || ''}
                    onChange={e => updateQuestion(q.id, 'explication', e.target.value)}
                    placeholder="Pourquoi cette réponse..."
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => saveQuestion(q)}
                disabled={saving === q.id}
                className="btn-primary w-full justify-center py-2 text-sm"
              >
                <Check size={14} />{saving === q.id ? 'Sauvegarde...' : 'Sauvegarder cette question'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Ajouter une question */}
      <button
        onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <Plus size={16} />Ajouter une question
      </button>
    </div>
  )
}
