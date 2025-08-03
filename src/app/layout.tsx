import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'makeitvid - AI-Powered Video Generation',
  description: 'Transform documents into engaging video summaries with AI. Open-source alternative to NotebookLM for creating narrated video overviews from PDFs, research papers, and documents.',
  keywords: ['video generation', 'AI video', 'document to video', 'NotebookLM alternative', 'open source', 'video summaries', 'research video', 'educational video', 'AI narration'],
  authors: [{ name: 'makeitvid' }],
  creator: 'makeitvid',
  publisher: 'makeitvid',
  generator: 'Next.js',
  applicationName: 'makeitvid',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://makeitvid.com'), // Update with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'makeitvid - AI-Powered Video Generation',
    description: 'Transform documents into engaging video summaries with AI. Open-source alternative to NotebookLM.',
    url: 'https://makeitvid.com',
    siteName: 'makeitvid',
    images: [
      {
        url: '/seo/makeitvid-background-seo.png',
        width: 1200,
        height: 630,
        alt: 'makeitvid - Transform documents into engaging video summaries',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'makeitvid - AI-Powered Video Generation',
    description: 'Transform documents into engaging video summaries with AI. Open-source alternative to NotebookLM.',
    creator: '@makeitvid', // Update with your Twitter handle
    images: ['/seo/makeitvid-background-seo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Add your verification code
    yandex: 'yandex-verification-code', // Optional
    yahoo: 'yahoo-verification-code', // Optional
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
