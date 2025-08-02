# makeitvid API Integration Reference

## External API Documentation

### 1. Google Gemini API (Updated 2025)

#### Documentation
- Official Docs: https://ai.google.dev/gemini-api/docs
- API Key: https://aistudio.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing

#### Quick Setup
```bash
npm install @google/genai
```

#### Basic Usage (New API)
```typescript
import { GoogleGenAI, Type } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
})

// With JSON response schema
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

const response = await ai.models.generateContentStream({
  model: 'gemini-2.5-flash-lite', // or 'gemini-2.5-flash' or 'gemini-2.5-pro'
  config,
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
})

for await (const chunk of response) {
  console.log(chunk.text)
}
```

#### Model Options (2025 - Verified Working)
- `gemini-2.5-flash-lite`: Fastest & lowest cost ($0.10/1M input, $0.40/1M output) ✅ TESTED
- `gemini-2.5-flash`: Balanced performance and cost
- `gemini-2.5-pro`: Highest capability model with advanced reasoning
- `gemini-2.0-flash-001`: Fallback option if 2.5 models unavailable
- Note: Gemini 1.5 models are being phased out for new projects after April 2025

#### Key Features
- **Streaming responses**: Better UX with `generateContentStream`
- **JSON mode**: Structured output with response schemas
- **1M token context**: Handle large documents
- **Multimodal**: Support for text, images, and audio

### 2. Cartesia API (Updated 2025)

#### Documentation
- Official Site: https://cartesia.ai
- API Docs: https://docs.cartesia.ai/get-started/overview
- API Keys: https://play.cartesia.ai/keys
- Pricing: Pay-as-you-go model

#### Quick Setup
```bash
npm install axios
# or use their official SDK when available
```

#### Basic Usage
```typescript
const response = await axios.post(
  'https://api.cartesia.ai/tts/bytes',
  {
    model_id: 'sonic-english', // or 'sonic-turbo' for 40ms latency
    transcript: 'Your text here',
    voice: {
      mode: 'id',
      id: 'a0e99841-438c-4a64-b679-ae501e7d6091' // Default voice ID
    },
    output_format: {
      container: 'mp3',
      encoding: 'mp3',
      sample_rate: 44100,
    },
    language: 'en', // Supports 15 languages
  },
  {
    headers: {
      'X-API-Key': API_KEY,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    responseType: 'arraybuffer',
  }
)
```

#### Models
- **Sonic 2**: Ultra-realistic TTS, 90ms first-byte latency
- **Sonic Turbo**: Fastest TTS, 40ms first-byte latency
- **Ink-Whisper**: Speech-to-text optimized for conversations

#### Key Features
- **Voice Cloning**: Pro and instant voice cloning
- **Multi-language**: 15 languages with accent localization
- **Real-time Streaming**: WebSocket support for live applications
- **Edge Deployment**: On-device voice AI capabilities

#### Voice Management
```typescript
// Get available voices
const voices = await axios.get(
  'https://api.cartesia.ai/voices',
  {
    headers: {
      'X-API-Key': API_KEY,
      'Cartesia-Version': '2024-06-10',
    }
  }
)

// Clone a voice (Pro feature)
const clonedVoice = await axios.post(
  'https://api.cartesia.ai/voices/clone',
  {
    name: 'My Custom Voice',
    description: 'Cloned voice for videos',
    audio_url: 'https://example.com/voice-sample.mp3',
  },
  {
    headers: {
      'X-API-Key': API_KEY,
      'Cartesia-Version': '2024-06-10',
    }
  }
)

### 3. Clerk Authentication

#### Documentation
- Official Docs: https://clerk.com/docs
- Next.js Guide: https://clerk.com/docs/nextjs/get-started-with-nextjs
- API Reference: https://clerk.com/docs/reference/clerkjs

#### Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### User Metadata Structure
```typescript
// Store API keys in public metadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    geminiKey: 'encrypted_key',
    cartesiaKey: 'encrypted_key',
  }
})
```

## Internal API Endpoints

### 1. Generate Script
```typescript
POST /api/generate/script
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "document": "Your document text here",
  "apiKey": "gemini_api_key",
  "steeringPrompt": "Optional customization"
}

Response:
{
  "script": [
    {
      "id": 1,
      "title": "Introduction",
      "content": "• Point 1\n• Point 2",
      "narration": "Welcome to...",
      "duration": 15
    }
  ]
}
```

### 2. Generate Voice
```typescript
POST /api/generate/voice
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "script": [...], // Array of script slides
  "apiKey": "cartesia_api_key"
}

Response:
{
  "audioUrl": "/temp/audio-uuid.mp3",
  "duration": 120 // seconds
}
```

### 3. Generate Video
```typescript
POST /api/generate/video
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "document": "Your document text",
  "geminiKey": "gemini_api_key",
  "cartesiaKey": "cartesia_api_key",
  "steeringPrompt": "Optional"
}

Response: Binary video file (video/mp4)
```

### 4. Update API Keys
```typescript
POST /api/keys/update
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "geminiKey": "new_gemini_key",
  "cartesiaKey": "new_cartesia_key"
}

Response:
{
  "success": true
}
```

### 5. List Projects
```typescript
GET /api/projects/list
Authorization: Bearer <clerk_token>

Response:
{
  "projects": [
    {
      "id": "uuid",
      "title": "My Video",
      "createdAt": "2024-01-01T00:00:00Z",
      "status": "completed",
      "videoUrl": "/videos/uuid.mp4"
    }
  ]
}
```

## Error Handling

### Common Error Responses
```typescript
// Unauthorized
{
  "error": "Unauthorized",
  "code": 401
}

// Invalid API Key
{
  "error": "Invalid API key",
  "code": 403
}

// Rate Limited
{
  "error": "Rate limit exceeded",
  "code": 429,
  "retryAfter": 60 // seconds
}

// Server Error
{
  "error": "Internal server error",
  "code": 500,
  "details": "Error message"
}
```

### Client-Side Error Handling
```typescript
try {
  const response = await fetch('/api/generate/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Request failed')
  }

  // Handle success
} catch (error) {
  if (error.message.includes('Rate limit')) {
    // Show rate limit message
  } else if (error.message.includes('Invalid API key')) {
    // Prompt to update API key
  } else {
    // Generic error handling
  }
}
```

## Performance Guidelines

### API Call Optimization
1. **Batch Requests**: Combine multiple operations when possible
2. **Caching**: Cache generated content for 24 hours
3. **Retry Logic**: Implement exponential backoff
4. **Timeouts**: Set reasonable timeouts (30s for generation)

### Rate Limiting Strategy
```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map()

export function checkRateLimit(userId: string): boolean {
  const key = `${userId}:${Date.now() / 60000 | 0}` // Per minute
  const count = rateLimiter.get(key) || 0
  
  if (count >= 10) return false // 10 requests per minute
  
  rateLimiter.set(key, count + 1)
  return true
}
```

## Cost Estimation

### Per Video Cost Breakdown
- **Gemini Flash**: ~$0.01 (5000 tokens)
- **Cartesia TTS**: ~$0.10 (2000 characters)
- **Total**: ~$0.11 per 2-minute video

### Monthly Cost Projection
- 100 videos/day = $330/month
- 1000 videos/day = $3,300/month

## Testing API Keys

### Integration Test Suite (Recommended)
```bash
# Run our comprehensive integration tests
npx tsx src/tests/api-integration.test.ts

# This tests both Gemini and Cartesia with real API calls
```

### Manual Gemini Test
```bash
# Using the new @google/genai package
npx tsx -e "
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-lite',
  contents: 'Say hello'
});
console.log(response.text);
"
```

### Manual Cartesia Test
```bash
curl -X POST https://api.cartesia.ai/tts/bytes \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Cartesia-Version: 2024-06-10" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "sonic-english",
    "transcript": "Hello world",
    "voice": {"mode": "id", "id": "a0e99841-438c-4a64-b679-ae501e7d6091"},
    "output_format": {"container": "mp3", "encoding": "mp3", "sample_rate": 44100},
    "language": "en"
  }' --output test.mp3
```

## Important Notes from Testing

1. **Cartesia API Changes**:
   - Uses `X-API-Key` header, not `Authorization`
   - Endpoint is `/tts/bytes` not `/v1/audio/speech`
   - No `speed` parameter support (causes 422 error)
   - Requires `Cartesia-Version` header

2. **Gemini API Updates**:
   - Use `@google/genai` package (not `@google/generative-ai`)
   - Use `generateContentStream` for better performance
   - Type imports required for schema definitions
   - Models: Use `gemini-2.5-flash-lite` for best cost/performance

---

*Keep this reference handy during development. Update API keys and endpoints as services evolve.*