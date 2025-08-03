import { GoogleGenAI, Type } from '@google/genai'
import { SlideTheme } from '../slide-themes'

export interface ScriptSlide {
  id: number
  narration: string
  duration: number // seconds
  html: string // Complete HTML for the slide
}

export interface GenerateScriptResponse {
  slides: ScriptSlide[]
}

export async function generateVideoScript(
  document: string,
  apiKey: string,
  steeringPrompt?: string,
  sections: number = 3,
  theme?: SlideTheme,
  animationType?: string
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
            required: ["id", "narration", "duration", "html"],
            properties: {
              id: { type: Type.NUMBER },
              narration: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              html: { type: Type.STRING },
            },
          },
        },
      },
    },
  }

  // Convert Tailwind classes to CSS
  const getBackgroundCSS = () => {
    if (!theme) return 'background: #1a1a1a;'
    const gradient = theme.colors.backgroundGradient || 'bg-gradient-to-br'
    const colors = theme.colors.background
    
    // Map Tailwind gradient directions to CSS
    const directionMap: Record<string, string> = {
      'bg-gradient-to-br': 'to bottom right',
      'bg-gradient-to-tr': 'to top right',
      'bg-gradient-to-bl': 'to bottom left',
      'bg-gradient-to-tl': 'to top left',
      'bg-gradient-to-b': 'to bottom',
      'bg-gradient-to-t': 'to top',
      'bg-gradient-to-r': 'to right',
      'bg-gradient-to-l': 'to left'
    }
    
    const direction = directionMap[gradient] || 'to bottom right'
    
    // Convert Tailwind color classes to hex
    const colorMap: Record<string, string> = {
      'from-purple-900': '#581c87',
      'via-blue-900': '#1e3a8a',
      'to-indigo-900': '#312e81',
      'from-gray-50': '#f9fafb',
      'to-white': '#ffffff',
      'from-pink-500': '#ec4899',
      'via-red-500': '#ef4444',
      'to-yellow-500': '#eab308',
      'from-slate-900': '#0f172a',
      'to-blue-900': '#1e3a8a',
      'from-green-800': '#166534',
      'via-green-700': '#15803d',
      'to-emerald-800': '#065f46',
      'from-black': '#000000',
      'via-gray-900': '#111827',
      'to-black': '#000000'
    }
    
    const colorParts = colors.split(' ')
    const mappedColors = colorParts.map(c => colorMap[c] || '#000000').join(', ')
    
    return `background: linear-gradient(${direction}, ${mappedColors});`
  }
  
  const getTextColor = (tailwindClass: string) => {
    const colorMap: Record<string, string> = {
      'text-white': '#ffffff',
      'text-gray-300': '#d1d5db',
      'text-gray-100': '#f3f4f6',
      'text-purple-400': '#c084fc',
      'text-gray-900': '#111827',
      'text-gray-700': '#374151',
      'text-gray-600': '#4b5563',
      'text-blue-600': '#2563eb',
      'text-yellow-100': '#fef3c7',
      'text-yellow-300': '#fde047',
      'text-blue-200': '#bfdbfe',
      'text-gray-200': '#e5e7eb',
      'text-blue-400': '#60a5fa',
      'text-green-100': '#dcfce7',
      'text-green-50': '#f0fdf4',
      'text-lime-400': '#a3e635',
      'text-gray-400': '#9ca3af',
      'text-indigo-400': '#818cf8'
    }
    return colorMap[tailwindClass] || '#000000'
  }

  const themeCSS = theme ? `
    /* Theme Colors */
    .slide-background { ${getBackgroundCSS()} }
    .primary-text { color: ${getTextColor(theme.colors.primary)}; }
    .secondary-text { color: ${getTextColor(theme.colors.secondary)}; }
    .body-text { color: ${getTextColor(theme.colors.text)}; }
    .accent-text { color: ${getTextColor(theme.colors.accent)}; }
    
    /* Theme Fonts */
    .heading { ${theme.fonts.heading}; }
    .body { ${theme.fonts.body}; }
  ` : ''

  const animationCSS = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-60px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.7); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes typewriter {
      from { width: 0; }
      to { width: 100%; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animate-fade { animation: fadeIn 1.5s ease-out forwards; }
    .animate-slide { animation: slideIn 1.5s ease-out forwards; }
    .animate-zoom { animation: zoomIn 1.5s ease-out forwards; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-typewriter { 
      overflow: hidden;
      white-space: nowrap;
      animation: typewriter 3s steps(40, end) forwards;
    }
  `

  const prompt = `
    Create ${sections} HTML slides for a video presentation. Each slide must be a complete, self-contained HTML document.
    ${steeringPrompt ? `Additional instructions: ${steeringPrompt}` : ''}
    
    CRITICAL REQUIREMENTS:
    
    1. For each slide, generate:
       - id: Sequential number (1, 2, 3, etc.)
       - narration: Natural speaking script (50-100 words)
       - duration: Time in seconds (20-25 recommended, animations should span this duration)
       - html: COMPLETE HTML document with all styling and animations
    
    2. HTML STRUCTURE for each slide:
       <!DOCTYPE html>
       <html>
       <head>
         <style>
           * { margin: 0; padding: 0; box-sizing: border-box; }
           body {
             width: 1920px;
             height: 1080px;
             display: flex;
             align-items: center;
             justify-content: center;
             overflow: hidden;
             font-family: -apple-system, system-ui, sans-serif;
           }
           
           ${themeCSS}
           ${animationCSS}
           
           .slide {
             width: 100%;
             height: 100%;
             padding: 80px;
             display: flex;
             flex-direction: column;
             justify-content: center;
             position: relative;
           }
           
           h1 { font-size: 72px; margin-bottom: 40px; }
           h2 { font-size: 56px; margin-bottom: 32px; }
           p { font-size: 36px; line-height: 1.6; margin-bottom: 24px; }
           
           .element { opacity: 0; }
           .element-1 { animation-delay: 0ms; }
           .element-2 { animation-delay: 2500ms; }
           .element-3 { animation-delay: 5000ms; }
           .element-4 { animation-delay: 7500ms; }
           .element-5 { animation-delay: 10000ms; }
           .element-6 { animation-delay: 12500ms; }
           .element-7 { animation-delay: 15000ms; }
           .element-8 { animation-delay: 17500ms; }
           .element-9 { animation-delay: 20000ms; }
           .element-10 { animation-delay: 22500ms; }
           
           /* Background patterns */
           .floating-shapes {
             position: absolute;
             width: 100%;
             height: 100%;
             overflow: hidden;
             opacity: 0.1;
           }
           
           .floating-shape {
             position: absolute;
             background: currentColor;
             border-radius: 50%;
             animation: float 20s infinite ease-in-out;
           }
           
           @keyframes float {
             0%, 100% { transform: translateY(0) translateX(0) scale(1); }
             33% { transform: translateY(-100px) translateX(100px) scale(1.1); }
             66% { transform: translateY(100px) translateX(-100px) scale(0.9); }
           }
         </style>
       </head>
       <body class="slide-background">
         <div class="slide">
           <!-- Your animated content here -->
         </div>
       </body>
       </html>
    
    3. CRITICAL CONTENT REQUIREMENTS:
       - EVERY slide MUST have substantial text content that appears with animations
       - Create at least 3-5 animated text elements per slide
       - Use a mix of headlines, bullet points, statistics, and emphasis text
       - Text should fill the slide space effectively - don't leave large empty areas
       - Animate text elements sequentially to match narration timing
       - Use large, readable fonts (h1: 72px, h2: 56px, p: 36px minimum)
    
    4. ANIMATION PATTERNS TO USE:
       - IMPORTANT: Distribute animations across the ENTIRE duration of the slide (15-30 seconds)
       - Stagger text animations every 2500-3000ms to fill the full timeline
       - Each animation should take 1.5-3 seconds to complete
       - Use different animation types: fade, slide, zoom, typewriter
       - Add emphasis animations (pulse) to key points after they appear
       - Create visual hierarchy with size and timing
       - Ensure the last element appears around 15-18 seconds into the slide
    
    5. EXAMPLE SLIDE STRUCTURE:
       <div class="slide">
         <h1 class="element element-1 animate-zoom primary-text heading">Main Title</h1>
         <div class="element element-2 animate-slide">
           <h2 class="secondary-text">Subtitle or Key Point</h2>
         </div>
         <ul style="list-style: none; padding: 0; margin-top: 40px;">
           <li class="element element-3 animate-fade body-text" style="margin-bottom: 24px; display: flex; align-items: center;">
             <span style="font-size: 48px; margin-right: 20px;">📊</span>
             <span>First important point with detail</span>
           </li>
           <li class="element element-4 animate-fade body-text" style="margin-bottom: 24px; display: flex; align-items: center;">
             <span style="font-size: 48px; margin-right: 20px;">💡</span>
             <span>Second key insight or statistic</span>
           </li>
           <li class="element element-5 animate-fade body-text" style="margin-bottom: 24px; display: flex; align-items: center;">
             <span style="font-size: 48px; margin-right: 20px;">🚀</span>
             <span>Third compelling point</span>
           </li>
         </ul>
         <div class="element element-6 animate-zoom" style="margin-top: 60px;">
           <p class="accent-text" style="font-size: 48px; font-weight: bold;">"Key Quote or Call to Action"</p>
         </div>
         <div class="element element-7 animate-fade" style="margin-top: 30px;">
           <p class="body-text" style="opacity: 0.8;">Remember: Each element should appear at 2.5-3 second intervals</p>
         </div>
         <div class="element element-8 animate-slide" style="margin-top: 20px;">
           <p class="secondary-text">This ensures animations span the full 20+ seconds</p>
         </div>
       </div>
    
    Document to convert:
    ${document}
    
    IMPORTANT FINAL REQUIREMENTS:
    - Return ONLY valid JSON with complete HTML documents
    - Each slide MUST have substantial animated text content - no empty or minimal slides
    - CRITICAL: Animations must span the ENTIRE duration (15-30 seconds) of each slide
    - Space out elements with 2.5-3 second intervals (element-1 at 0s, element-2 at 2.5s, etc.)
    - The last animated element should appear around 15-18 seconds into the slide
    - Text should progressively reveal to match the narration flow and timing
    - Each HTML must render perfectly at 1920x1080 resolution
    - Focus on CONTENT over decoration - viewers need to read and understand information
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
      model: 'gemini-2.5-flash-lite',
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
      narration: slide.narration || '',
      duration: Math.max(15, Math.min(30, slide.duration || 20)), // Clamp between 15-30 seconds
      html: slide.html || `<!DOCTYPE html><html><head><style>body{width:1920px;height:1080px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;font-family:sans-serif;}</style></head><body><h1>Slide ${index + 1}</h1></body></html>`
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