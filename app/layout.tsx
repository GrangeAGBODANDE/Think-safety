import type { Metadata } from 'next'
import { DM_Sans, Rajdhani, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('ts_theme') || 'dark';
                if (t === 'auto') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', t);
                var l = localStorage.getItem('ts_lang') || 'fr';
                document.documentElement.lang = l;
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
