// Quick test to verify HTML slide generation
// Run with: npx tsx src/tests/test-html-generation.ts

const testSlide = {
  id: 1,
  narration: "This is a test narration for our slide.",
  duration: 20,
  html: `<!DOCTYPE html>
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
      background: linear-gradient(to bottom right, #581c87, #1e3a8a, #312e81);
      font-family: -apple-system, system-ui, sans-serif;
      color: white;
    }
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
    p { font-size: 36px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="slide">
    <h1>Test Slide</h1>
    <p>If you can see this, the HTML generation is working!</p>
    <p>This slide has a cosmic theme background.</p>
  </div>
</body>
</html>`
}

console.log('Test HTML Slide:')
console.log('================')
console.log(`ID: ${testSlide.id}`)
console.log(`Duration: ${testSlide.duration}s`)
console.log(`Narration: ${testSlide.narration}`)
console.log(`HTML Length: ${testSlide.html.length} characters`)
console.log('\nHTML Preview:')
console.log(testSlide.html.substring(0, 200) + '...')

// Write to file for manual inspection
import * as fs from 'fs'
import * as path from 'path'

const outputPath = path.join(__dirname, 'test-slide.html')
fs.writeFileSync(outputPath, testSlide.html)
console.log(`\nTest slide written to: ${outputPath}`)
console.log('Open this file in a browser to verify the slide renders correctly.')