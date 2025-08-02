/**
 * Integration tests for Gemini and Cartesia APIs
 * Run with: node --loader tsx src/tests/api-integration.test.ts
 */

import { generateVideoScript } from '../lib/ai/gemini'
import { generateVoiceForSlides } from '../lib/ai/cartesia'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

const TEST_DOCUMENT = `
Artificial Intelligence is transforming our world. 
AI systems can now understand language, recognize images, and even create art. 
Machine learning algorithms learn from data to make predictions and decisions.
The future of AI promises both exciting opportunities and important challenges we must address.
`

async function testGeminiIntegration() {
  console.log('\n🧪 Testing Gemini Integration...')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not found in environment variables')
    return false
  }
  
  console.log('✓ API key found:', apiKey.substring(0, 10) + '...')
  
  try {
    console.log('📝 Generating script from test document...')
    const slides = await generateVideoScript(
      TEST_DOCUMENT,
      apiKey,
      'Make it engaging and educational'
    )
    
    console.log('✅ Script generated successfully!')
    console.log(`   - Total slides: ${slides.length}`)
    console.log(`   - Total duration: ${slides.reduce((sum, s) => sum + s.duration, 0)} seconds`)
    
    // Display first slide as sample
    if (slides.length > 0) {
      console.log('\n📄 Sample slide:')
      console.log(`   Title: ${slides[0].title}`)
      console.log(`   Content: ${slides[0].content.substring(0, 100)}...`)
      console.log(`   Narration: ${slides[0].narration.substring(0, 100)}...`)
      console.log(`   Duration: ${slides[0].duration}s`)
    }
    
    return slides
  } catch (error) {
    console.error('❌ Gemini test failed:')
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    } else {
      console.error('   Unknown error:', error)
    }
    return false
  }
}

async function testCartesiaIntegration(slides: any) {
  console.log('\n🎙️ Testing Cartesia Integration...')
  
  const apiKey = process.env.CARTESIA_API_KEY
  
  if (!apiKey) {
    console.error('❌ CARTESIA_API_KEY not found in environment variables')
    return false
  }
  
  console.log('✓ API key found:', apiKey.substring(0, 10) + '...')
  
  if (!slides || slides.length === 0) {
    console.error('❌ No slides provided for voice generation')
    return false
  }
  
  try {
    console.log('🎵 Generating voice narration...')
    const voiceResult = await generateVoiceForSlides(
      slides,
      apiKey
    )
    
    console.log('✅ Voice generated successfully!')
    console.log(`   - Audio format: ${voiceResult.format}`)
    console.log(`   - Estimated duration: ${voiceResult.duration} seconds`)
    console.log(`   - Audio size: ${(voiceResult.audioBuffer.length / 1024).toFixed(2)} KB`)
    
    // Save a sample audio file for testing
    const fs = require('fs')
    const outputPath = 'test-narration.mp3'
    fs.writeFileSync(outputPath, voiceResult.audioBuffer)
    console.log(`   - Sample saved to: ${outputPath}`)
    
    return true
  } catch (error) {
    console.error('❌ Cartesia test failed:', error)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Integration Tests')
  console.log('================================')
  
  // Test Gemini
  const slides = await testGeminiIntegration()
  
  if (slides) {
    // Test Cartesia with the generated slides
    await testCartesiaIntegration(slides)
  }
  
  console.log('\n✨ Tests completed!')
}

// Run tests
runAllTests().catch(console.error)