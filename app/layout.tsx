import type { Metadata } from 'next'
import { DM_Sans, Rajdhani, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import TranslateWidget from '@/components/TranslateWidget'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Think Safety — Formation Securite Afrique de l\'Ouest',
  description: 'Plateforme gratuite de formation a la securite au travail pour tous les secteurs professionnels d\'Afrique de l\'Ouest.',
  keywords: 'securite travail, formation HSE, EPI, Benin, Afrique Ouest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Script inline pour appliquer le thème AVANT le rendu — évite le flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('ts_theme') || 'dark';
                if (t === 'auto') {
                  t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', t);

                // Restaurer la langue et direction
                var lang = localStorage.getItem('ts_ui_lang') || 'fr';
                if (lang === 'ar') document.documentElement.dir = 'rtl';
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          {children}

          {/*
            TranslateWidget charge Google Translate invisiblement.
            Il traduit automatiquement TOUT le texte du site
            (navbar, pages, admin, boutons, formulaires...)
            sans aucune modification sur les pages individuelles.
          */}
          <TranslateWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
