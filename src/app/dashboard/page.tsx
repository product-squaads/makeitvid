'use client'

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Sparkles, Volume2, Settings } from 'lucide-react'
import { SettingsModal } from '@/components/settings-modal'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [scriptSections, setScriptSections] = useState<any[]>([])
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  if (!user) {
    redirect('/sign-in')
  }

  const generateVideo = async () => {
    if (!content.trim()) {
      setError('Please provide some content to generate a video')
      return
    }

    // Check if API keys are set or using dev keys
    const useDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    const geminiKey = localStorage.getItem('gemini_api_key')
    const cartesiaKey = localStorage.getItem('cartesia_api_key')
    
    if (!useDevKeys && (!geminiKey || !cartesiaKey)) {
      setError('Please configure your API keys in settings first')
      setShowSettings(true)
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError('')
    setScriptSections([])
    setAudioUrls([])

    try {
      // Step 1: Generate script with 10 sections
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
          sections: 10,
          apiKey: useDevKeys ? '' : (localStorage.getItem('gemini_api_key') || '')
        }),
      })

      if (!scriptResponse.ok) {
        const data = await scriptResponse.json()
        throw new Error(data.error || 'Failed to generate script')
      }

      const scriptData = await scriptResponse.json()
      setScriptSections(scriptData.slides || [])
      setProgress(30)

      // Step 2: Generate audio for each section in parallel
      setCurrentStep('Generating audio narrations...')
      
      const audioPromises = scriptData.slides.map(async (slide: any, index: number) => {
        const response = await fetch('/api/generate/voice', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(useDevKeys && { 'x-use-dev-keys': 'true' })
          },
          body: JSON.stringify({
            text: slide.narration,
            apiKey: useDevKeys ? '' : (localStorage.getItem('cartesia_api_key') || '')
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to generate audio for section ${index + 1}`)
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
      })

      const results = await Promise.all(audioPromises)
      setAudioUrls(results)
      setProgress(80)

      // Step 3: Save to localStorage
      setCurrentStep('Saving project...')
      const project = {
        id: Date.now().toString(),
        title: scriptData.slides[0]?.title || 'Untitled Video',
        content,
        scriptSections: scriptData.slides,
        audioUrls: results,
        createdAt: new Date().toISOString(),
      }

      const existingProjects = JSON.parse(localStorage.getItem('video_projects') || '[]')
      existingProjects.unshift(project)
      localStorage.setItem('video_projects', JSON.stringify(existingProjects))

      setProgress(100)
      setCurrentStep('Video generation complete!')

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
            <h1 className="text-xl font-semibold">makeitvid</h1>
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
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Input Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Your Content
              </h2>
              <Textarea
                placeholder="Paste your content here... This can be an article, lesson notes, documentation, or any text you want to turn into a video."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] resize-none"
                disabled={isGenerating}
              />
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
                <h3 className="font-medium mb-4">Generated Sections</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {scriptSections.map((section, index) => (
                    <div key={section.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          Section {index + 1}: {section.title}
                        </h4>
                        {audioUrls[index] && (
                          <button
                            onClick={() => {
                              const audio = new Audio(audioUrls[index])
                              audio.play()
                            }}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {section.narration}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {section.duration}s
                      </p>
                    </div>
                  ))}
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
    </div>
  )
}