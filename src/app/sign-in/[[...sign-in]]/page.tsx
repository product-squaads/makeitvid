import { SignIn } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - makeitvid',
  description: 'Sign in to your makeitvid account to create and manage AI-powered video summaries.',
  openGraph: {
    title: 'Sign In - makeitvid',
    description: 'Sign in to your makeitvid account.',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              'bg-purple-600 hover:bg-purple-700 text-sm normal-case'
          }
        }}
      />
    </div>
  )
}