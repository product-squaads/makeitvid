'use client'

import { useUser } from '@clerk/nextjs'
import { redirect, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Loader2, 
  Plus, 
  Calendar,
  Clock,
  FileText,
  Trash2,
  Play,
  Settings
} from 'lucide-react'
import { SettingsModal } from '@/components/settings-modal'

interface VideoProject {
  id: string
  title: string
  content: string
  scriptSections: any[]
  audioUrls: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'generating' | 'completed'
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<VideoProject[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load projects from localStorage
    const loadedProjects = JSON.parse(localStorage.getItem('video_projects') || '[]')
    setProjects(loadedProjects)
    setIsLoading(false)
  }, [])

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  if (!user) {
    redirect('/sign-in')
  }

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId)
      setProjects(updatedProjects)
      localStorage.setItem('video_projects', JSON.stringify(updatedProjects))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: VideoProject['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draft</span>
      case 'generating':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Generating</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Completed</span>
    }
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
              <button
                onClick={() => setShowSettings(true)}
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
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Videos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and continue working on your video projects
            </p>
          </div>
          <Button 
            onClick={() => router.push('/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Video
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first AI-powered video
            </p>
            <Button 
              onClick={() => router.push('/create')}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Video
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/create?id=${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {project.title}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {project.content || 'No content yet...'}
                </p>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>{project.scriptSections.length} sections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {project.status === 'completed' && project.audioUrls.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Play first audio
                          const audio = new Audio(project.audioUrls[0])
                          audio.play()
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Play preview"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <SettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </div>
  )
}