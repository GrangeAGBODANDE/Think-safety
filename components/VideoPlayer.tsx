'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

interface VideoPlayerProps {
  url: string
  title?: string
  autoplay?: boolean
}

export default function VideoPlayer({ url, title, autoplay = false }: VideoPlayerProps) {
  const [started, setStarted] = useState(autoplay)
  const videoId = getYouTubeId(url)

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-navy-800 flex items-center justify-center rounded-xl">
        <p className="text-white/40 text-sm">Lien video invalide</p>
      </div>
    )
  }

  const embedUrl = [
    `https://www.youtube-nocookie.com/embed/${videoId}`,
    '?rel=0',
    '&modestbranding=1',
    '&showinfo=0',
    '&iv_load_policy=3',
    '&cc_load_policy=0',
    '&playsinline=1',
    '&color=white',
    '&controls=1',
    started ? '&autoplay=1' : '',
  ].join('')

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ position: 'relative', background: '#000' }}>
      {/* Container avec overflow hidden pour masquer la barre YouTube */}
      <div style={{ position: 'relative', paddingBottom: 'calc(56.25% + 40px)', overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'calc(100% + 0px)',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title || 'Video'}
        />
        {/* Overlay pour masquer le logo YouTube en bas */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: '#000',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      </div>

      {/* Ecran de demarrage personnalise */}
      {!started && (
        <div
          onClick={() => setStarted(true)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          {/* Thumbnail YouTube */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(255,107,53,0.5)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Play size={30} fill="white" className="text-white ml-1" />
            </div>
            {title && (
              <p style={{ color: 'white', fontWeight: 600, maxWidth: 300, fontSize: 14 }}>{title}</p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Cliquez pour lancer</p>
          </div>
        </div>
      )}
    </div>
  )
}
