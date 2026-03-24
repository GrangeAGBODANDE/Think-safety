import type { Metadata, Viewport } from 'next'
import { DM_Sans, Rajdhani, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

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
  title: {
    default: 'Think Safety - Formation Securite',
    template: '%s | Think Safety',
  },
  description: 'Plateforme gratuite de formation securite pour tous les secteurs.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1117',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${rajdhani.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-navy-900 text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
