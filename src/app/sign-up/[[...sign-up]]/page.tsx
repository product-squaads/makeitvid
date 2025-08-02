import { SignUp } from '@clerk/nextjs'

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