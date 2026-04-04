'use client'
import { useState } from 'react'
import { Download, FileText, X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'

interface DocumentViewerProps {
  url: string
  titre?: string
  pages?: number
}

export default function DocumentViewer({ url, titre, pages }: DocumentViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)

  if (!url) {
    return (
      <div className="w-full h-64 bg-navy-700 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <FileText size={40} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">Aucun fichier disponible</p>
        </div>
      </div>
    )
  }

  const isPDF = url?.toLowerCase().includes('.pdf')

  if (!isPDF) {
    return (
      <div className="w-full bg-navy-800 border border-white/10 rounded-xl p-6 text-center">
        <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--orange)' }} />
        <h3 className="text-white font-medium mb-2">{titre || 'Document'}</h3>
        {pages && <p className="text-white/40 text-sm mb-4">{pages} pages</p>}
        <div className="flex gap-3 justify-center">
          <a href={url} target="_blank" rel="noreferrer" className="btn-primary py-2 px-5 text-sm">
            <Maximize2 size={14} />Ouvrir
          </a>
          <a href={url} download className="btn-secondary py-2 px-5 text-sm">
            <Download size={14} />Telecharger
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full bg-navy-800 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-navy-700">
          <div className="flex items-center gap-3">
            <FileText size={16} style={{ color: 'var(--orange)' }} />
            <span className="text-white text-sm font-medium truncate max-w-xs">{titre || 'Document'}</span>
            {pages && <span className="text-white/40 text-xs">{pages} pages</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <ZoomOut size={15} />
            </button>
            <span className="text-white/50 text-xs w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <ZoomIn size={15} />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button onClick={() => setFullscreen(true)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Maximize2 size={15} />
            </button>
            <a href={url} download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              <Download size={14} />Telecharger
            </a>
          </div>
        </div>

        <div style={{ height: '600px', overflow: 'hidden', position: 'relative' }}>
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            title={titre || 'Document'}
          />
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileText size={16} style={{ color: 'var(--orange)' }} />
              <span className="text-white text-sm font-medium">{titre}</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={url} download className="btn-secondary py-1.5 px-4 text-xs">
                <Download size={13} />Telecharger
              </a>
              <button onClick={() => setFullscreen(false)}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${url}#toolbar=1&navpanes=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={titre || 'Document'}
            />
          </div>
        </div>
      )}
    </>
  )
}
