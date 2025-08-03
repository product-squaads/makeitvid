'use client'

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useState, useCallback, useEffect, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SettingsModal } from '@/components/settings-modal'
import { HtmlSlidePreviewModal } from '@/components/html-slide-preview-modal'
import { 
  useProjectManagement, 
  useVideoGeneration, 
  useAudioGeneration 
} from '@/hooks/create-page'
import { 
  ProjectHeader, 
  ContentInputSection, 
  GenerationProgress, 
  ScriptSectionsList 
} from '@/components/create-page'

function CreateVideoContent() {
  const { user, isLoaded } = useUser()
  const [showSettings, setShowSettings] = useState(false)
  const [showSlidePreview, setShowSlidePreview] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<any>(null)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [projectTheme, setProjectTheme] = useState('cosmic')
  const [projectAnimation, setProjectAnimation] = useState('dynamic')
  const [generateAudio, setGenerateAudio] = useState(true)

  // Use custom hooks
  const {
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
  } = useProjectManagement()

  const {
    isGenerating,
    progress,
    currentStep,
    error,
    startGeneration,
    updateProgress,
    setError,
    regenerateSlide
  } = useVideoGeneration()

  const {
    audioGenerationStatus,
    initializeAudioStatus,
    generateAllAudio,
    downloadAudio,
    downloadAllAudios,
    markAllAsCompleted
  } = useAudioGeneration()

  // Initialize audio status when project loads
  useEffect(() => {
    if (scriptSections.length > 0 && Object.keys(audioGenerationStatus).length === 0) {
      initializeAudioStatus(scriptSections.length, audioUrls)
    }
  }, [scriptSections, audioUrls, audioGenerationStatus, initializeAudioStatus])

  // Redirect if not authenticated
  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  const handleGenerateVideo = async () => {
    if (!content.trim()) {
      setError('Please provide some content to generate a video')
      return
    }

    const useDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    const geminiKey = localStorage.getItem('gemini_api_key')
    
    if (!useDevKeys && !geminiKey) {
      setError('Please configure your Gemini API key in settings first')
      setShowSettings(true)
      return
    }

    try {
      // Generate script sections
      const { sections } = await startGeneration({
        content,
        theme: projectTheme,
        animation: projectAnimation,
        generateAudio,
        useDevKeys
      })

      setScriptSections(sections)
      initializeAudioStatus(sections.length)

      // Save project after script generation
      await saveProject(true)

      // Generate audio if enabled
      if (generateAudio) {
        updateProgress(30, 'Generating audio narrations...')
        const generatedAudioUrls = await generateAllAudio(
          sections,
          (index, total) => {
            const progressPercent = 30 + ((index + 1) / total) * 50
            updateProgress(
              Math.min(progressPercent, 80),
              `Generating audio for section ${index + 1} of ${total}...`
            )
          },
          useDevKeys
        )
        setAudioUrls(generatedAudioUrls)
      } else {
        // If audio generation is disabled, mark all sections as completed without audio
        const emptyUrls = new Array(sections.length).fill('')
        setAudioUrls(emptyUrls)
        markAllAsCompleted(sections.length)
      }

      updateProgress(100, 'Generation complete!')
      await saveProject()

    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleRegenerateSlide = async (slideIndex: number) => {
    if (!scriptSections[slideIndex]) return
    
    try {
      const newSlide = await regenerateSlide(
        slideIndex,
        scriptSections[slideIndex],
        projectTheme,
        projectAnimation
      )
      
      const updatedSections = [...scriptSections]
      updatedSections[slideIndex] = {
        ...newSlide,
        id: updatedSections[slideIndex].id
      }
      
      setScriptSections(updatedSections)
      await saveProject(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate slide')
    }
  }

  const handlePlaySlide = useCallback((section: any, index: number) => {
    setSelectedSlide(section)
    setSelectedSlideIndex(index)
    setShowSlidePreview(true)
  }, [])

  const handlePlayAudio = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader
        onSaveProject={() => saveProject()}
        isSaving={isSaving}
        hasContent={!!(title || content)}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Input Section */}
          <div>
            <ContentInputSection
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              projectTheme={projectTheme}
              setProjectTheme={setProjectTheme}
              projectAnimation={projectAnimation}
              setProjectAnimation={setProjectAnimation}
              generateAudio={generateAudio}
              setGenerateAudio={setGenerateAudio}
              isGenerating={isGenerating}
              onGenerate={handleGenerateVideo}
              error={error}
            />
          </div>

          {/* Generation Progress & Results */}
          <div>
            <GenerationProgress
              isGenerating={isGenerating}
              progress={progress}
              currentStep={currentStep}
            />

            <ScriptSectionsList
              sections={scriptSections}
              audioUrls={audioUrls}
              audioGenerationStatus={audioGenerationStatus}
              generateAudio={generateAudio}
              onPlaySlide={handlePlaySlide}
              onPlayAudio={handlePlayAudio}
              onDownloadAudio={downloadAudio}
              onDownloadAllAudios={downloadAllAudios}
              onRegenerateSlide={handleRegenerateSlide}
            />
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