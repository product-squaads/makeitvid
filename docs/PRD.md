# makeitvid: AI-Powered Video Generation Platform
## Comprehensive Product Requirements Document

### Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Strategy](#product-strategy)
3. [Technical Architecture](#technical-architecture)
4. [User Experience](#user-experience)
5. [Core Features](#core-features)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Success Metrics](#success-metrics)

---

## Executive Summary

### Vision
makeitvid is an open-source platform that democratizes AI-powered video creation from documents and research materials. It provides a powerful alternative to proprietary solutions like Google's NotebookLM Video Overviews, emphasizing user control, transparency, and extensibility.

### Core Value Proposition
Transform any document, research paper, or text content into engaging, professionally narrated video summaries with AI-generated visuals and slides. Users maintain complete control over their content, API costs, and creative output.

### Key Differentiators
- **Bring Your Own Key (BYOK) Model**: Users provide their own API keys for LLM and TTS services
- **Open-Source Architecture**: Fully transparent, auditable, and community-driven development
- **Multi-Provider Support**: Flexibility to choose from various AI providers (OpenAI, Google, Cerebras, etc.)
- **Extensible Design**: Modular architecture allowing community contributions and customizations
- **Privacy-First**: Data processed through user's own API accounts, ensuring data sovereignty

### Target Deployment
- **Current**: makeitvid.vercel.app
- **Future**: makeitvid.com

---

## Product Strategy

### Market Position

#### Competitive Landscape
- **Primary Competitor**: Google NotebookLM Video Overviews
  - Strengths: Polished UI, seamless integration, background processing
  - Weaknesses: Proprietary, vendor lock-in, limited customization, English-only
- **Secondary Competitors**: Traditional video creation tools (Loom, Synthesia)
  - Lack document-to-video automation
  - Require significant manual effort

#### Strategic Advantages
1. **Cost Control**: Users manage their own API expenses directly
2. **Model Flexibility**: Swap AI providers as better options emerge
3. **Data Privacy**: Clear data handling through user's chosen providers
4. **Community-Driven**: Open-source model enables rapid innovation
5. **No Vendor Lock-in**: Export capabilities and open formats

### Target Personas

#### 1. Academic Researcher/Student
- **Need**: Convert dense academic papers into digestible video summaries
- **Use Case**: Study aids, conference presentations, peer sharing
- **Value**: Time savings, improved comprehension, shareable content

#### 2. Content Creator/Marketer
- **Need**: Repurpose written content for video platforms
- **Use Case**: Blog-to-video conversion, social media content, YouTube explainers
- **Value**: Content multiplication, audience expansion, SEO benefits

#### 3. Corporate Trainer/Analyst
- **Need**: Transform documentation into training materials
- **Use Case**: Employee onboarding, process documentation, executive briefings
- **Value**: Standardized training, time efficiency, engagement improvement

#### 4. Educator/Teacher
- **Need**: Create multilingual educational content
- **Use Case**: Lesson summaries, flipped classroom content, accessibility
- **Value**: Student engagement, language accessibility, reusable materials

---

## Technical Architecture

### System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Frontend App   │────▶│  Orchestration   │────▶│  AI Services    │
│  (Next.js 15)   │     │    Service       │     │  (LLM & TTS)    │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │                  │
                        │ Video Rendering  │
                        │    (Remotion)    │
                        │                  │
                        └──────────────────┘
```

### Core Components

#### 1. Frontend Application (Next.js 15 + React 19)
- **Current State**: UI foundation complete with shadcn/ui components
- **Responsibilities**:
  - User interface and project management
  - Source material input (text, files, URLs)
  - API key management (secure, browser-based)
  - Job monitoring and video playback
  - Download and sharing capabilities

#### 2. Orchestration Service
- **Technology**: Node.js with Express/Fastify
- **Responsibilities**:
  - API endpoint management
  - Workflow coordination
  - Job status tracking
  - Module communication
  - Error handling and recovery

#### 3. Content Synthesis Module
- **Purpose**: LLM abstraction layer
- **Supported Providers**:
  - Google Gemini (1.5 Flash/Pro)
  - Cerebras (Qwen-3 235B)
  - OpenAI (GPT-4/GPT-3.5)
- **Key Feature**: Structured JSON output via schema enforcement

#### 4. Voice Generation Module
- **Purpose**: TTS abstraction layer
- **Supported Providers**:
  - ElevenLabs (70+ languages, voice cloning)
  - Cartesia (3-second voice cloning, cost-effective)
  - Play.ht (additional option)
- **Output**: High-quality narration audio files

#### 5. Video Rendering Engine
- **Technology**: Remotion framework
- **Process**:
  - React-based slide generation
  - Headless Chrome rendering via Puppeteer
  - FFmpeg video encoding and audio muxing
  - HTML/CSS slide templates with animations

### Data Flow

1. **Input Processing**: User provides documents + steering prompt + API keys
2. **Script Generation**: LLM creates structured JSON script with slide content
3. **Voice Synthesis**: TTS generates narration from script text
4. **Video Assembly**: Remotion renders slides and synchronizes with audio
5. **Output Delivery**: Final MP4 available for preview/download/sharing

---

## User Experience

### Core User Journey

#### 1. Project Creation
- Simple onboarding with clear value proposition
- Intuitive source material input (paste, upload, URL)
- Smart defaults with optional customization

#### 2. Configuration
- **AI Service Selection**:
  - LLM provider dropdown (model comparison tooltips)
  - TTS provider and voice selection
  - Language selection (50+ languages)
- **API Key Management**:
  - Secure browser storage
  - One-time setup with status indicators
  - Clear privacy messaging

#### 3. Generation Process
- One-click generation with progress indicators
- Background processing (user can navigate away)
- Real-time status updates
- Estimated completion time

#### 4. Review & Edit
- Script preview before rendering
- Basic text editing capabilities
- Slide-by-slide review
- Regeneration options

#### 5. Output & Distribution
- In-app video player with standard controls
- Multiple export formats (MP4 standard)
- Direct sharing links
- Download for offline use

### Design Principles

#### Visual Design
- **Modern & Minimal**: Clean interface focusing on content
- **Theme Support**: Light/dark modes respecting OS preferences
- **Responsive**: Works on desktop and tablet devices
- **Accessibility**: WCAG compliance for inclusive use

#### Interaction Design
- **Progressive Disclosure**: Advanced options hidden by default
- **Smart Defaults**: Optimal settings pre-selected
- **Clear Feedback**: Loading states, progress bars, error messages
- **Keyboard Shortcuts**: Power user efficiency

---

## Core Features

### MVP Features (v1.0)

#### 1. Document Processing
- **Supported**: Plain text, Markdown files
- **Planned**: PDF, DOCX, web scraping (v2)
- **Limits**: 50,000 words per document

#### 2. AI-Powered Script Generation
- Multiple LLM support with runtime selection
- Steering prompts for customization
- Structured output with JSON schemas
- Context-aware slide creation

#### 3. Automated Visual Generation
- AI-selected images and graphics
- Quote highlighting and text emphasis
- Data visualization for statistics
- Consistent slide templates

#### 4. Professional Narration
- Multiple TTS provider integration
- Voice selection and customization
- Multi-language support (50+ languages)
- Natural pacing and emphasis

#### 5. Video Rendering
- HD output (720p/1080p)
- Synchronized audio-visual content
- Smooth transitions and animations
- Optimized file sizes

#### 6. Project Management
- Save and organize projects
- Version history
- Multiple outputs per project
- Search and filter capabilities

### Post-MVP Features (v2.0+)

#### 1. Enhanced Input Support
- PDF processing with layout preservation
- Web URL scraping and processing
- Google Docs integration
- YouTube transcript import

#### 2. Advanced Editing
- Slide-by-slide customization
- Template gallery and themes
- Custom branding options
- Interactive elements

#### 3. Collaboration Features
- Multi-user projects
- Commenting and feedback
- Real-time collaboration
- Permission management

#### 4. Extended Export Options
- PowerPoint/Google Slides export
- Subtitle/transcript files
- Multiple resolution options
- Custom aspect ratios

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Validate core technical pipeline

1. **Backend Pipeline Setup**
   - Orchestration service skeleton
   - Single LLM integration (Gemini)
   - Single TTS integration (ElevenLabs)
   - Basic Remotion rendering

2. **Proof of Concept**
   - Hardcoded input to video output
   - JSON schema validation
   - Audio synchronization testing
   - Basic slide templates (3-5 types)

### Phase 2: MVP Development (Weeks 5-12)
**Goal**: Complete user-facing application

1. **Frontend Implementation**
   - Project dashboard
   - Creation workflow
   - Configuration interface
   - Video player integration

2. **Multi-Provider Support**
   - Add 2nd LLM (Cerebras/OpenAI)
   - Add 2nd TTS (Cartesia)
   - Provider abstraction layer
   - Error handling

3. **Polish & Testing**
   - UI/UX refinement
   - Cross-browser testing
   - Performance optimization
   - Security audit

### Phase 3: Launch Preparation (Weeks 13-16)
**Goal**: Production readiness

1. **Deployment Infrastructure**
   - Docker containerization
   - CI/CD pipeline
   - Monitoring and logging
   - Auto-scaling setup

2. **Documentation**
   - User guide
   - API documentation
   - Contribution guidelines
   - Video tutorials

3. **Community Building**
   - GitHub repository setup
   - Discord/Forum creation
   - Initial marketing push
   - Feedback collection system

### Phase 4: Post-Launch (Ongoing)
**Goal**: Growth and enhancement

1. **Feature Expansion**
   - Additional providers
   - New input formats
   - Enhanced editing
   - Mobile optimization

2. **Community Development**
   - Plugin system
   - Template marketplace
   - Translation efforts
   - Bug bounty program

---

## Success Metrics

### Technical KPIs
- **Performance**: <3min generation for 5-min video
- **Quality**: 90%+ user satisfaction with output
- **Reliability**: 99.5% uptime for core services
- **Scalability**: Support 1000+ concurrent jobs

### User KPIs
- **Adoption**: 10,000 active users in 6 months
- **Retention**: 40% monthly active rate
- **Engagement**: 3+ videos per active user/month
- **NPS**: Score of 50+ within first year

### Community KPIs
- **Contributors**: 50+ code contributors
- **Stars**: 5,000+ GitHub stars in year 1
- **Forks**: 500+ active forks
- **Issues**: <48hr average response time

### Business KPIs
- **Cost Efficiency**: <$0.50 average cost per video
- **Conversion**: 20% free to paid API upgrade
- **Growth**: 50% MoM user growth for 6 months
- **Sustainability**: Break-even on hosting within year 1

---

## Risk Mitigation

### Technical Risks
- **API Changes**: Maintain provider abstraction layer
- **Rendering Performance**: Implement queue system and caching
- **Storage Costs**: Automatic cleanup policies
- **Security**: Regular audits and best practices

### Market Risks
- **Competition**: Focus on open-source advantages
- **API Pricing**: Multi-provider support for options
- **Adoption**: Strong documentation and onboarding
- **Sustainability**: Community-driven development model

---

## Conclusion

makeitvid represents a strategic approach to democratizing AI-powered video creation. By combining the best aspects of proprietary solutions with open-source principles, we create a platform that empowers users while fostering innovation. The BYOK model, modular architecture, and community focus position makeitvid as the definitive open-source solution for document-to-video transformation.

The phased implementation approach ensures we validate core assumptions early while building toward a comprehensive platform. Success will be measured not just in user metrics, but in the vibrant ecosystem that emerges around the project.

---

*This PRD is a living document and will be updated as the project evolves. For the latest updates, visit the project repository.*