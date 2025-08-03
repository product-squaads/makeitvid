import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Video - makeitvid',
  description: 'Transform your documents into engaging video summaries. Upload PDFs, research papers, or any text document to create AI-narrated video overviews.',
  openGraph: {
    title: 'Create Video - makeitvid',
    description: 'Transform your documents into engaging video summaries with AI.',
    type: 'website',
  },
  robots: {
    index: false, // Create pages are usually not indexed
    follow: false,
  },
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}