import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { generateVideoScript } from '@/lib/ai/gemini'

export const runtime = 'edge' // Use edge runtime for better performance

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
    const { document, apiKey, steeringPrompt } = body

    // Validate input
    if (!document || typeof document !== 'string') {
      return Response.json(
        { error: 'Document is required and must be a string' },
        { status: 400 }
      )
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // Check document length (limit to ~10k words / ~50k characters)
    if (document.length > 50000) {
      return Response.json(
        { error: 'Document is too long. Maximum 50,000 characters allowed.' },
        { status: 400 }
      )
    }

    // Generate script
    const slides = await generateVideoScript(
      document,
      apiKey,
      steeringPrompt
    )

    // Calculate total duration
    const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0)

    return Response.json({
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
        return Response.json(
          { error: 'Invalid API key. Please check your Gemini API key.' },
          { status: 403 }
        )
      }
      if (error.message.includes('rate limit')) {
        return Response.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return Response.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    )
  }
}