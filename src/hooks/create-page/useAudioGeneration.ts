import { useState, useCallback } from 'react'

type AudioStatus = 'pending' | 'generating' | 'completed' | 'error'

interface AudioGenerationState {
  audioGenerationStatus: Record<number, AudioStatus>
  audioUrls: string[]
}

export function useAudioGeneration() {
  const [state, setState] = useState<AudioGenerationState>({
    audioGenerationStatus: {},
    audioUrls: []
  })

  const initializeAudioStatus = useCallback((count: number, existingUrls?: string[]) => {
    const status: Record<number, AudioStatus> = {}
    for (let i = 0; i < count; i++) {
      status[i] = existingUrls?.[i] ? 'completed' : 'pending'
    }
    setState(prev => ({
      ...prev,
      audioGenerationStatus: status,
      audioUrls: existingUrls || new Array(count).fill('')
    }))
  }, [])

  const updateAudioStatus = useCallback((index: number, status: AudioStatus) => {
    setState(prev => ({
      ...prev,
      audioGenerationStatus: {
        ...prev.audioGenerationStatus,
        [index]: status
      }
    }))
  }, [])

  const setAudioUrl = useCallback((index: number, url: string) => {
    setState(prev => {
      const newUrls = [...prev.audioUrls]
      newUrls[index] = url
      return {
        ...prev,
        audioUrls: newUrls
      }
    })
  }, [])

  const generateAudioForSection = useCallback(async (
    text: string,
    useDevKeys: boolean,
    voiceName: string = 'Kore'
  ) => {
    const response = await fetch('/api/generate/voice-gemini', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(useDevKeys && { 'x-use-dev-keys': 'true' })
      },
      body: JSON.stringify({
        text,
        apiKey: useDevKeys ? '' : (localStorage.getItem('gemini_api_key') || ''),
        voiceName
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 429) {
        throw { status: 429, message: errorData.error || 'Rate limit reached' }
      }
      throw new Error(errorData.error || 'Failed to generate audio')
    }

    const data = await response.json()
    
    // Create blob URL from base64 data for immediate playback
    const audioBlob = new Blob(
      [Buffer.from(data.audioData, 'base64')], 
      { type: 'audio/wav' }
    )
    const blobUrl = URL.createObjectURL(audioBlob)
    
    return data.audioUrl || blobUrl
  }, [])

  const generateAllAudio = useCallback(async (
    sections: any[],
    onProgress?: (index: number, total: number) => void,
    useDevKeys: boolean = false
  ): Promise<string[]> => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const audioUrlsArray: string[] = new Array(sections.length)
    
    for (let i = 0; i < sections.length; i++) {
      const slide = sections[i]
      
      updateAudioStatus(i, 'generating')
      
      try {
        onProgress?.(i, sections.length)
        
        const audioUrl = await generateAudioForSection(
          slide.narration,
          useDevKeys
        )
        
        audioUrlsArray[i] = audioUrl
        setAudioUrl(i, audioUrl)
        updateAudioStatus(i, 'completed')
        
        // Add delay between requests (except for the last one)
        if (i < sections.length - 1) {
          await delay(5000) // 5 second delay between requests
        }
      } catch (err: any) {
        updateAudioStatus(i, 'error')
        
        if (err.status === 429) {
          // Rate limit error - wait longer
          await delay(60000) // Wait 1 minute
          i-- // Retry this section
          continue
        }
        
        throw err
      }
    }
    
    return audioUrlsArray
  }, [generateAudioForSection, updateAudioStatus, setAudioUrl])

  const downloadAudio = useCallback(async (url: string, index: number) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = `section-${index + 1}-audio.wav`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading audio:', error)
    }
  }, [])

  const downloadAllAudios = useCallback(() => {
    state.audioUrls.forEach((url, index) => {
      if (url) {
        setTimeout(() => downloadAudio(url, index), index * 500)
      }
    })
  }, [state.audioUrls, downloadAudio])

  const markAllAsCompleted = useCallback((count: number) => {
    const status: Record<number, AudioStatus> = {}
    for (let i = 0; i < count; i++) {
      status[i] = 'completed'
    }
    setState(prev => ({
      ...prev,
      audioGenerationStatus: status
    }))
  }, [])

  return {
    audioGenerationStatus: state.audioGenerationStatus,
    audioUrls: state.audioUrls,
    initializeAudioStatus,
    updateAudioStatus,
    generateAllAudio,
    downloadAudio,
    downloadAllAudios,
    markAllAsCompleted
  }
}