'use client'

import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { ArrowLeft, Save, Settings, Loader2 } from 'lucide-react'

interface ProjectHeaderProps {
  onSaveProject: () => void
  isSaving: boolean
  hasContent: boolean
  onOpenSettings: () => void
}

export function ProjectHeader({
  onSaveProject,
  isSaving,
  hasContent,
  onOpenSettings
}: ProjectHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Create New Video</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSaveProject}
              disabled={isSaving || !hasContent}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Project
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}