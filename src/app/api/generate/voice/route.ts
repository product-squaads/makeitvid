import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { generateVoiceForSlides } from '@/lib/ai/cartesia'
import { generateVoiceForSlidesWithGemini } from '@/lib/ai/gemini-tts'
import { ScriptSlide } from '@/lib/ai/gemini'

export const runtime = 'nodejs' // Node runtime needed for Buffer handling

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      slides, 
      apiKey, 
      ttsProvider = 'cartesia', // Default to Cartesia
      voiceOptions 
    } = body

    // Validate input
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return Response.json(
        { error: 'Slides array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Validate TTS provider
    if (!['cartesia', 'gemini'].includes(ttsProvider)) {
      return Response.json(
        { error: 'Invalid TTS provider. Must be "cartesia" or "gemini"' },
        { status: 400 }
      )
    }

    // Validate slides structure
    const validSlides = slides.every((slide: ScriptSlide) => 
      slide.narration && typeof slide.narration === 'string'
    )

    if (!validSlides) {
      return Response.json(
        { error: 'Each slide must have a narration text' },
        { status: 400 }
      )
    }

    // Generate voice based on provider
    let voiceResult
    
    if (ttsProvider === 'gemini') {
      // Use Gemini TTS
      voiceResult = await generateVoiceForSlidesWithGemini(
        slides,
        apiKey,
        voiceOptions
      )
    } else {
      // Use Cartesia TTS (default)
      voiceResult = await generateVoiceForSlides(
        slides,
        apiKey,
        voiceOptions
      )
    }

    // Convert buffer to base64 for JSON response
    const audioBase64 = voiceResult.audioBuffer.toString('base64')

    return Response.json({
      success: true,
      provider: ttsProvider,
      audio: {
        data: audioBase64,
        format: voiceResult.format,
        duration: voiceResult.duration,
      },
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return Response.json(
          { error: 'Invalid API key. Please check your API key.' },
          { status: 403 }
        )
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return Response.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      if (error.message.includes('model')) {
        return Response.json(
          { error: 'TTS model not available. Ensure you have access to the TTS model.' },
          { status: 403 }
        )
      }
    }

    return Response.json(
      { error: 'Failed to generate voice. Please try again.' },
      { status: 500 }
    )
  }
}