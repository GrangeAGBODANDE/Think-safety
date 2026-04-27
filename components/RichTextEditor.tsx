'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Link, Image,
  Heading1, Heading2, Heading3, Minus, Undo, Redo,
  Type, Highlighter
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({
  value, onChange, placeholder = 'Rédigez le contenu de la leçon...', minHeight = 300
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleChange()
  }

  function handleChange() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function insertLink() {
    const url = prompt('URL du lien :')
    if (url) exec('createLink', url)
  }

  function insertImage() {
    const url = prompt('URL de l\'image :')
    if (url) exec('insertImage', url)
  }

  function setFontSize(size: string) {
    exec('fontSize', size)
  }

  function setHeading(tag: string) {
    exec('formatBlock', tag)
  }

  function setColor(color: string) {
    exec('foreColor', color)
  }

  function setHighlight(color: string) {
    exec('hiliteColor', color)
  }

  const ToolbarBtn = ({ onClick, title, children, active = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded flex items-center justify-center transition-all flex-shrink-0"
      style={active
        ? { background: 'rgba(212,80,15,0.2)', color: 'var(--orange)' }
        : { color: 'var(--text-secondary)' }
      }
      onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-600)'}
      onMouseLeave={e => e.currentTarget.style.background = active ? 'rgba(212,80,15,0.2)' : 'transparent'}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 mx-0.5 flex-shrink-0" style={{ background: 'var(--border)' }} />

  return (
    <div
      className="border rounded-xl overflow-hidden"
      style={{
        borderColor: isFocused ? 'var(--orange)' : 'var(--border)',
        boxShadow: isFocused ? '0 0 0 3px rgba(212,80,15,0.1)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap border-b"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Annuler/Rétablir */}
        <ToolbarBtn onClick={() => exec('undo')} title="Annuler"><Undo size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('redo')} title="Rétablir"><Redo size={14} /></ToolbarBtn>
        <Divider />

        {/* Titres */}
        <ToolbarBtn onClick={() => setHeading('h1')} title="Titre 1"><Heading1 size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => setHeading('h2')} title="Titre 2"><Heading2 size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => setHeading('h3')} title="Titre 3"><Heading3 size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => setHeading('p')} title="Paragraphe"><Type size={14} /></ToolbarBtn>
        <Divider />

        {/* Formatage texte */}
        <ToolbarBtn onClick={() => exec('bold')} title="Gras"><Bold size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} title="Italique"><Italic size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} title="Souligné"><Underline size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('strikeThrough')} title="Barré"><Strikethrough size={14} /></ToolbarBtn>
        <Divider />

        {/* Couleurs */}
        <div className="flex items-center gap-0.5">
          {['#FF4757', '#FF6B35', '#FFD700', '#00C896', '#2196F3', '#9C27B0'].map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setColor(color)}
              title={`Couleur ${color}`}
              className="w-4 h-4 rounded-sm border transition-transform hover:scale-125 flex-shrink-0"
              style={{ background: color, borderColor: 'var(--border)' }}
            />
          ))}
        </div>
        <Divider />

        {/* Alignement */}
        <ToolbarBtn onClick={() => exec('justifyLeft')} title="Gauche"><AlignLeft size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} title="Centre"><AlignCenter size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyRight')} title="Droite"><AlignRight size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyFull')} title="Justifier"><AlignJustify size={14} /></ToolbarBtn>
        <Divider />

        {/* Listes */}
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock', 'blockquote')} title="Citation"><Quote size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('formatBlock', 'pre')} title="Code"><Code size={14} /></ToolbarBtn>
        <Divider />

        {/* Liens & Images */}
        <ToolbarBtn onClick={insertLink} title="Insérer un lien"><Link size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertHorizontalRule')} title="Ligne de séparation"><Minus size={14} /></ToolbarBtn>
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        className="outline-none p-4 text-sm leading-relaxed"
        style={{
          minHeight: `${minHeight}px`,
          color: 'var(--text-primary)',
          background: 'var(--bg-input)',
        }}
      />

      {/* CSS pour le contenu */}
      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--input-placeholder);
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0; }
        [contenteditable] h2 { font-size: 1.25rem; font-weight: 600; margin: 0.6rem 0; }
        [contenteditable] h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
        [contenteditable] p { margin: 0.5rem 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] blockquote {
          border-left: 3px solid var(--orange);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        [contenteditable] pre {
          background: var(--navy-700);
          padding: 0.75rem;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.85rem;
          overflow-x: auto;
        }
        [contenteditable] a { color: var(--orange); text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; }
        [contenteditable] hr { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
      `}</style>
    </div>
  )
}
