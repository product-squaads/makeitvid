# makeitvid MVP Roadmap

## Project Overview
makeitvid is an AI-powered video generation platform that transforms documents into engaging video summaries using a simplified, self-hostable architecture.

## MVP Architecture (10-Hour Build)

### Tech Stack Decisions
- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes (no separate backend service)
- **Authentication**: Clerk (fastest setup, includes user management)
- **LLM Provider**: Google Gemini API (cost-effective, good performance)
- **TTS Provider**: Cartesia API (fast voice cloning, cost-effective)
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
                        ┌────────▼────────┐
                        │ Cartesia API    │
                        │ (Voice Gen)     │
                        └────────┬────────┘
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

### Overall Progress: 2/10 hours used
- **Current Phase**: Authentication Complete
- **Next Phase**: AI Integration (Gemini + Cartesia)
- **Blockers**: None
- **Target Completion**: 8 hours remaining

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

### Phase 2: AI Integration (Hours 3-4)
- [ ] Create `/api/generate/script` endpoint
- [ ] Integrate Google Gemini API
- [ ] Define JSON schema for script structure
- [ ] Implement prompt engineering for video scripts
- [ ] Add error handling and rate limiting

### Phase 3: Voice Generation (Hours 5-6)
- [ ] Create `/api/generate/voice` endpoint
- [ ] Integrate Cartesia API
- [ ] Implement voice selection
- [ ] Handle audio file generation
- [ ] Add progress tracking

### Phase 4: Video Assembly (Hours 7-8)
- [ ] Create HTML slide templates
- [ ] Build slide rendering system
- [ ] Implement Puppeteer for screenshots
- [ ] Set up FFmpeg for video creation
- [ ] Create `/api/generate/video` endpoint

### Phase 5: UI & Polish (Hours 9-10)
- [ ] Build upload interface
- [ ] Create generation workflow UI
- [ ] Add progress indicators
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

### 3. Voice Generation (Cartesia)
- Single voice option for MVP
- English language only initially
- Natural pacing (150 words/minute)
- MP3 output format

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