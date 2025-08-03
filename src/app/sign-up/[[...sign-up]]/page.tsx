import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - makeitvid',
  description: 'Create your free makeitvid account to start transforming documents into engaging video summaries with AI.',
  openGraph: {
    title: 'Sign Up - makeitvid',
    description: 'Create your free makeitvid account to start creating AI-powered video summaries.',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <SignUp 
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