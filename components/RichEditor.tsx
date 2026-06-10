'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'
import {
  Bold, Italic, Underline as UIcon, Heading2, Heading3,
  Quote, List, ListOrdered, Image as ImgIcon, Video,
  Highlighter, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Minus, Code
} from 'lucide-react'

interface Props { value: string; onChange: (html: string) => void; color?: string }

const TB = ({ onClick, active, title, children, color }: any) => (
  <button type="button" onClick={onClick} title={title}
    style={{padding:'5px 7px',borderRadius:'6px',border:'none',cursor:'pointer',
      background: active ? color+'25' : 'transparent',
      color: active ? color : 'var(--text-secondary)',
      display:'flex',alignItems:'center',transition:'all 0.1s'}}
    onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='var(--bg-main)' }}
    onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='transparent' }}>
    {children}
  </button>
)
const Sep = () => <div style={{width:'1px',background:'var(--border)',margin:'2px 3px',alignSelf:'stretch'}}/>

export default function RichEditor({ value, onChange, color = '#FF6B35' }: Props) {
  const [imgUrl,   setImgUrl]   = useState('')
  const [vidUrl,   setVidUrl]   = useState('')
  const [showImg,  setShowImg]  = useState(false)
  const [showVid,  setShowVid]  = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt.configure({ HTMLAttributes: { class: 'rich-img' } }),
      Youtube.configure({ controls: true, nocookie: true, HTMLAttributes: { class: 'rich-video' } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'rich-content', style: 'min-height:280px;padding:20px;outline:none;' }
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value])

  if (!editor) return <div style={{padding:'20px',color:'var(--text-secondary)',fontSize:'13px'}}>Chargement de l&apos;éditeur...</div>

  const btn = (onClick: ()=>void, active: boolean, title: string, Icon: any) => (
    <TB onClick={onClick} active={active} title={title} color={color}><Icon size={13}/></TB>
  )

  const insertImg = () => {
    if (imgUrl.trim()) { editor.chain().focus().setImage({ src: imgUrl }).run(); setImgUrl(''); setShowImg(false) }
  }
  const insertVid = () => {
    if (vidUrl.trim()) { editor.chain().focus().setYoutubeVideo({ src: vidUrl }).run(); setVidUrl(''); setShowVid(false) }
  }

  return (
    <div style={{border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden',background:'var(--bg-secondary)'}}>
      
      {/* BARRE D'OUTILS */}
      <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'2px',padding:'6px 8px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)'}}>
        {btn(()=>editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Gras (Ctrl+B)', Bold)}
        {btn(()=>editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italique (Ctrl+I)', Italic)}
        {btn(()=>editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Souligné (Ctrl+U)', UIcon)}
        <Sep/>
        {btn(()=>editor.chain().focus().toggleHeading({level:2}).run(), editor.isActive('heading',{level:2}), 'Titre de section (H2)', Heading2)}
        {btn(()=>editor.chain().focus().toggleHeading({level:3}).run(), editor.isActive('heading',{level:3}), 'Sous-titre (H3)', Heading3)}
        <Sep/>
        {btn(()=>editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Bloc citation', Quote)}
        {btn(()=>editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Liste à puces', List)}
        {btn(()=>editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Liste numérotée', ListOrdered)}
        <Sep/>
        {btn(()=>editor.chain().focus().toggleHighlight({color: color+'40'}).run(), editor.isActive('highlight'), 'Surligner', Highlighter)}
        {btn(()=>editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Code inline', Code)}
        <Sep/>
        {btn(()=>setShowImg(!showImg), showImg, 'Insérer image', ImgIcon)}
        {btn(()=>setShowVid(!showVid), showVid, 'Insérer vidéo YouTube', Video)}
        {btn(()=>editor.chain().focus().setHorizontalRule().run(), false, 'Séparateur horizontal', Minus)}
        <Sep/>
        {btn(()=>editor.chain().focus().setTextAlign('left').run(), editor.isActive({textAlign:'left'}), 'Aligner gauche', AlignLeft)}
        {btn(()=>editor.chain().focus().setTextAlign('center').run(), editor.isActive({textAlign:'center'}), 'Centrer', AlignCenter)}
        {btn(()=>editor.chain().focus().setTextAlign('right').run(), editor.isActive({textAlign:'right'}), 'Aligner droite', AlignRight)}
        <div style={{marginLeft:'auto',display:'flex',gap:'2px'}}>
          <Sep/>
          {btn(()=>editor.chain().focus().undo().run(), false, 'Annuler (Ctrl+Z)', Undo)}
          {btn(()=>editor.chain().focus().redo().run(), false, 'Refaire (Ctrl+Y)', Redo)}
        </div>
      </div>

      {/* INSERTION IMAGE */}
      {showImg && (
        <div style={{display:'flex',gap:'8px',padding:'8px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)'}}>
          <ImgIcon size={14} style={{color:color,flexShrink:0,marginTop:'9px'}}/>
          <input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertImg()}
            placeholder="URL de l'image (https://...)" autoFocus
            style={{flex:1,padding:'7px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
          <button onClick={insertImg} style={{padding:'7px 14px',borderRadius:'8px',background:color,color:'white',border:'none',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>Insérer</button>
          <button onClick={()=>setShowImg(false)} style={{padding:'7px 10px',borderRadius:'8px',background:'var(--bg-secondary)',border:'1px solid var(--border)',fontSize:'12px',cursor:'pointer',color:'var(--text-secondary)'}}>✕</button>
        </div>
      )}

      {/* INSERTION VIDÉO */}
      {showVid && (
        <div style={{display:'flex',gap:'8px',padding:'8px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)'}}>
          <Video size={14} style={{color:'#ef4444',flexShrink:0,marginTop:'9px'}}/>
          <input value={vidUrl} onChange={e=>setVidUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertVid()}
            placeholder="URL YouTube (https://youtube.com/watch?v=...)" autoFocus
            style={{flex:1,padding:'7px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
          <button onClick={insertVid} style={{padding:'7px 14px',borderRadius:'8px',background:'#ef4444',color:'white',border:'none',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>Insérer</button>
          <button onClick={()=>setShowVid(false)} style={{padding:'7px 10px',borderRadius:'8px',background:'var(--bg-secondary)',border:'1px solid var(--border)',fontSize:'12px',cursor:'pointer',color:'var(--text-secondary)'}}>✕</button>
        </div>
      )}

      {/* CONTENU ÉDITEUR */}
      <style>{`
        .rich-content h2{font-size:1.1rem;font-weight:900;color:${color};margin:20px 0 10px;padding-top:8px;border-top:1px solid var(--border)}
        .rich-content h3{font-size:1rem;font-weight:700;color:var(--text-primary);margin:14px 0 6px}
        .rich-content p{font-size:14px;line-height:1.9;color:var(--text-secondary);margin:0 0 10px}
        .rich-content blockquote{padding:14px 18px;border-left:4px solid ${color};background:${color}12;border-radius:0 10px 10px 0;margin:14px 0;font-style:italic}
        .rich-content blockquote p{color:var(--text-primary);margin:0}
        .rich-content ul,.rich-content ol{padding-left:20px;margin:0 0 10px}
        .rich-content li{font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:4px}
        .rich-content img.rich-img{max-width:100%;border-radius:12px;border:1px solid var(--border);margin:14px 0;display:block}
        .rich-content .rich-video{width:100%;aspect-ratio:16/9;border-radius:12px;margin:14px 0;display:block;border:none}
        .rich-content mark{background:${color}35;color:var(--text-primary);border-radius:3px;padding:1px 3px}
        .rich-content strong{color:var(--text-primary);font-weight:700}
        .rich-content code{background:var(--bg-card);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px}
        .rich-content hr{border:none;border-top:1px solid var(--border);margin:20px 0}
        .ProseMirror-focused{outline:none}
      `}</style>
      <EditorContent editor={editor}/>
    </div>
  )
}