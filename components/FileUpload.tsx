'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image, FileText, Loader2, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  bucket: 'course-covers' | 'lesson-pdfs' | 'lesson-images'
  accept: string
  label: string
  currentUrl?: string
  onUpload: (url: string, fileName: string) => void
  maxSizeMB?: number
}

export default function FileUpload({
  bucket, accept, label, currentUrl, onUpload, maxSizeMB = 10
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isImage = accept.includes('image')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxSizeMB}MB)`)
      return
    }

    setError('')
    setUploading(true)
    setSuccess(false)

    // Preview local pour les images
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }

    // Nom unique
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = fileName

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError(`Erreur upload: ${uploadError.message}`)
      setUploading(false)
      return
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    onUpload(publicUrl, file.name)
    setSuccess(true)
    setUploading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  function handleRemove() {
    setPreview(null)
    onUpload('', '')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="input-label">{label}</label>

      {/* Zone de drop / preview */}
      {preview && isImage ? (
        <div className="relative group rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: 'var(--orange)' }}
            >
              <Upload size={14} />Changer
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-red-500"
            >
              <X size={14} />Supprimer
            </button>
          </div>
        </div>
      ) : preview && !isImage ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <FileText size={20} style={{ color: 'var(--orange)' }} />
          <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
            Fichier uploadé
          </span>
          <button type="button" onClick={handleRemove} className="text-red-400 hover:bg-red-500/10 p-1 rounded">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
          style={{ borderColor: 'var(--border)' }}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--orange)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upload en cours...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={28} style={{ color: 'var(--safe)' }} />
              <p className="text-sm" style={{ color: 'var(--safe)' }}>Fichier uploadé !</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--bg-secondary)' }}>
                {isImage ? <Image size={24} style={{ color: 'var(--text-secondary)' }} /> : <FileText size={24} style={{ color: 'var(--text-secondary)' }} />}
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Cliquez pour uploader
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {accept.includes('image') ? 'JPG, PNG, WebP' : 'PDF'} · Max {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs mt-1 text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
