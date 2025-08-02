import { SignIn } from '@clerk/nextjs'

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