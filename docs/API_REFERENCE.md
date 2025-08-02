# makeitvid API Integration Reference

## External API Documentation

### 1. Google Gemini API

#### Documentation
- Official Docs: https://ai.google.dev/docs
- API Key: https://makersuite.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing

#### Quick Setup
```bash
npm install @google/generative-ai
```

#### Basic Usage
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const result = await model.generateContent(prompt)
const response = await result.response
const text = response.text()
```

#### Model Options
- `gemini-1.5-flash`: Fast, cost-effective (recommended for MVP)
- `gemini-1.5-pro`: More capable, higher cost
- `gemini-1.0-pro`: Legacy model

#### Rate Limits
- Free tier: 60 requests per minute
- Paid tier: 360 requests per minute

### 2. Cartesia API

#### Documentation
- Official Site: https://cartesia.ai
- API Docs: https://docs.cartesia.ai
- Pricing: $0.05 per 1000 characters

#### Quick Setup
```bash
npm install axios
```

#### Basic Usage
```typescript
const response = await axios.post(
  'https://api.cartesia.ai/v1/audio/speech',
  {
    text: 'Your text here',
    voice: 'en-US-1',
    output_format: 'mp3',
    speed: 1.0,
  },
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    responseType: 'arraybuffer',
  }
)
```

#### Voice Options
- `en-US-1`: Default American English
- `en-UK-1`: British English
- Multiple other voices available

#### Audio Formats
- `mp3`: Recommended for web
- `wav`: Higher quality, larger files
- `pcm`: Raw audio data

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

### Gemini Test
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Cartesia Test
```bash
curl -X POST https://api.cartesia.ai/v1/audio/speech \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"en-US-1","output_format":"mp3"}'
```

---

*Keep this reference handy during development. Update API keys and endpoints as services evolve.*