'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
    doGTranslate: (lang: string) => void
  }
}

export default function TranslateWidget() {
  useEffect(() => {
    // Masquer tout l'UI Google Translate (barre, tooltip, highlights)
    const style = document.createElement('style')
    style.id = 'hide-google-translate'
    style.innerHTML = `
      /* Masquer la barre Google Translate */
      .goog-te-banner-frame,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-tooltip,
      .goog-tooltip:hover {
        display: none !important;
        visibility: hidden !important;
      }

      /* Eviter le decalage du body */
      body { top: 0 !important; }
      .skiptranslate { display: none !important; }

      /* Masquer le surlignage Google Translate */
      .goog-text-highlight {
        background-color: transparent !important;
        box-shadow: none !important;
      }

      /* Masquer l'iframe Google */
      iframe.goog-te-banner-frame {
        display: none !important;
      }
    `
    document.head.appendChild(style)

    // Fonction appelée par le script Google Translate
    window.googleTranslateElementInit = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,en,es,zh-CN,de,ko,ru,ar',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            gaTrack: false,
          },
          'google_translate_element'
        )
      }
    }

    // Fonction globale pour changer de langue programmatiquement
    window.doGTranslate = function (langPair: string) {
      if (!langPair) return
      const lang = langPair.split('|')
      if (!lang[1]) return

      // Trouver le select Google Translate et changer la valeur
      function tryTranslate() {
        const selects = document.querySelectorAll('select.goog-te-combo')
        if (selects.length === 0) {
          setTimeout(tryTranslate, 300)
          return
        }

        const select = selects[0] as HTMLSelectElement

        // Si on revient au français, reset via cookie
        if (lang[1] === 'fr') {
          // Supprimer les cookies Google Translate
          const hostname = window.location.hostname
          const cookieDomains = [hostname, '.' + hostname, window.location.hostname]
          cookieDomains.forEach(domain => {
            document.cookie = `googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`
          })
          document.cookie = `googtrans=/fr/fr; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`

          // Trouver le bouton "Restaurer" dans l'iframe Google
          const iframe = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement
          if (iframe) {
            try {
              const innerDoc = iframe.contentDocument || iframe.contentWindow?.document
              const restoreBtn = innerDoc?.querySelector('button.restore') as HTMLElement
              if (restoreBtn) { restoreBtn.click(); return }
            } catch (e) {}
          }

          // Fallback: recharger sans cookie
          window.location.reload()
          return
        }

        // Changer vers la langue cible
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value === lang[1]) {
            select.value = lang[1]
            select.selectedIndex = i
            select.dispatchEvent(new Event('change', { bubbles: true }))
            break
          }
        }
      }

      tryTranslate()
    }

    // Charger le script Google Translate
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    return () => {
      // Cleanup
    }
  }, [])

  return (
    <div
      id="google_translate_element"
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        top: '-9999px',
        left: '-9999px',
      }}
    />
  )
}
