# makeitvid Technical Implementation Guide

## Quick Start Implementation

### 1. Clerk Authentication Setup

#### Installation
```bash
npm install @clerk/nextjs
```

#### Environment Variables (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### app/layout.tsx
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### middleware.ts
```typescript
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up'],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

### 2. Google Gemini Integration (Updated 2025 - Tested & Working)

#### Installation
```bash
pnpm add @google/genai  # Note: Use pnpm, not npm
```

#### lib/ai/gemini.ts
```typescript
import { GoogleGenAI, Type } from '@google/genai'

export interface ScriptSlide {
  id: number
  title: string
  content: string
  narration: string
  duration: number // seconds
}

export async function generateVideoScript(
  document: string,
  apiKey: string,
  steeringPrompt?: string
): Promise<ScriptSlide[]> {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  })

  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["slides"],
      properties: {
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "title", "content", "narration", "duration"],
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              narration: { type: Type.STRING },
              duration: { type: Type.NUMBER },
            },
          },
        },
      },
    },
  }

  const prompt = `
    Convert this document into a video script with slides.
    ${steeringPrompt || 'Create an engaging educational video.'}
    
    Requirements:
    - Generate 5-10 slides
    - Each slide needs: title, content (bullet points), narration text
    - Target duration: 2-3 minutes total
    - Keep slide content concise (max 50 words)
    - Make narration natural and conversational
    - Content should use bullet points with "•" character
    
    Document to convert:
    ${document}
  `

  const contents = [
    {
      role: 'user' as const,
      parts: [{ text: prompt }],
    },
  ]

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash-lite', // Best for MVP: fast & cheap
    config,
    contents,
  })

  let fullText = ''
  for await (const chunk of response) {
    fullText += chunk.text
  }
  
  const data = JSON.parse(fullText)
  
  return data.slides
}
```

#### app/api/generate/script/route.ts
```typescript
import { auth } from '@clerk/nextjs'
import { generateVideoScript } from '@/lib/ai/gemini'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { document, apiKey, steeringPrompt } = await request.json()

  try {
    const script = await generateVideoScript(document, apiKey, steeringPrompt)
    return Response.json({ script })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

### 3. Cartesia Voice Integration (Tested & Working)

#### Installation
```bash
pnpm add axios
```

#### lib/ai/cartesia.ts
```typescript
import axios from 'axios'

export async function generateVoice(
  text: string,
  apiKey: string
): Promise<Buffer> {
  const response = await axios.post(
    'https://api.cartesia.ai/tts/bytes',  // Correct endpoint
    {
      model_id: 'sonic-english',
      transcript: text,
      voice: {
        mode: 'id',
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091', // Default US voice
      },
      output_format: {
        container: 'mp3',
        encoding: 'mp3',
        sample_rate: 44100,
      },
      language: 'en',
      // Note: NO speed parameter - causes 422 error
    },
    {
      headers: {
        'X-API-Key': apiKey,  // Note: X-API-Key, not Authorization
        'Cartesia-Version': '2024-06-10',
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  )

  return Buffer.from(response.data)
}

export async function generateNarrationForSlides(
  slides: ScriptSlide[],
  apiKey: string
): Promise<{ audioBuffer: Buffer; duration: number }> {
  // Combine all narrations with pauses
  const fullNarration = slides
    .map(slide => slide.narration)
    .join(' ... ') // Add pause between slides

  const audioBuffer = await generateVoice(fullNarration, apiKey)
  
  // Estimate duration (rough calculation)
  const wordsPerMinute = 150
  const wordCount = fullNarration.split(' ').length
  const duration = (wordCount / wordsPerMinute) * 60

  return { audioBuffer, duration }
}
```

### 4. HTML Slide Generator

#### lib/slides/generator.ts
```typescript
export function generateSlideHTML(slide: ScriptSlide): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1920px;
          height: 1080px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          overflow: hidden;
        }
        .slide {
          width: 90%;
          max-width: 1600px;
          text-align: center;
          padding: 80px;
        }
        h1 {
          font-size: 72px;
          font-weight: 700;
          margin-bottom: 60px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .content {
          font-size: 48px;
          line-height: 1.6;
          text-align: left;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer {
          position: absolute;
          bottom: 40px;
          right: 40px;
          font-size: 24px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="slide">
        <h1>${slide.title}</h1>
        <div class="content">${slide.content.replace(/\n/g, '<br>')}</div>
        <div class="footer">makeitvid.com</div>
      </div>
    </body>
    </html>
  `
}
```

### 5. Video Assembly with FFmpeg

#### lib/video/ffmpeg.ts
```typescript
import ffmpeg from 'fluent-ffmpeg'
import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function captureSlideScreenshot(
  html: string,
  outputPath: string
): Promise<void> {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setContent(html)
  await page.screenshot({ path: outputPath })
  await browser.close()
}

export async function createVideoFromSlides(
  slides: ScriptSlide[],
  audioPath: string,
  outputPath: string
): Promise<void> {
  const tempDir = path.join(process.cwd(), 'temp', uuidv4())
  await fs.mkdir(tempDir, { recursive: true })

  // Generate screenshots for each slide
  const screenshots: string[] = []
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const html = generateSlideHTML(slide)
    const screenshotPath = path.join(tempDir, `slide-${i}.png`)
    await captureSlideScreenshot(html, screenshotPath)
    screenshots.push(screenshotPath)
  }

  // Create video with FFmpeg
  return new Promise((resolve, reject) => {
    const command = ffmpeg()

    // Add images
    screenshots.forEach((screenshot, index) => {
      const duration = slides[index].duration
      command.input(screenshot).loop(duration).fps(30)
    })

    // Add audio
    command.input(audioPath)

    // Output settings
    command
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-pix_fmt yuv420p',
        '-shortest',
      ])
      .output(outputPath)
      .on('end', async () => {
        // Cleanup temp files
        await fs.rm(tempDir, { recursive: true })
        resolve()
      })
      .on('error', reject)
      .run()
  })
}
```

### 6. Main API Endpoint

#### app/api/generate/video/route.ts
```typescript
import { auth } from '@clerk/nextjs'
import { generateVideoScript } from '@/lib/ai/gemini'
import { generateNarrationForSlides } from '@/lib/ai/cartesia'
import { createVideoFromSlides } from '@/lib/video/ffmpeg'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { promises as fs } from 'fs'

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { document, geminiKey, cartesiaKey, steeringPrompt } = await request.json()

  try {
    // Step 1: Generate script
    const script = await generateVideoScript(document, geminiKey, steeringPrompt)

    // Step 2: Generate narration
    const { audioBuffer } = await generateNarrationForSlides(script, cartesiaKey)
    
    // Save audio temporarily
    const audioPath = path.join(process.cwd(), 'temp', `${uuidv4()}.mp3`)
    await fs.writeFile(audioPath, audioBuffer)

    // Step 3: Create video
    const videoPath = path.join(process.cwd(), 'temp', `${uuidv4()}.mp4`)
    await createVideoFromSlides(script, audioPath, videoPath)

    // Read video file
    const videoBuffer = await fs.readFile(videoPath)

    // Cleanup
    await fs.unlink(audioPath)
    await fs.unlink(videoPath)

    // Return video
    return new Response(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"',
      },
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

### 7. Frontend Components

#### components/video-generator.tsx
```typescript
'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function VideoGenerator() {
  const { user } = useUser()
  const [document, setDocument] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const generateVideo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          geminiKey: user?.publicMetadata?.geminiKey,
          cartesiaKey: user?.publicMetadata?.cartesiaKey,
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
    } catch (error) {
      console.error('Error:', error)
      alert('Video generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Video</h1>
      
      <textarea
        className="w-full h-64 p-4 border rounded-lg"
        placeholder="Paste your document here..."
        value={document}
        onChange={(e) => setDocument(e.target.value)}
      />

      <button
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        onClick={generateVideo}
        disabled={loading || !document}
      >
        {loading ? 'Generating...' : 'Generate Video'}
      </button>

      {videoUrl && (
        <div className="mt-8">
          <video controls className="w-full rounded-lg">
            <source src={videoUrl} type="video/mp4" />
          </video>
          <a
            href={videoUrl}
            download="video.mp4"
            className="mt-4 inline-block px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  )
}
```

## Deployment Notes

### Vercel Configuration (vercel.json)
```json
{
  "functions": {
    "app/api/generate/video/route.ts": {
      "maxDuration": 300
    }
  }
}
```

### Required System Dependencies
- FFmpeg must be available in the deployment environment
- For Vercel: Use a custom runtime or external processing service
- Alternative: Use @ffmpeg/ffmpeg for browser-based processing

## Integration Testing

### Why Integration Tests Matter
Real API calls catch breaking changes that mocks would miss. Always test with actual API keys before deployment.

### Test Setup
```bash
pnpm add -D tsx dotenv @types/node
```

### Example Integration Test
```typescript
// src/tests/api-integration.test.ts
import { generateVideoScript } from '../lib/ai/gemini'
import { generateVoiceForSlides } from '../lib/ai/cartesia'
import * as dotenv from 'dotenv'

dotenv.config()

async function testAPIs() {
  // Test Gemini
  const slides = await generateVideoScript(
    'Test document content',
    process.env.GOOGLE_GEMINI_API_KEY!
  )
  console.log(`Generated ${slides.length} slides`)
  
  // Test Cartesia
  const voice = await generateVoiceForSlides(
    slides,
    process.env.CARTESIA_API_KEY!
  )
  console.log(`Generated ${voice.audioBuffer.length} bytes of audio`)
}

// Run: npx tsx src/tests/api-integration.test.ts
```

## Security Considerations

1. **API Key Storage**: Use Clerk user metadata with encryption
2. **Rate Limiting**: Implement per-user limits
3. **File Cleanup**: Always delete temporary files
4. **Input Validation**: Sanitize document content
5. **CORS**: Configure for your domain only

## Performance Optimizations

1. **Parallel Processing**: Generate slides while processing audio
2. **Caching**: Cache generated content when possible
3. **Streaming**: Stream video response instead of buffering
4. **Queue System**: For production, use job queue (Bull/BullMQ)

---

*This guide provides the core implementation patterns. Adapt based on your specific requirements and scale.*