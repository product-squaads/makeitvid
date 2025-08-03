import { GoogleGenAI, Type } from '@google/genai'

export interface ScriptSlide {
  id: number
  title: string
  content: string
  narration: string
  duration: number // seconds
  visualElements?: {
    type: 'bullet' | 'quote' | 'stat' | 'image' | 'icon'
    text: string
    animationDelay?: number // milliseconds
    emphasis?: boolean
  }[]
  transitions?: {
    entrance: 'fade' | 'slide' | 'zoom' | 'typewriter'
    exitDelay?: number // milliseconds before transitioning
  }
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
              visualElements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    text: { type: Type.STRING },
                    animationDelay: { type: Type.NUMBER },
                    emphasis: { type: Type.BOOLEAN },
                  },
                },
              },
              transitions: {
                type: Type.OBJECT,
                properties: {
                  entrance: { type: Type.STRING },
                  exitDelay: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    },
  }

  const prompt = `
    Convert this document into a dynamic, animated video presentation with EXACTLY ${sections} slides that tell a compelling story.
    ${steeringPrompt ? `Additional instructions: ${steeringPrompt}` : ''}
    
    CRITICAL REQUIREMENTS:
    
    1. STORYTELLING APPROACH:
    - Create a narrative arc across all ${sections} slides
    - Each slide should build upon the previous one
    - Use progressive disclosure - reveal information gradually
    - Create emotional engagement through pacing and emphasis
    
    2. SLIDE STRUCTURE (for each slide):
    - title: Compelling, curiosity-driven headline
    - content: Raw bullet points or key phrases (keep for compatibility)
    - narration: Natural, conversational script (50-100 words) that matches the visual timing
    - duration: Total time in seconds (15-30 seconds, based on content complexity)
    
    3. VISUAL ELEMENTS (REQUIRED for animated storytelling):
    - Break content into visualElements array with types:
      • "bullet": Main content points (animate one by one)
      • "quote": Important quotes or statements (emphasize)
      • "stat": Numbers or statistics (highlight dramatically)
      • "icon": Conceptual elements (use descriptive text like "💡 Key Insight")
    - Set animationDelay for each element (in milliseconds) to create a flow:
      • Start at 0ms for first element
      • Add 500-1500ms between elements based on narration pacing
      • Synchronize with when the narrator mentions each point
    - Use emphasis: true for critical points
    
    4. TRANSITIONS:
    - entrance: Choose based on content mood
      • "fade": For gentle introductions
      • "slide": For progressive revelations
      • "zoom": For impactful statements
      • "typewriter": For quotes or important text
    - exitDelay: Time before transitioning (usually duration * 1000 - 2000ms)
    
    5. PACING GUIDELINES:
    - First slide: Strong hook with delayed reveal of key points
    - Middle slides: Build complexity with cascading animations
    - Final slide: Memorable conclusion with all points visible
    
    6. EXAMPLE VISUAL FLOW:
    If narration says "There are three key benefits: speed, efficiency, and cost savings"
    - Element 1: "Three Key Benefits" (0ms)
    - Element 2: "⚡ Speed" (1000ms - when narrator says "speed")
    - Element 3: "📈 Efficiency" (2000ms - when narrator says "efficiency")  
    - Element 4: "💰 Cost Savings" (3000ms - when narrator says "cost savings")
    
    Document to convert:
    ${document}
    
    REMEMBER: The goal is to create slides that feel alive and dynamic, where visual elements appear in perfect synchronization with the narration to enhance understanding and engagement.
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