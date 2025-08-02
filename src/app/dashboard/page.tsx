import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">makeitvid Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName || user.username || 'User'}!
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium mb-4">Your Videos</h2>
          <p className="text-gray-600">No videos yet. Create your first video!</p>
          
          <button className="mt-4 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
            Create New Video
          </button>
        </div>
      </main>
    </div>
  )
}