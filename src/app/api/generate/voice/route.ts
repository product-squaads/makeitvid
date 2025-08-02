import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateVoice } from '@/lib/ai/cartesia'
import { getDevApiKeys, isDevelopment } from '@/lib/env'

export const runtime = 'nodejs' // Node runtime needed for audio handling

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
    let { text, apiKey } = body
    
    // In development, check if user wants to use dev keys
    if (isDevelopment() && (!apiKey || apiKey === '')) {
      const useDevKeys = request.headers.get('x-use-dev-keys') === 'true'
      if (useDevKeys) {
        const devKeys = getDevApiKeys()
        apiKey = devKeys.cartesia
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

    // Generate voice using Cartesia
    const audioBuffer = await generateVoice(text, apiKey)

    // Return audio as binary response
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Cartesia API key.' },
          { status: 403 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
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