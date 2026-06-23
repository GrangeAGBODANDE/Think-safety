'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Bold, Italic, Underline as UIcon, Heading2, Heading3,
  Quote, List, ListOrdered, Image as ImgIcon, Video,
  Highlighter, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Minus, Code, Upload
} from 'lucide-react'

interface Props { value: string; onChange: (html: string) => void; color?: string }

const Sep = () => <div style={{width:'1px',background:'var(--border)',margin:'2px 3px',alignSelf:'stretch'}}/>

export default function RichEditor({ value, onChange, color = '#FF6B35' }: Props) {
  const [imgUrl,    setImgUrl]    = useState('')
  const [vidUrl,    setVidUrl]    = useState('')
  const [showImg,   setShowImg]   = useState(false)
  const [showVid,   setShowVid]   = useState(false)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt.configure({ HTMLAttributes: { class: 'rich-img' } }),
      Youtube.configure({ controls: true, nocookie: true, HTMLAttributes: { class: 'rich-video' } }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
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

  if (!editor) return (
    <div style={{padding:'20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'13px'}}>
      Chargement de l&apos;éditeur...
    </div>
  )

  const TB = ({ onClick, active, title, children }: any) => (
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

  const insertImgUrl = () => {
    if (imgUrl.trim()) {
      editor.chain().focus().setImage({ src: imgUrl }).run()
      setImgUrl(''); setShowImg(false)
    }
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `images/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('modules-images').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('modules-images').getPublicUrl(data.path)
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run()
    }
    setUploading(false); setShowImg(false)
  }

  const insertVideo = () => {
    if (vidUrl.trim()) {
      editor.chain().focus().setYoutubeVideo({ src: vidUrl }).run()
      setVidUrl(''); setShowVid(false)
    }
  }

  return (
    <div style={{border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden',background:'var(--bg-secondary)'}}>

      {/* ── BARRE D'OUTILS ── */}
      <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'2px',padding:'6px 8px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)'}}>
        <TB onClick={()=>editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras"><Bold size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique"><Italic size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné"><UIcon size={13}/></TB>
        <Sep/>
        <TB onClick={()=>editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})} title="Titre H2"><Heading2 size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive('heading',{level:3})} title="Titre H3"><Heading3 size={13}/></TB>
        <Sep/>
        <TB onClick={()=>editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Bloc citation"><Quote size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces"><List size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée"><ListOrdered size={13}/></TB>
        <Sep/>
        <TB onClick={()=>editor.chain().focus().toggleHighlight({color: color+'40'}).run()} active={editor.isActive('highlight')} title="Surligner"><Highlighter size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline"><Code size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur"><Minus size={13}/></TB>
        <Sep/>
        <TB onClick={()=>editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({textAlign:'left'})} title="Gauche"><AlignLeft size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({textAlign:'center'})} title="Centrer"><AlignCenter size={13}/></TB>
        <TB onClick={()=>editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({textAlign:'right'})} title="Droite"><AlignRight size={13}/></TB>
        <Sep/>
        <TB onClick={()=>setShowImg(!showImg)} active={showImg} title="Insérer image"><ImgIcon size={13}/></TB>
        <TB onClick={()=>setShowVid(!showVid)} active={showVid} title="Insérer vidéo YouTube"><Video size={13}/></TB>
        <div style={{marginLeft:'auto',display:'flex',gap:'2px'}}>
          <Sep/>
          <TB onClick={()=>editor.chain().focus().undo().run()} active={false} title="Annuler"><Undo size={13}/></TB>
          <TB onClick={()=>editor.chain().focus().redo().run()} active={false} title="Refaire"><Redo size={13}/></TB>
        </div>
      </div>

      {/* ── INSERTION IMAGE ── */}
      {showImg && (
        <div style={{display:'flex',gap:'8px',padding:'8px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)',alignItems:'center',flexWrap:'wrap'}}>
          <ImgIcon size={13} style={{color:color,flexShrink:0}}/>
          {/* Upload depuis l'ordinateur */}
          <label style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'8px',border:'1px solid '+color+'40',background:color+'10',color:color,cursor:'pointer',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>
            <Upload size={12}/>{uploading ? 'Upload...' : 'Depuis l\'ordi'}
            <input type="file" accept="image/*" style={{display:'none'}} disabled={uploading}
              onChange={async e=>{ const f=e.target.files?.[0]; if(f) await uploadImage(f) }}/>
          </label>
          <span style={{fontSize:'11px',color:'var(--text-secondary)',flexShrink:0}}>ou URL :</span>
          <input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertImgUrl()}
            placeholder="https://..."
            style={{flex:1,minWidth:'160px',padding:'6px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
          <button onClick={insertImgUrl} style={{padding:'6px 12px',borderRadius:'8px',background:color,color:'white',border:'none',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0}}>OK</button>
          <button onClick={()=>{setShowImg(false);setImgUrl('')}} style={{padding:'6px 8px',borderRadius:'8px',background:'var(--bg-secondary)',border:'1px solid var(--border)',fontSize:'12px',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0}}>✕</button>
        </div>
      )}

      {/* ── INSERTION VIDÉO ── */}
      {showVid && (
        <div style={{display:'flex',gap:'8px',padding:'8px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-card)',alignItems:'center'}}>
          <Video size={13} style={{color:'#ef4444',flexShrink:0}}/>
          <div style={{padding:'5px 10px',borderRadius:'7px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',fontSize:'11px',color:'#ef4444',fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>
            YouTube uniquement
          </div>
          <input value={vidUrl} onChange={e=>setVidUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&insertVideo()}
            placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
            style={{flex:1,padding:'6px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}/>
          <button onClick={insertVideo} style={{padding:'6px 12px',borderRadius:'8px',background:'#ef4444',color:'white',border:'none',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0}}>Insérer</button>
          <button onClick={()=>{setShowVid(false);setVidUrl('')}} style={{padding:'6px 8px',borderRadius:'8px',background:'var(--bg-secondary)',border:'1px solid var(--border)',fontSize:'12px',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0}}>✕</button>
        </div>
      )}

      {/* ── CONTENU ÉDITEUR ── */}
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
        .rich-content code{background:var(--bg-card);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:var(--orange)}
        .rich-content hr{border:none;border-top:2px solid var(--border);margin:20px 0}
        .ProseMirror-focused{outline:none}
      `}</style>
      <EditorContent editor={editor}/>
    </div>
  )
}