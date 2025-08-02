import { GoogleGenAI, Type } from '@google/genai'

export interface ScriptSlide {
  id: number
  title: string
  content: string
  narration: string
  duration: number // seconds
}

export interface GenerateScriptResponse {
  slides: ScriptSlide[]
}

export async function generateVideoScript(
  document: string,
  apiKey: string,
  steeringPrompt?: string,
  sections: number = 3
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
    Convert this document into a video script with EXACTLY ${sections} sections/slides for an engaging educational video.
    ${steeringPrompt ? `Additional instructions: ${steeringPrompt}` : ''}
    
    Requirements:
    - Generate EXACTLY ${sections} slides that comprehensively cover the content
    - Each slide needs: 
      - A clear, concise title
      - Content as bullet points (use "•" character, max 50 words total)
      - Natural, conversational narration that explains the content (50-100 words)
      - Duration in seconds (15-30 seconds per slide)
    - Make the narration flow naturally between slides
    - Start with an introduction slide and end with a conclusion
    - Distribute the content evenly across all ${sections} sections
    
    Document to convert:
    ${document}
  `

  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ]

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      config,
      contents,
    })

    let fullText = ''
    for await (const chunk of response) {
      fullText += chunk.text
    }
    
    const data = JSON.parse(fullText) as GenerateScriptResponse
    
    // Validate and normalize the response
    if (!data.slides || !Array.isArray(data.slides)) {
      throw new Error('Invalid response format: missing slides array')
    }

    // Ensure all slides have required fields
    const validatedSlides = data.slides.map((slide, index) => ({
      id: slide.id || index + 1,
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || '',
      narration: slide.narration || '',
      duration: Math.max(15, Math.min(30, slide.duration || 20)), // Clamp between 15-30 seconds
    }))

    return validatedSlides
  } catch (error) {
    console.error('Error generating video script:', error)
    throw new Error(
      error instanceof Error 
        ? `Failed to generate script: ${error.message}` 
        : 'Failed to generate script'
    )
  }
}