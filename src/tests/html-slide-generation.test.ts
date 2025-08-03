import { generateVideoScript } from '@/lib/ai/gemini'
import { getThemeById } from '@/lib/slide-themes'
import * as fs from 'fs'
import * as path from 'path'

async function testHtmlSlideGeneration() {
  console.log('Testing HTML Slide Generation with Gemini...\n')

  // Test configuration
  const testDocument = `
    Artificial Intelligence is transforming our world in unprecedented ways. 
    From healthcare to transportation, AI is revolutionizing how we live and work. 
    Machine learning algorithms can now diagnose diseases, drive cars, and even create art. 
    The future of AI holds incredible possibilities for humanity.
  `

  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) {
    console.error('Please set GEMINI_API_KEY environment variable')
    process.exit(1)
  }

  try {
    // Test with different themes
    const themes = ['cosmic', 'minimal', 'vibrant']
    
    for (const themeId of themes) {
      console.log(`\nGenerating slides with ${themeId} theme...`)
      
      const theme = getThemeById(themeId)
      const slides = await generateVideoScript(
        testDocument,
        apiKey,
        'Create engaging, content-rich slides about AI',
        3,
        theme,
        'dynamic'
      )

      console.log(`Generated ${slides.length} slides`)

      // Create output directory
      const outputDir = path.join(__dirname, 'html-slides-output', themeId)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Save each slide as HTML file
      slides.forEach((slide, index) => {
        const fileName = `slide-${index + 1}.html`
        const filePath = path.join(outputDir, fileName)
        
        fs.writeFileSync(filePath, slide.html)
        console.log(`  - Saved ${fileName} (${slide.duration}s)`)
        console.log(`    Narration: ${slide.narration.substring(0, 50)}...`)
      })

      // Create an index file to view all slides
      const indexHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${themeId} Theme Slides</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .slide-container { margin: 20px 0; }
            iframe { border: 1px solid #ccc; width: 960px; height: 540px; }
            h2 { margin-top: 40px; }
          </style>
        </head>
        <body>
          <h1>${themeId.charAt(0).toUpperCase() + themeId.slice(1)} Theme Slides</h1>
          ${slides.map((slide, index) => `
            <div class="slide-container">
              <h2>Slide ${index + 1} (${slide.duration}s)</h2>
              <p><strong>Narration:</strong> ${slide.narration}</p>
              <iframe src="slide-${index + 1}.html"></iframe>
            </div>
          `).join('')}
        </body>
        </html>
      `
      
      fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml)
      console.log(`  - Created index.html for easy viewing`)
    }

    console.log('\n✅ Test completed successfully!')
    console.log(`View the generated slides in: ${path.join(__dirname, 'html-slides-output')}`)

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testHtmlSlideGeneration()