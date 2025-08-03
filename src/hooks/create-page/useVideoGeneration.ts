import { useState, useCallback } from 'react'

interface GenerationState {
  isGenerating: boolean
  progress: number
  currentStep: string
  error: string
}

interface GenerationOptions {
  content: string
  sections?: number
  theme?: string
  animation?: string
  generateAudio?: boolean
  useDevKeys?: boolean
}

export function useVideoGeneration() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    error: ''
  })

  const updateProgress = useCallback((progress: number, step: string) => {
    setGenerationState(prev => ({
      ...prev,
      progress,
      currentStep: step
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setGenerationState(prev => ({
      ...prev,
      error,
      isGenerating: false
    }))
  }, [])

  const generateScript = useCallback(async (options: GenerationOptions) => {
    const { content, sections = 3, theme = 'cosmic', animation = 'dynamic', useDevKeys = false } = options
    
    const geminiKey = localStorage.getItem('gemini_api_key')
    
    if (!useDevKeys && !geminiKey) {
      throw new Error('Please configure your Gemini API key in settings first')
    }

    const response = await fetch('/api/generate/script', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(useDevKeys && { 'x-use-dev-keys': 'true' })
      },
      body: JSON.stringify({
        document: content,
        sections,
        apiKey: useDevKeys ? '' : (geminiKey || ''),
        themeId: theme,
        animationType: animation
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to generate script')
    }

    const scriptData = await response.json()
    return scriptData.slides || []
  }, [])

  const startGeneration = useCallback(async (options: GenerationOptions): Promise<{ sections: any[], audioUrls: string[] }> => {
    setGenerationState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Initializing...',
      error: ''
    })

    try {
      // Step 1: Generate script
      updateProgress(10, 'Generating script sections...')
      const sections = await generateScript(options)
      updateProgress(30, 'Script generation complete')

      // Return sections and empty audio URLs if audio generation is disabled
      if (!options.generateAudio) {
        updateProgress(100, 'Generation complete!')
        return { sections, audioUrls: [] }
      }

      // Audio generation will be handled by separate hook
      return { sections, audioUrls: [] }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      if (!generationState.error) {
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false
        }))
      }
    }
  }, [generateScript, updateProgress, setError, generationState.error])

  const regenerateSlide = useCallback(async (
    slideIndex: number, 
    existingSlide: any,
    theme: string,
    animation: string
  ) => {
    const useDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    const geminiKey = localStorage.getItem('gemini_api_key')
    
    if (!useDevKeys && !geminiKey) {
      throw new Error('Please configure your Gemini API key in settings first')
    }

    const response = await fetch('/api/generate/script', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(useDevKeys && { 'x-use-dev-keys': 'true' })
      },
      body: JSON.stringify({
        document: existingSlide.narration,
        sections: 1,
        apiKey: useDevKeys ? '' : (geminiKey || ''),
        steeringPrompt: `Regenerate this slide with enhanced visual elements and timing that matches the theme.`,
        themeId: theme,
        animationType: animation
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to regenerate slide')
    }

    const scriptData = await response.json()
    return scriptData.slides[0]
  }, [])

  return {
    ...generationState,
    startGeneration,
    updateProgress,
    setError,
    regenerateSlide
  }
}