import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export interface VideoProject {
  id: string
  title: string
  content: string
  scriptSections: any[]
  audioUrls: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'generating' | 'completed'
}

export function useProjectManagement() {
  const searchParams = useSearchParams()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [scriptSections, setScriptSections] = useState<any[]>([])
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Load existing project if ID is provided
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const projects = JSON.parse(localStorage.getItem('video_projects') || '[]')
      const project = projects.find((p: VideoProject) => p.id === id)
      if (project) {
        setProjectId(project.id)
        setTitle(project.title)
        setContent(project.content)
        setScriptSections(project.scriptSections || [])
        setAudioUrls(project.audioUrls || [])
      }
    }
  }, [searchParams])

  const saveProject = useCallback(async (silent = false) => {
    if (!silent) setIsSaving(true)
    
    const project: VideoProject = {
      id: projectId || Date.now().toString(),
      title: title || 'Untitled Video',
      content,
      scriptSections,
      audioUrls,
      createdAt: projectId ? 
        JSON.parse(localStorage.getItem('video_projects') || '[]')
          .find((p: VideoProject) => p.id === projectId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: audioUrls.length > 0 ? 'completed' : scriptSections.length > 0 ? 'generating' : 'draft'
    }

    const existingProjects = JSON.parse(localStorage.getItem('video_projects') || '[]')
    const projectIndex = existingProjects.findIndex((p: VideoProject) => p.id === project.id)
    
    if (projectIndex >= 0) {
      existingProjects[projectIndex] = project
    } else {
      existingProjects.unshift(project)
      setProjectId(project.id)
    }
    
    localStorage.setItem('video_projects', JSON.stringify(existingProjects))
    
    if (!silent) {
      setIsSaving(false)
    }
  }, [projectId, title, content, scriptSections, audioUrls])

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (projectId && (title || content || scriptSections.length > 0)) {
        saveProject(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [projectId, title, content, scriptSections, saveProject])

  return {
    projectId,
    title,
    setTitle,
    content,
    setContent,
    scriptSections,
    setScriptSections,
    audioUrls,
    setAudioUrls,
    saveProject,
    isSaving
  }
}