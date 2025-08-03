'use client'

import { useUser } from '@clerk/nextjs'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Loader2, 
  Sparkles, 
  Volume2, 
  Settings, 
  Save, 
  Download,
  ArrowLeft,
  FileDown,
  PlayCircle,
  Presentation,
  RefreshCw,
  Palette
} from 'lucide-react'
import { SettingsModal } from '@/components/settings-modal'
import { HtmlSlidePreviewModal } from '@/components/html-slide-preview-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { slideThemes, animationTypes } from '@/lib/slide-themes'

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

function CreateVideoContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [scriptSections, setScriptSections] = useState<any[]>([])
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [audioGenerationStatus, setAudioGenerationStatus] = useState<Record<number, 'pending' | 'generating' | 'completed' | 'error'>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSlidePreview, setShowSlidePreview] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<any>(null)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [projectTheme, setProjectTheme] = useState('cosmic')
  const [projectAnimation, setProjectAnimation] = useState('dynamic')
  const [generateAudio, setGenerateAudio] = useState(true)

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
        
        // Initialize audio generation status based on existing audio
        const status: Record<number, 'pending' | 'generating' | 'completed' | 'error'> = {}
        project.scriptSections.forEach((_: any, index: number) => {
          status[index] = project.audioUrls[index] ? 'completed' : 'pending'
        })
        setAudioGenerationStatus(status)
      }
    }
  }, [searchParams])

  useEffect(() => {
    // Auto-save project every 30 seconds if there are changes
    const interval = setInterval(() => {
      if (projectId && (title || content || scriptSections.length > 0)) {
        saveProject(true) // Silent save
      }
    }, 30000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, title, content, scriptSections])

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
      // Show success message or notification
    }
  }, [projectId, title, content, scriptSections, audioUrls])

  const downloadAudio = async (url: string, index: number) => {
    try {
      // If it's a storage URL, fetch it first
      if (url.startsWith('/api/storage/') || url.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = url
        link.download = `section-${index + 1}-audio.wav`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For blob URLs, just download directly
        const link = document.createElement('a')
        link.href = url
        link.download = `section-${index + 1}-audio.wav`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading audio:', error)
    }
  }

  const downloadAllAudios = () => {
    audioUrls.forEach((url, index) => {
      if (url) {
        setTimeout(() => downloadAudio(url, index), index * 500) // Stagger downloads
      }
    })
  }

  const regenerateSlide = async (slideIndex: number) => {
    if (!scriptSections[slideIndex]) return
    
    // Check if API keys are set
    const useDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    const geminiKey = localStorage.getItem('gemini_api_key')
    
    if (!useDevKeys && !geminiKey) {
      setError('Please configure your Gemini API key in settings first')
      setShowSettings(true)
      return
    }

    setError('')
    
    try {
      // Regenerate just this slide with new theme instructions
      const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(useDevKeys && { 'x-use-dev-keys': 'true' })
        },
        body: JSON.stringify({
          document: scriptSections[slideIndex].narration, // Use existing narration as base
          sections: 1, // Generate just one slide
          apiKey: useDevKeys ? '' : (localStorage.getItem('gemini_api_key') || ''),
          steeringPrompt: `Regenerate this slide with enhanced visual elements and timing that matches the theme.`,
          themeId: projectTheme,
          animationType: projectAnimation
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to regenerate slide')
      }

      const scriptData = await response.json()
      const newSlide = scriptData.slides[0]
      
      // Update the slide with new HTML while keeping the same audio
      const updatedSections = [...scriptSections]
      updatedSections[slideIndex] = {
        ...newSlide, // Replace with the new slide structure
        id: updatedSections[slideIndex].id // Keep the same ID
      }
      
      setScriptSections(updatedSections)
      
      // Save updated project
      await saveProject(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate slide')
    }
  }

  const generateVideo = async () => {
    if (!content.trim()) {
      setError('Please provide some content to generate a video')
      return
    }

    // Check if API keys are set or using dev keys
    const useDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    const geminiKey = localStorage.getItem('gemini_api_key')
    
    if (!useDevKeys && !geminiKey) {
      setError('Please configure your Gemini API key in settings first')
      setShowSettings(true)
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError('')
    setScriptSections([])
    setAudioUrls([])

    try {
      // Step 1: Generate script with 3 sections initially
      setCurrentStep('Generating script sections...')
      setProgress(10)
      
      const scriptResponse = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(useDevKeys && { 'x-use-dev-keys': 'true' })
        },
        body: JSON.stringify({
          document: content,
          sections: 3, // Start with 3 sections
          apiKey: useDevKeys ? '' : (localStorage.getItem('gemini_api_key') || ''),
          themeId: projectTheme,
          animationType: projectAnimation
        }),
      })

      if (!scriptResponse.ok) {
        const data = await scriptResponse.json()
        throw new Error(data.error || 'Failed to generate script')
      }

      const scriptData = await scriptResponse.json()
      const sections = scriptData.slides || []
      setScriptSections(sections)
      
      // Initialize audio generation status
      const initialStatus: Record<number, 'pending' | 'generating' | 'completed' | 'error'> = {}
      sections.forEach((_: any, index: number) => {
        initialStatus[index] = 'pending'
      })
      setAudioGenerationStatus(initialStatus)
      setProgress(30)

      // Save project after script generation
      await saveProject(true)

      // Step 2: Generate audio for each section (if enabled)
      const audioUrlsArray: string[] = new Array(sections.length)
      
      if (generateAudio) {
        setCurrentStep('Generating audio narrations...')
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        
        for (let i = 0; i < sections.length; i++) {
        const slide = sections[i]
        
        // Update status to generating
        setAudioGenerationStatus(prev => ({ ...prev, [i]: 'generating' }))
        setCurrentStep(`Generating audio for section ${i + 1} of ${sections.length}...`)
        
        try {
          const response = await fetch('/api/generate/voice-gemini', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(useDevKeys && { 'x-use-dev-keys': 'true' })
            },
            body: JSON.stringify({
              text: slide.narration,
              apiKey: useDevKeys ? '' : (localStorage.getItem('gemini_api_key') || ''),
              voiceName: 'Kore'
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            if (response.status === 429) {
              // Rate limit error - wait longer
              setCurrentStep(`Rate limit reached. Waiting 60 seconds before continuing...`)
              setAudioGenerationStatus(prev => ({ ...prev, [i]: 'error' }))
              await delay(60000) // Wait 1 minute
              i-- // Retry this section
              continue
            }
            throw new Error(errorData.error || `Failed to generate audio for section ${i + 1}`)
          }

          const data = await response.json()
          
          // Create blob URL from base64 data for immediate playback
          const audioBlob = new Blob(
            [Buffer.from(data.audioData, 'base64')], 
            { type: 'audio/wav' }
          )
          const blobUrl = URL.createObjectURL(audioBlob)
          
          // Store both the blob URL (for immediate playback) and storage URL (for persistence)
          audioUrlsArray[i] = data.audioUrl || blobUrl
          
          // Update status to completed
          setAudioGenerationStatus(prev => ({ ...prev, [i]: 'completed' }))
          setAudioUrls([...audioUrlsArray])
          
          // Update progress
          const progressPercent = 30 + ((i + 1) / sections.length) * 50
          setProgress(Math.min(progressPercent, 80))
          
          // Add delay between requests (except for the last one)
          if (i < sections.length - 1) {
            setCurrentStep(`Waiting before next audio generation...`)
            await delay(5000) // 5 second delay between requests
          }
        } catch (err) {
          setAudioGenerationStatus(prev => ({ ...prev, [i]: 'error' }))
          throw err
        }
      }
      } else {
        // If audio generation is disabled, mark all as completed without audio
        setCurrentStep('Skipping audio generation...')
        sections.forEach((_: any, index: number) => {
          setAudioGenerationStatus(prev => ({ ...prev, [index]: 'completed' }))
        })
        setProgress(80)
      }
      
      setProgress(100)
      setCurrentStep('Generation complete!')
      
      // Final save with all data
      await saveProject()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={() => saveProject()}
                disabled={isSaving || (!title && !content)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Input Section */}
          <div>
            <Card className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Video Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter a title for your video..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </label>
                  <Select value={projectTheme} onValueChange={setProjectTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slideThemes.map(theme => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Animation Style
                  </label>
                  <Select value={projectAnimation} onValueChange={setProjectAnimation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animationTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Audio Generation Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="audio-toggle" className="font-medium">
                      Generate Audio Narration
                    </Label>
                    <p className="text-sm text-gray-600">
                      Disable to save API quota and only preview slide animations
                    </p>
                  </div>
                </div>
                <Switch
                  id="audio-toggle"
                  checked={generateAudio}
                  onCheckedChange={setGenerateAudio}
                />
              </div>
              
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Your Content
              </h2>
              <Textarea
                placeholder="Paste your content here... This can be an article, lesson notes, documentation, or any text you want to turn into a video."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[350px] resize-none"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Videos will be generated with 3 sections to ensure quality and avoid rate limits.
              </p>
              <div className="mt-4">
                <Button
                  onClick={generateVideo}
                  disabled={isGenerating || !content.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Video'
                  )}
                </Button>
              </div>
            </Card>

            {error && (
              <Card className="mt-4 p-4 bg-red-50 border-red-200">
                <p className="text-red-700 text-sm">{error}</p>
              </Card>
            )}
          </div>

          {/* Generation Progress & Results */}
          <div>
            {isGenerating && (
              <Card className="p-6 mb-4">
                <h3 className="font-medium mb-4">Generation Progress</h3>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-gray-600">{currentStep}</p>
              </Card>
            )}

            {scriptSections.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Generated Sections</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Presentation className="h-3 w-3" />
                      {generateAudio ? 
                        'Click play button to preview slides with audio' : 
                        'Click play button to preview slide animations (audio disabled)'}
                    </p>
                  </div>
                  {generateAudio && audioUrls.filter(url => url).length === scriptSections.length && (
                    <button
                      onClick={downloadAllAudios}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <FileDown className="h-4 w-4" />
                      Download All Audio
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {scriptSections.map((section, index) => {
                    const status = audioGenerationStatus[index] || 'pending'
                    return (
                      <div key={section.id} className={`p-3 rounded-lg transition-all ${
                        status === 'generating' ? 'bg-blue-50 border border-blue-200' :
                        status === 'completed' ? 'bg-gray-50' :
                        status === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-gray-50 opacity-60'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            Section {index + 1}
                            {status === 'generating' && (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            {status === 'completed' && (
                              <button
                                onClick={() => regenerateSlide(index)}
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                                title="Regenerate slide with current theme"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            {status === 'completed' && (
                              <>
                                <button
                                  onClick={() => {
                                    console.log('🎬 Preview button clicked, section:', section)
                                    console.log('Section keys:', Object.keys(section))
                                    console.log('Has html field?', 'html' in section)
                                    setSelectedSlide(section)
                                    setSelectedSlideIndex(index)
                                    setShowSlidePreview(true)
                                  }}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 rounded"
                                  title="Play with slide preview"
                                >
                                  <PlayCircle className="h-5 w-5" />
                                </button>
                                {generateAudio && audioUrls[index] && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const audio = new Audio(audioUrls[index])
                                        audio.play()
                                      }}
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                                      title="Play audio only"
                                    >
                                      <Volume2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => downloadAudio(audioUrls[index], index)}
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                                      title="Download audio"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {section.narration}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Duration: {section.duration}s
                          </p>
                          <p className="text-xs">
                            {status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                            {status === 'generating' && <span className="text-blue-600">Generating audio...</span>}
                            {status === 'completed' && <span className="text-green-600">✓ Ready</span>}
                            {status === 'error' && <span className="text-red-600">⚠ Error</span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <SettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      
      <HtmlSlidePreviewModal
        open={showSlidePreview}
        onOpenChange={setShowSlidePreview}
        slide={selectedSlide}
        audioUrl={audioUrls[selectedSlideIndex]}
        sectionIndex={selectedSlideIndex}
        totalSections={scriptSections.length}
      />
    </div>
  )
}

export default function CreateVideoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CreateVideoContent />
    </Suspense>
  )
}