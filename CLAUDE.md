# Claude Development Rules for makeitvid

## Core Development Rules

### 1. Documentation Updates (CRITICAL)
**ALWAYS keep `docs/ROADMAP.md` updated after EVERY task completion or significant learning.**

#### What to Update:
- Mark completed tasks with checkboxes
- Add "Lessons Learned" section for each completed phase
- Update "Current Context" section with project state
- Document any architectural decisions or changes
- Record actual time spent vs estimated time
- Note any blockers or challenges encountered

#### Update Format:
```markdown
### Task: [Task Name] ✅
- **Status**: Completed
- **Time Spent**: X hours (estimated: Y hours)
- **Key Learnings**:
  - Learning point 1
  - Learning point 2
- **Challenges**:
  - Challenge faced and how it was resolved
- **Code Changes**:
  - Files created/modified
  - Key implementations
```

### 2. Project-Specific Architecture

#### Tech Stack (Locked In):
- **Frontend**: Next.js 15 with App Router (src structure)
- **Auth**: Clerk (no changes)
- **LLM**: Google Gemini only
- **TTS**: Cartesia only
- **Video**: HTML slides → Puppeteer → FFmpeg (no Remotion)
- **Backend**: Next.js API routes only (no separate backend)

#### Key Constraints:
- **10-hour MVP target**: Prioritize speed over perfection
- **No testing in MVP**: Focus on core functionality
- **Minimal UI**: Function over form initially
- **BYOK model**: Users provide their own API keys

### 3. Development Workflow

1. **Before Starting Any Task**:
   - Read current task from TodoWrite
   - Check ROADMAP.md for context
   - Review relevant documentation

2. **During Development**:
   - Implement minimal viable solution first
   - Document any deviations from plan
   - Note time spent on each subtask

3. **After Completing Task**:
   - Update TodoWrite status
   - Update ROADMAP.md immediately
   - Commit changes with clear message
   - Move to next priority task

### 4. Code Standards

#### File Organization:
```
src/
├── app/          # Next.js routes only
├── components/   # Reusable UI components
├── lib/          # Business logic and utilities
│   ├── ai/      # AI integrations (Gemini, Cartesia)
│   ├── video/   # Video generation logic
│   └── auth/    # Auth utilities
└── hooks/       # Custom React hooks
```

#### Naming Conventions:
- Components: PascalCase (e.g., `VideoGenerator.tsx`)
- Utilities: camelCase (e.g., `generateScript.ts`)
- API Routes: kebab-case folders (e.g., `/api/generate-video/`)
- Types: PascalCase with 'T' prefix (e.g., `TVideoProject`)

### 5. Critical Implementation Notes

#### Clerk Integration:
- Use `publicMetadata` for storing encrypted API keys
- Implement proper middleware for route protection
- Keep auth flows simple (sign-in, sign-up, dashboard)

#### Video Generation Pipeline:
1. Text → Gemini API → JSON script
2. Script → Cartesia API → MP3 audio
3. Script → HTML templates → PNG screenshots
4. PNGs + MP3 → FFmpeg → MP4 video

#### Error Handling:
- Always return meaningful error messages
- Implement proper cleanup for temporary files
- Add user-friendly error states in UI

### 6. Progress Tracking

**Current Sprint**: MVP Development (10 hours)
**Target Completion**: ASAP
**Priority Order**:
1. Auth setup (Clerk)
2. Core API routes
3. Video generation pipeline
4. Basic UI
5. Polish and deploy

### 7. Communication Rules

- Keep responses concise and action-oriented
- Always update documentation before moving to next task
- Flag any blockers immediately
- Suggest simplifications when tasks seem complex

---

**Remember**: The goal is a working MVP in 10 hours. Every decision should optimize for speed while maintaining basic quality and user experience.