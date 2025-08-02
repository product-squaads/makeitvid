import * as dotenv from 'dotenv'
import { promises as fs } from 'fs'
import path from 'path'
import { generateVoiceForSlides } from '../lib/ai/cartesia'
import { generateVoiceForSlidesWithGemini, getAvailableGeminiVoices } from '../lib/ai/gemini-tts'
import { ScriptSlide } from '../lib/ai/gemini'

dotenv.config({ path: '.env.local' })

// Sample slides for testing
const testSlides: ScriptSlide[] = [
  {
    id: 1,
    title: "Welcome to makeitvid",
    content: "• Transform your documents into videos\n• AI-powered script generation\n• Professional voice narration",
    narration: "Welcome to makeitvid, the revolutionary platform that transforms your documents into engaging videos with AI-powered script generation and professional voice narration.",
    duration: 8
  },
  {
    id: 2,
    title: "How It Works",
    content: "• Upload your document\n• AI generates a script\n• Choose your voice\n• Get your video",
    narration: "Here's how it works: Simply upload your document, our AI generates a compelling script, you choose your preferred voice, and within minutes, you'll have a professional video ready to share.",
    duration: 10
  }
]

async function testCartesiaTTS() {
  console.log('\n🎵 Testing Cartesia TTS...')
  
  const apiKey = process.env.CARTESIA_API_KEY
  if (!apiKey) {
    console.error('❌ CARTESIA_API_KEY not found in environment')
    return
  }

  try {
    console.log('Generating voice with Cartesia...')
    const startTime = Date.now()
    
    const result = await generateVoiceForSlides(testSlides, apiKey)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`✅ Cartesia TTS successful!`)
    console.log(`   - Generation time: ${duration.toFixed(2)}s`)
    console.log(`   - Audio size: ${(result.audioBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`   - Format: ${result.format}`)
    console.log(`   - Estimated duration: ${result.duration}s`)
    
    // Save the audio file
    const outputPath = path.join(process.cwd(), 'temp', 'cartesia-test.mp3')
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, Buffer.from(result.audioBuffer))
    console.log(`   - Saved to: ${outputPath}`)
    
    return { success: true, duration, size: result.audioBuffer.length }
  } catch (error) {
    console.error('❌ Cartesia TTS failed:', error)
    return { success: false, error }
  }
}

async function testGeminiTTS() {
  console.log('\n🎵 Testing Gemini TTS...')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not found in environment')
    return
  }

  try {
    // First, list available voices
    console.log('Available Gemini voices:')
    const voices = getAvailableGeminiVoices()
    voices.forEach(voice => {
      console.log(`   - ${voice.name}: ${voice.description}`)
    })
    
    console.log('\nGenerating voice with Gemini...')
    const startTime = Date.now()
    
    const result = await generateVoiceForSlidesWithGemini(testSlides, apiKey, {
      voiceName: 'Kore' // Using the "Firm" voice
    })
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log(`✅ Gemini TTS successful!`)
    console.log(`   - Generation time: ${duration.toFixed(2)}s`)
    console.log(`   - Audio size: ${(result.audioBuffer.length / 1024).toFixed(2)} KB`)
    console.log(`   - Format: ${result.format}`)
    console.log(`   - Estimated duration: ${result.duration}s`)
    
    // Save the audio file (Gemini returns WAV format)
    const outputPath = path.join(process.cwd(), 'temp', `gemini-test.${result.format}`)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, Buffer.from(result.audioBuffer))
    console.log(`   - Saved to: ${outputPath}`)
    
    return { success: true, duration, size: result.audioBuffer.length }
  } catch (error) {
    console.error('❌ Gemini TTS failed:', error)
    return { success: false, error }
  }
}

async function compareResults(cartesiaResult: any, geminiResult: any) {
  console.log('\n📊 Comparison Results:')
  console.log('━'.repeat(50))
  
  if (cartesiaResult?.success && geminiResult?.success) {
    console.log('Feature          | Cartesia      | Gemini')
    console.log('━'.repeat(50))
    console.log(`Generation Time  | ${cartesiaResult.duration.toFixed(2)}s        | ${geminiResult.duration.toFixed(2)}s`)
    console.log(`Audio Size       | ${(cartesiaResult.size / 1024).toFixed(0)} KB       | ${(geminiResult.size / 1024).toFixed(0)} KB`)
    console.log(`Speed Advantage  | ${cartesiaResult.duration < geminiResult.duration ? '✅ Faster' : '❌ Slower'}    | ${geminiResult.duration < cartesiaResult.duration ? '✅ Faster' : '❌ Slower'}`)
    console.log(`Size Advantage   | ${cartesiaResult.size < geminiResult.size ? '✅ Smaller' : '❌ Larger'}   | ${geminiResult.size < cartesiaResult.size ? '✅ Smaller' : '❌ Larger'}`)
  }
  
  console.log('\n💡 Recommendations:')
  console.log('- Cartesia: Specialized TTS service, likely better voice quality')
  console.log('- Gemini: Unified API (script + voice), simpler integration')
  console.log('- Consider offering both options to users')
  console.log('- Test audio quality by listening to both outputs')
}

async function runTests() {
  console.log('🚀 Starting TTS Comparison Tests')
  console.log('================================')
  
  const cartesiaResult = await testCartesiaTTS()
  const geminiResult = await testGeminiTTS()
  
  await compareResults(cartesiaResult, geminiResult)
  
  console.log('\n✨ Tests completed! Check the temp/ folder for audio outputs.')
  console.log('🎧 Listen to both files to compare voice quality.')
}

// Run the tests
runTests().catch(console.error)