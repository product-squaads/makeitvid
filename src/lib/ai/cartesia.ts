import axios from 'axios'
import { ScriptSlide } from './gemini'

export interface VoiceOptions {
  voiceId?: string
  language?: string
}

export interface GenerateVoiceResponse {
  audioBuffer: Buffer
  duration: number
  format: string
}

// Default voice IDs from Cartesia
const DEFAULT_VOICES = {
  'en-US': 'a0e99841-438c-4a64-b679-ae501e7d6091', // Professional US English
  'en-GB': 'b9f0e6b7-3c9f-4d3e-8e8f-8c8f9f7f6f5f', // British English
}

export async function generateVoiceForSlides(
  slides: ScriptSlide[],
  apiKey: string,
  options: VoiceOptions = {}
): Promise<GenerateVoiceResponse> {
  const {
    voiceId = DEFAULT_VOICES['en-US'],
    language = 'en',
  } = options

  // Combine all narrations with brief pauses between slides
  const fullNarration = slides
    .map(slide => slide.narration)
    .join(' ... ') // Add pause between slides

  try {
    const response = await axios.post(
      'https://api.cartesia.ai/tts/bytes',
      {
        model_id: 'sonic-english', // Using Sonic for best quality
        transcript: fullNarration,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100,
        },
        language: language,
      },
      {
        headers: {
          'X-API-Key': apiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    )

    const audioBuffer = Buffer.from(response.data)

    // Estimate duration based on narration length
    // Average speaking rate: 150 words per minute
    const wordCount = fullNarration.split(' ').length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60)

    return {
      audioBuffer,
      duration: estimatedDuration,
      format: 'mp3',
    }
  } catch (error) {
    console.error('Error generating voice:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Cartesia API key')
      }
      if (error.response?.status === 429) {
        throw new Error('Cartesia rate limit exceeded')
      }
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : 'Cartesia API error'
        throw new Error(errorMessage)
      }
    }

    throw new Error('Failed to generate voice audio')
  }
}

export async function getAvailableVoices(apiKey: string) {
  try {
    const response = await axios.get(
      'https://api.cartesia.ai/voices',
      {
        headers: {
          'X-API-Key': apiKey,
          'Cartesia-Version': '2024-06-10',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error fetching voices:', error)
    throw new Error('Failed to fetch available voices')
  }
}