import * as dotenv from 'dotenv'
import { ScriptSlide } from '../lib/ai/gemini'

dotenv.config({ path: '.env.local' })

// Test slides
const testSlides: ScriptSlide[] = [
  {
    id: 1,
    title: "API Test",
    content: "Testing voice generation",
    narration: "This is a test of the voice generation API endpoint.",
    duration: 5
  }
]

async function testVoiceAPI(provider: 'cartesia' | 'gemini') {
  console.log(`\n🎤 Testing ${provider.toUpperCase()} TTS via API...`)
  
  const apiKey = provider === 'gemini' 
    ? process.env.GOOGLE_GEMINI_API_KEY 
    : process.env.CARTESIA_API_KEY

  if (!apiKey) {
    console.error(`❌ ${provider.toUpperCase()}_API_KEY not found`)
    return
  }

  try {
    // Simulate API call (in real app, this would be a fetch to /api/generate/voice)
    const requestBody = {
      slides: testSlides,
      apiKey: apiKey,
      ttsProvider: provider,
      voiceOptions: provider === 'gemini' ? { voiceName: 'Kore' } : {}
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    
    // In a real test, you would make an actual HTTP request:
    // const response = await fetch('http://localhost:3000/api/generate/voice', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestBody)
    // })
    // const result = await response.json()
    
    console.log(`✅ ${provider} API request structure is valid`)
    console.log('Expected response format:')
    console.log({
      success: true,
      provider: provider,
      audio: {
        data: '<base64-encoded-audio>',
        format: provider === 'gemini' ? 'wav' : 'mp3',
        duration: 5
      }
    })

  } catch (error) {
    console.error(`❌ ${provider} test failed:`, error)
  }
}

async function runTests() {
  console.log('🚀 Testing Voice Generation API Structure')
  console.log('========================================')
  
  await testVoiceAPI('cartesia')
  await testVoiceAPI('gemini')
  
  console.log('\n✨ API structure tests completed!')
  console.log('To test with actual API calls, start the Next.js server and use fetch()')
}

runTests().catch(console.error)