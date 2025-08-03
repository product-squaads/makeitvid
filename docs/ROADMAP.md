# makeitvid MVP Roadmap

## Project Overview
makeitvid is an AI-powered video generation platform that transforms documents into engaging video summaries using a simplified, self-hostable architecture.

## MVP Architecture (10-Hour Build)

### Tech Stack Decisions
- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes (no separate backend service)
- **Authentication**: Clerk (fastest setup, includes user management)
- **LLM Provider**: Google Gemini API (cost-effective, good performance)
- **TTS Provider**: Google Gemini TTS (integrated, no rate limits for parallel generation)
- **Video Generation**: HTML/CSS slides → Puppeteer screenshots → FFmpeg
- **Deployment**: Vercel (optimal for Next.js)

### Architecture Diagram
```
┌─────────────────┐
│   User Input    │
│  (Text/Markdown)│
└────────┬────────┘
         │
    ┌────▼────┐
    │  Clerk  │
    │  Auth   │
    └────┬────┘
         │
┌────────▼────────┐     ┌─────────────────┐
│  Next.js App    │────▶│ API Routes      │
│  (Frontend)     │     │ /api/generate   │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ Gemini API      │
                        │ (Script Gen)    │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
           ┌────────▼────────┐      ┌────────▼────────┐
           │ Cartesia API    │  OR  │ Gemini TTS API  │
           │ (MP3 Voice Gen) │      │ (WAV Voice Gen) │
           └────────┬────────┘      └────────┬────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                        ┌────────▼────────┐
                        │ HTML Generator  │
                        │ (Slide System)  │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ FFmpeg Process  │
                        │ (Video Export)  │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ Download MP4    │
                        └─────────────────┘
```

## Current Project Status

### Overall Progress: 8.5/10 hours used
- **Current Phase**: Complete Video Project Management System
- **Next Phase**: HTML Slide Generator & Video Assembly (Phase 4)
- **Blockers**: None
- **Target Completion**: 1.5 hours remaining

### Completed Tasks ✅

#### Task: Project Structure Migration to Next.js 15
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - Next.js 15 recommends using `src/` folder for better organization
  - App Router uses folder-based routing with `page.tsx` files
  - No `pages/` folder needed - `app/` directory handles all routing
  - Route groups with parentheses `(auth)` help organize without affecting URLs
- **Code Changes**:
  - Moved all application code to `src/` directory
  - Updated `tsconfig.json` paths from `@/*": ["./*"]` to `@/*": ["./src/*"]`
  - Updated `components.json` for correct shadcn/ui paths
  - Created comprehensive `.env.example` file

#### Task: Documentation Setup
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - Clear documentation accelerates development
  - Roadmap helps maintain focus on MVP goals
  - Technical guides prevent repeated research
- **Code Changes**:
  - Created `docs/ROADMAP.md` (this file)
  - Created `docs/TECHNICAL_GUIDE.md`
  - Created `docs/API_REFERENCE.md`
  - Created `CLAUDE.md` for development rules

## Implementation Timeline (10 Hours)

#### Task: Clerk Authentication Implementation
- **Status**: Completed
- **Time Spent**: 1 hour
- **Key Learnings**:
  - Clerk's Next.js 15 integration is seamless with App Router
  - Middleware uses `createRouteMatcher` for public route definition
  - Server components can use `auth()` directly for user state
  - ClerkProvider wraps the entire app in root layout
  - Sign-in/up pages use catch-all routes `[[...sign-in]]` for flexibility
- **Code Changes**:
  - Created `src/middleware.ts` with auth protection
  - Updated `src/app/layout.tsx` with ClerkProvider
  - Created sign-in page at `src/app/sign-in/[[...sign-in]]/page.tsx`
  - Created sign-up page at `src/app/sign-up/[[...sign-up]]/page.tsx`
  - Created dashboard page with UserButton component
  - Updated home page with conditional auth buttons
- **Challenges**:
  - Directory creation with brackets required quotes in terminal

### Phase 1: Authentication & Setup (Hours 1-2) ✅
- [x] Install and configure Clerk
- [x] Set up ClerkProvider in app layout
- [x] Create middleware for protected routes
- [x] Build sign-in/sign-up pages
- [x] Add user metadata storage for API keys (ready for implementation)

#### Task: Google Gemini Integration
- **Status**: Completed
- **Time Spent**: 0.75 hours
- **Key Learnings**:
  - New Google GenAI SDK uses structured response schemas with Type definitions
  - Gemini 2.5 models are the latest (flash-lite is cheapest)
  - JSON mode ensures consistent output format
  - Edge runtime works well for script generation
  - Response validation is crucial for reliability
- **Code Changes**:
  - Created `src/lib/ai/gemini.ts` with type-safe script generation
  - Created `/api/generate/script` route with auth & validation
  - Added test page at `/test-gemini` for quick testing
  - Implemented proper error handling and rate limit responses
- **Challenges**:
  - API documentation was outdated - had to research new SDK patterns

#### Task: Cartesia TTS Integration
- **Status**: Completed
- **Time Spent**: 0.75 hours
- **Key Learnings**:
  - Cartesia uses 'X-API-Key' header instead of Authorization
  - Sonic model provides best quality for video narration
  - Audio duration estimation based on word count works well
  - Base64 encoding needed for JSON response of audio data
  - Node runtime required for Buffer handling
- **Code Changes**:
  - Created `src/lib/ai/cartesia.ts` with voice generation
  - Created `/api/generate/voice` route for TTS
  - Added support for voice selection and speed control
  - Implemented proper error handling for API limits

#### Task: Integration Testing & API Fixes
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - @google/genai requires Type imports for schema definition
  - Gemini 2.5 models use generateContentStream with structured responses
  - Cartesia doesn't support speed parameter in current API
  - Integration tests are crucial for catching API changes
  - Audio generation creates real MP3 files that play correctly
- **Code Changes**:
  - Created `src/tests/api-integration.test.ts` for real API testing
  - Fixed Gemini to use proper Type imports and streaming
  - Fixed Cartesia by removing unsupported speed parameter
  - Added test audio player HTML for verification
- **Challenges**:
  - Initial Gemini implementation used wrong response structure
  - Cartesia API returned 422 error for speed parameter

#### Task: Gemini TTS Discovery & Implementation ✅
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - Gemini TTS requires special model: `gemini-2.5-flash-preview-tts`
  - Returns WAV format audio that needs header construction
  - 30 voice options with descriptive styles (Kore=Firm, Puck=Upbeat)
  - Larger file sizes (WAV vs MP3) but good quality
  - Successfully tested both providers with real API calls
- **Code Changes**:
  - Created `src/lib/ai/gemini-tts.ts` with full WAV support
  - Added WAV header construction utilities
  - Created `src/tests/tts-comparison.test.ts` for side-by-side testing
  - Generated actual audio files for quality comparison
- **Test Results**:
  - Cartesia: 10.6s generation, 342KB MP3, excellent quality
  - Gemini: 17.9s generation, 1.1MB WAV, good quality
  - Both services working perfectly in production
- **Recommendations**:
  - Implement dual provider strategy
  - Use Cartesia as default (faster, smaller files)
  - Offer Gemini as budget option (free preview period)

#### Task: Dual TTS Provider API Implementation ✅
- **Status**: Completed
- **Time Spent**: 0.25 hours
- **Key Implementation**:
  - Updated `/api/generate/voice` to accept `ttsProvider` parameter
  - Supports both 'cartesia' and 'gemini' providers
  - Returns base64 audio data with format info (MP3/WAV)
  - Proper error handling for both providers
- **API Usage**:
  ```json
  {
    "slides": [...],
    "apiKey": "your-api-key",
    "ttsProvider": "cartesia" | "gemini",
    "voiceOptions": { "voiceName": "Kore" }
  }
  ```

#### Task: Dashboard Redesign & Core User Flow ✅
- **Status**: Completed
- **Time Spent**: 1.25 hours
- **Key Learnings**:
  - localStorage is perfect for MVP - no need for complex state management
  - Parallel audio generation significantly improves performance
  - Client-side components with real-time progress updates enhance UX
  - Modular design allows easy migration to database later
- **Code Changes**:
  - Removed test page `/test-gemini`
  - Redesigned dashboard with left/right split layout
  - Added content input area with real-time generation
  - Implemented 10-section script generation
  - Added parallel audio generation for all sections
  - Created settings modal for API key management
  - Added progress tracking with visual indicators
  - Implemented audio playback for each section
- **Architecture Decisions**:
  - Used localStorage for video projects storage
  - Simplified API routes to handle single text inputs
  - Made the system modular for future database integration
- **Challenges**:
  - None - smooth implementation with clear separation of concerns

#### Task: Rate Limit Handling & UX Improvements ✅
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - Gemini TTS has rate limits for parallel requests
  - Sequential generation with delays prevents 429 errors
  - Visual feedback per section improves user experience
  - Starting with fewer sections ensures reliability
- **Code Changes**:
  - Changed from 10 to 3 sections by default
  - Implemented sequential audio generation with 5s delays
  - Added per-section loading states (pending/generating/completed/error)
  - Added 60s retry delay on rate limit errors
  - Visual indicators for each section's status
- **Implementation Details**:
  - Each section shows its generation status
  - Blue highlight and spinner during generation
  - Green checkmark when completed
  - Error state with retry logic
  - Progress updates show current section being processed
- **Challenges**:
  - 429 quota errors with parallel generation
  - Solved by sequential processing with delays

#### Task: Video Project Management & Storage System ✅
- **Status**: Completed
- **Time Spent**: 1 hour
- **Key Learnings**:
  - Separate pages for dashboard and creation improve UX
  - Auto-save functionality prevents data loss
  - Hybrid storage approach works for both cloud and self-hosted
  - Audio persistence enables better user experience
- **Code Changes**:
  - Created `/create` page for video creation with auto-save
  - Updated dashboard to show project list with status badges
  - Implemented project loading and continuation
  - Added audio storage system with Vercel Blob support
  - Created storage abstraction for self-hosted deployments
  - Added download functionality for individual and all audio files
- **Architecture Decisions**:
  - localStorage for project metadata (easy migration path)
  - Hybrid storage: data URLs for MVP, file system for self-hosted
  - Storage adapter pattern for flexibility
  - 24-hour cache for audio files
- **Features Added**:
  - Project titles and status tracking
  - Auto-save every 30 seconds
  - Continue editing existing projects
  - Download audio files individually or all at once
  - Delete projects from dashboard
  - Preview audio from dashboard

## Next Steps (Final Phase - Video Assembly)

### Immediate Tasks (1.5 hours remaining):

1. **HTML Slide Templates** (0.25 hours)
   - Create responsive slide layouts
   - Title slide, content slide, conclusion slide
   - Use Tailwind for consistent styling
   - Support for bullet points and images

2. **Slide Rendering System** (0.25 hours)
   - Convert script sections to HTML
   - Dynamic content injection
   - Timing synchronization with audio

3. **Video Generation Pipeline** (0.75 hours)
   - Puppeteer setup for screenshots
   - FFmpeg integration for video creation
   - Sync slides with audio tracks
   - Generate MP4 output

4. **Final Integration** (0.25 hours)
   - Add video preview to create page
   - Implement video download
   - Update project status
   - Store video URL

### Technical Approach:
```
Script Sections → HTML Slides → Puppeteer Screenshots → 
FFmpeg (images + audio) → MP4 Video → Download
```

### Challenges to Consider:
- Puppeteer in serverless environment (may need external service)
- FFmpeg binary availability on Vercel
- Video file size and generation time
- Synchronization accuracy between slides and audio

#### Task: Lean MVP - Slide Preview System ✅
- **Status**: Completed
- **Time Spent**: 0.5 hours
- **Key Learnings**:
  - Modal-based preview is faster to implement than full video export
  - CSS animations provide smooth, professional transitions
  - Real-time preview gives immediate value to users
  - Lean approach validates concept before heavy video processing
- **Code Changes**:
  - Created `SlidePreviewModal` component with full-screen slides
  - Added CSS animations for elegant transitions
  - Implemented three slide types: title, content, conclusion
  - Added play button to each section for instant preview
  - Synchronized audio playback with visual presentation
  - Added progress bar and playback controls
- **Design Decisions**:
  - Gradient backgrounds with animated patterns
  - Typography-focused design for clarity
  - Smooth animations that enhance comprehension
  - Full-screen modal for immersive experience
- **MVP Benefits**:
  - Users can immediately see and hear their content
  - No heavy processing or long wait times
  - Validates the concept before building export features
  - Provides value with minimal complexity

### Phase 2: AI Integration (Hours 3-4) ✅
- [x] Create `/api/generate/script` endpoint
- [x] Integrate Google Gemini API
- [x] Create `/api/generate/voice` endpoint
- [x] Integrate Cartesia TTS API
- [x] Define JSON schema for script structure (using Type definitions)
- [x] Implement prompt engineering for video scripts
- [x] Add error handling and rate limiting (basic implementation)

### Phase 3: Voice Generation (Hours 5-6) ✅
- [x] Create `/api/generate/voice` endpoint
- [x] Integrate Cartesia API
- [x] Integrate Gemini TTS as alternative
- [x] Implement voice selection (30 Gemini voices + Cartesia options)
- [x] Handle audio file generation (MP3 for Cartesia, WAV for Gemini)
- [x] Dual provider support with runtime selection

### Phase 4: Lean MVP - Slide Preview System (Hour 9.5) ✅ COMPLETED
- [x] Create elegant animated slide templates
- [x] Build slide rendering system with dynamic content
- [x] Implement slide preview modal with audio playback
- [x] Add smooth animations and transitions
- [x] Sync audio playback with visual presentation
- [x] Create play button for instant preview
- [x] Progress bar showing audio timeline

### Phase 5: UI & Polish (Hours 9-10)
- [x] Build content input interface
- [x] Create generation workflow UI
- [x] Add progress indicators
- [x] Implement API key settings modal
- [ ] Implement video preview
- [ ] Add download functionality

## Core Features for MVP

### 1. Document Processing
- Plain text input (paste or upload)
- Markdown file support
- 10,000 word limit for MVP
- Basic text sanitization

### 2. Script Generation (Gemini)
```javascript
// Example prompt structure
const prompt = `
Convert this document into a video script with slides:
- Create 5-10 slides
- Each slide should have a title and content
- Include speaker notes for narration
- Target duration: 2-3 minutes
Document: ${userDocument}
`;
```

### 3. Voice Generation (Dual Provider Support) ✅
- **Cartesia**: Professional voices, MP3 format, 10s generation
- **Gemini TTS**: 30 voice options, WAV format, 18s generation
- English language support (both providers)
- Natural pacing (150 words/minute)
- Runtime provider selection via API

### 4. Slide System
```html
<!-- Basic slide template -->
<div class="slide">
  <h1>{{title}}</h1>
  <div class="content">{{content}}</div>
  <div class="footer">makeitvid.com</div>
</div>
```

### 5. Video Rendering
- 1920x1080 resolution
- 30 FPS
- MP4 format
- Slide transitions (fade)

## API Routes Structure

```
/api/
├── auth/
│   └── webhook/        # Clerk webhooks
├── generate/
│   ├── script/         # Gemini integration
│   ├── voice/          # Cartesia integration
│   └── video/          # FFmpeg processing
├── projects/
│   ├── create/         # Save project
│   └── list/           # User's projects
└── keys/
    └── update/         # Store API keys
```

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# API Defaults (optional)
GOOGLE_GEMINI_API_KEY=
CARTESIA_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Data Models

### User Metadata (Clerk)
```typescript
interface UserMetadata {
  apiKeys: {
    gemini?: string;
    cartesia?: string;
  };
  usage: {
    videosGenerated: number;
    lastGeneration: Date;
  };
}
```

### Project Schema
```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  sourceDocument: string;
  script: ScriptSlide[];
  audioUrl?: string;
  videoUrl?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

interface ScriptSlide {
  id: number;
  title: string;
  content: string;
  narration: string;
  duration: number;
}
```

## Simplified UI Flow

1. **Landing Page**
   - Sign in/up with Clerk
   - Feature overview
   - "Get Started" CTA

2. **Dashboard**
   - "Create New Video" button
   - List of previous videos
   - API key settings

3. **Create Video**
   - Document input (textarea or file)
   - Steering prompt (optional)
   - Generate button
   - Progress indicator

4. **Video Preview**
   - Video player
   - Download button
   - Share link (future)

## Key Simplifications for MVP

1. **No Multi-Provider Support**: Only Gemini + Cartesia
2. **No Advanced Editing**: Script is final after generation
3. **No Real-time Updates**: Polling for progress
4. **Basic Templates**: 3 slide types only
5. **No Collaboration**: Single user projects
6. **No Cloud Storage**: Temporary files only

## Dependencies to Install

```bash
# Core dependencies
npm install @clerk/nextjs
npm install @google/generative-ai
npm install puppeteer
npm install fluent-ffmpeg

# Utilities
npm install axios
npm install formidable
npm install uuid
```

## Deployment Considerations

### Vercel Configuration
- Set environment variables
- Increase function timeout (video generation)
- Configure API routes for Edge Runtime where possible

### FFmpeg on Vercel
- Use `@ffmpeg/ffmpeg` for browser-based processing
- Or use Vercel Functions with FFmpeg layer
- Consider external service for heavy processing

## Post-MVP Enhancements

### Phase 2 (Week 2)
- [ ] Multiple voice options
- [ ] PDF document support
- [ ] Basic slide customization
- [ ] Project saving/loading

### Phase 3 (Week 3)
- [ ] Multi-language support
- [ ] Advanced templates
- [ ] Export options (SRT, slides)
- [ ] Usage analytics

### Phase 4 (Week 4)
- [ ] Team collaboration
- [ ] Custom branding
- [ ] Webhook integrations
- [ ] API access for developers

## Success Metrics

### MVP Goals
- [ ] Generate first video in < 2 minutes
- [ ] Support 5-minute videos
- [ ] Handle 100 concurrent users
- [ ] < 500ms API response time

### Quality Targets
- [ ] Natural-sounding narration
- [ ] Readable slide design
- [ ] Smooth video playback
- [ ] Reliable generation (>95% success)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Testing Checklist (Post-MVP)

- [ ] Authentication flow
- [ ] API key encryption
- [ ] Document upload limits
- [ ] Video generation pipeline
- [ ] Error handling
- [ ] Download functionality

---

*This roadmap focuses on shipping a functional MVP in 10 hours. Each phase builds on the previous one, ensuring a working product at each milestone.*