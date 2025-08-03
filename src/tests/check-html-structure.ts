// Test to check the HTML structure being generated
import { generateVideoScript } from '../lib/ai/gemini'

async function testHtmlGeneration() {
  const testDocument = "This is a test document about AI and technology."
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ''
  
  if (!apiKey) {
    console.error('❌ Please set GOOGLE_GEMINI_API_KEY environment variable')
    return
  }

  try {
    console.log('🔍 Testing HTML slide generation...')
    const slides = await generateVideoScript(
      testDocument,
      apiKey,
      undefined,
      2, // Just 2 slides for testing
      undefined,
      'fade'
    )
    
    console.log(`\n✅ Generated ${slides.length} slides\n`)
    
    slides.forEach((slide, index) => {
      console.log(`\n=== Slide ${index + 1} ===`)
      console.log('ID:', slide.id)
      console.log('Duration:', slide.duration, 'seconds')
      console.log('Narration length:', slide.narration.length, 'chars')
      console.log('HTML length:', slide.html.length, 'chars')
      console.log('HTML preview (first 500 chars):')
      console.log(slide.html.substring(0, 500) + '...')
      
      // Check for required elements
      const hasDoctype = slide.html.includes('<!DOCTYPE')
      const hasHtml = slide.html.includes('<html')
      const hasHead = slide.html.includes('<head>')
      const hasBody = slide.html.includes('<body')
      const hasSlideContainer = slide.html.includes('slide-container') || slide.html.includes('class="slide')
      
      console.log('\nStructure checks:')
      console.log('- Has DOCTYPE:', hasDoctype)
      console.log('- Has <html>:', hasHtml)
      console.log('- Has <head>:', hasHead)
      console.log('- Has <body>:', hasBody)
      console.log('- Has slide container:', hasSlideContainer)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testHtmlGeneration()