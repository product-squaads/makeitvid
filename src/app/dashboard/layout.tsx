import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - makeitvid',
  description: 'Manage your video projects and create new AI-powered video summaries from your documents.',
  openGraph: {
    title: 'Dashboard - makeitvid',
    description: 'Manage your video projects and create new AI-powered video summaries.',
    type: 'website',
  },
  robots: {
    index: false, // Dashboard pages are usually not indexed
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}