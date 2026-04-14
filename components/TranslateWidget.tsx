/*'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

export default function TranslateWidget() {
  useEffect(() => {
    // 1. Masquer tout l'UI Google Translate
    const style = document.createElement('style')
    style.innerHTML = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-balloon-frame { display: none !important; }
      #goog-gt-tt { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-text-highlight { background: transparent !important; box-shadow: none !important; }
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      iframe.goog-te-banner-frame.skiptranslate { display: none !important; }
    `
    document.head.appendChild(style)

    // 2. Initialiser Google Translate
    window.googleTranslateElementInit = function () {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,en,es,zh-CN,de,ko,ru,ar',
            autoDisplay: false,
            gaTrack: false,
          },
          'google_translate_element'
        )
      }
    }

    // 3. Charger le script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
