import { GoogleGenAI } from '@google/genai'
import { ScriptSlide } from './gemini'

export interface GeminiVoiceOptions {
  voiceName?: string
  language?: string
}

export interface GenerateVoiceResponse {
  audioBuffer: Buffer
  duration: number
  format: string
}

// Available Gemini voices
export const GEMINI_VOICES = {
  'Zephyr': 'Composed',
  'Puck': 'Upbeat', 
  'Charon': 'Pirate-y',
  'Kore': 'Firm',
  'Fenrir': 'Bright',
  'Enceladus': 'Breathy',
  'Aoede': 'Informative',
  'Clio': 'Musical',
  'Titan': 'Smooth',
  'Vega': 'Creative',
  'Lyra': 'Warm',
  'Orion': 'Professional',
  'Nova': 'Energetic',
  'Luna': 'Calm',
  'Sol': 'Authoritative',
} as const

export type GeminiVoiceName = keyof typeof GEMINI_VOICES

const DEFAULT_VOICE: GeminiVoiceName = 'Kore'

// WAV conversion utilities
interface WavConversionOptions {
  numChannels: number
  sampleRate: number
  bitsPerSample: number
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim())
  const [_, format] = fileType.split('/')

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
  }

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10)
    if (!isNaN(bits)) {
      options.bitsPerSample = bits
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim())
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10)
    }
  }

  return options as WavConversionOptions
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options

  const byteRate = sampleRate * numChannels * bitsPerSample / 8
  const blockAlign = numChannels * bitsPerSample / 8
  const buffer = Buffer.alloc(44)

  buffer.write('RIFF', 0)                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4)     // ChunkSize
  buffer.write('WAVE', 8)                      // Format
  buffer.write('fmt ', 12)                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16)                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20)                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22)        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24)         // SampleRate
  buffer.writeUInt32LE(byteRate, 28)           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32)         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34)      // BitsPerSample
  buffer.write('data', 36)                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40)         // Subchunk2Size

  return buffer
}

function convertToWav(rawData: string, mimeType: string): Buffer {
  const options = parseMimeType(mimeType)
  const buffer = Buffer.from(rawData, 'base64')
  const wavHeader = createWavHeader(buffer.length, options)
  
  return Buffer.concat([wavHeader, buffer])
}

export async function generateVoiceForSlidesWithGemini(
  slides: ScriptSlide[],
  apiKey: string,
  options: GeminiVoiceOptions = {}
): Promise<GenerateVoiceResponse> {
  const {
    voiceName = DEFAULT_VOICE,
    language = 'en-US',
  } = options

  // Combine all narrations with brief pauses between slides
  const fullNarration = slides
    .map(slide => slide.narration)
    .join(' ... ') // Add pause between slides

  try {
    const ai = new GoogleGenAI({ apiKey })
    
    const config: any = {
      temperature: 1,
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName,
          }
        }
      },
    }

    const model = 'gemini-2.5-flash-preview-tts'
    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: fullNarration,
          },
        ],
      },
    ]

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let audioBuffer: Buffer | null = null
    let mimeType: string | null = null

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData
        mimeType = inlineData.mimeType || 'audio/wav'
        
        // Convert to WAV if needed
        if (mimeType && mimeType.includes('audio/L')) {
          audioBuffer = convertToWav(inlineData.data || '', mimeType)
        } else {
          audioBuffer = Buffer.from(inlineData.data || '', 'base64')
        }
        break // We only need the first audio chunk
      }
    }

    if (!audioBuffer) {
      throw new Error('No audio data received from Gemini')
    }

    // Estimate duration based on narration length
    // Average speaking rate: 150 words per minute
    const wordCount = fullNarration.split(' ').length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60)

    return {
      audioBuffer,
      duration: estimatedDuration,
      format: 'wav', // Gemini returns WAV format
    }
  } catch (error) {
    console.error('Error generating voice with Gemini:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key')
      }
      if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded')
      }
      if (error.message.includes('model')) {
        throw new Error('Gemini TTS model not available - ensure you have access to gemini-2.5-flash-preview-tts')
      }
    }

    throw new Error('Failed to generate voice audio with Gemini: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

export async function generateVoiceWithGemini(
  text: string,
  apiKey: string,
  voiceName: string = DEFAULT_VOICE
): Promise<Buffer> {
  try {
    const ai = new GoogleGenAI({ apiKey })
    
    const config: any = {
      temperature: 1,
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName,
          }
        }
      },
    }

    const model = 'gemini-2.5-flash-preview-tts'
    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: text,
          },
        ],
      },
    ]

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let audioBuffer: Buffer | null = null
    let mimeType: string | null = null

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData
        mimeType = inlineData.mimeType || 'audio/wav'
        
        // Convert to WAV if needed
        if (mimeType && mimeType.includes('audio/L')) {
          audioBuffer = convertToWav(inlineData.data || '', mimeType)
        } else {
          audioBuffer = Buffer.from(inlineData.data || '', 'base64')
        }
        break
      }
    }

    if (!audioBuffer) {
      throw new Error('No audio data received from Gemini')
    }

    return audioBuffer
  } catch (error) {
    console.error('Error generating voice with Gemini:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key')
      }
      if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded')
      }
    }

    throw new Error('Failed to generate voice audio with Gemini')
  }
}

export function getAvailableGeminiVoices() {
  return Object.entries(GEMINI_VOICES).map(([name, style]) => ({
    id: name,
    name,
    description: style,
    language: 'Multiple languages supported',
  }))
}