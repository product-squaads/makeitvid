import { NextRequest, NextResponse } from 'next/server'
import { getAudio } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Construct the URL path
    const url = `/api/storage/audio/${filename}`
    
    // Retrieve the audio file
    const audioBuffer = await getAudio(url)
    
    // Determine content type based on extension
    const contentType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'
    
    // Return the audio file
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error retrieving audio:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audio file' },
      { status: 404 }
    )
  }
}