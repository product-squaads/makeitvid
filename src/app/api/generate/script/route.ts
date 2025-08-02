import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateVideoScript } from '@/lib/ai/gemini'
import { getDevApiKeys, isDevelopment } from '@/lib/env'

export const runtime = 'edge' // Use edge runtime for better performance

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
    let { document, apiKey, steeringPrompt, sections = 10 } = body
    
    // In development, check if user wants to use dev keys
    if (isDevelopment() && (!apiKey || apiKey === '')) {
      const useDevKeys = request.headers.get('x-use-dev-keys') === 'true'
      if (useDevKeys) {
        const devKeys = getDevApiKeys()
        apiKey = devKeys.gemini
      }
    }

    // Validate input
    if (!document || typeof document !== 'string') {
      return NextResponse.json(
        { error: 'Document is required and must be a string' },
        { status: 400 }
      )
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Check document length (limit to ~10k words / ~50k characters)
    if (document.length > 50000) {
      return NextResponse.json(
        { error: 'Document is too long. Maximum 50,000 characters allowed.' },
        { status: 400 }
      )
    }

    // Generate script
    const slides = await generateVideoScript(
      document,
      apiKey,
      steeringPrompt,
      sections
    )

    // Calculate total duration
    const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0)

    return NextResponse.json({
      success: true,
      slides,
      totalDuration,
      slideCount: slides.length,
    })

  } catch (error) {
    console.error('Script generation error:', error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Gemini API key.' },
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
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    )
  }
}