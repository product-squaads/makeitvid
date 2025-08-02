import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateVoiceWithGemini } from '@/lib/ai/gemini-tts'
import { getDevApiKeys, isDevelopment } from '@/lib/env'
import { saveAudio } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    let { text, apiKey, voiceName = 'Kore' } = body
    
    // In development, check if user wants to use dev keys
    if (isDevelopment() && (!apiKey || apiKey === '')) {
      const useDevKeys = request.headers.get('x-use-dev-keys') === 'true'
      if (useDevKeys) {
        const devKeys = getDevApiKeys()
        apiKey = devKeys.gemini
      }
    }

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Generate voice using Gemini
    const audioBuffer = await generateVoiceWithGemini(text, apiKey, voiceName)

    // Save audio to storage and get URL
    const timestamp = Date.now()
    const filename = `audio-${timestamp}.wav`
    const audioUrl = await saveAudio(audioBuffer, filename)

    // Return both the audio and its storage URL
    return NextResponse.json({
      success: true,
      audioUrl,
      audioData: audioBuffer.toString('base64'),
      format: 'wav'
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Gemini API key.' },
          { status: 403 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate voice. Please try again.' },
      { status: 500 }
    )
  }
}