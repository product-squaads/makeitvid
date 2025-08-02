# makeitvid

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://makeitvid.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

## Overview

makeitvid is an open-source AI-powered video generation platform that transforms documents and research materials into engaging video summaries. It provides a powerful alternative to proprietary solutions like Google's NotebookLM Video Overviews, emphasizing user control, transparency, and extensibility through a **Bring Your Own Key (BYOK)** model.

## Key Features

- 🎬 **Document to Video**: Transform text, PDFs, and documents into professional video summaries
- 🤖 **Multi-Provider AI Support**: Choose from Google Gemini, OpenAI, Cerebras, and more
- 🎙️ **Professional Narration**: Integrate with ElevenLabs, Cartesia, Play.ht for natural voices
- 🔐 **BYOK Model**: Use your own API keys for complete control and privacy
- 🌍 **Multi-Language**: Support for 50+ languages in both script and narration
- 🎨 **Dynamic Slides**: AI-generated visuals, quotes, and data visualizations
- 📊 **Open Source**: Fully transparent, auditable, and community-driven

## Live Demo

Visit [makeitvid.vercel.app](https://makeitvid.vercel.app) to see the current development version.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Video Engine**: Remotion framework for programmatic video generation
- **Backend**: Node.js with Express/Fastify (in development)
- **AI Services**: Multiple LLM and TTS provider integrations

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- API keys for your chosen LLM and TTS providers

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/makeitvid.git
cd makeitvid
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your API keys in `.env.local`:
```env
# Optional: Default API keys (users can override in UI)
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload or paste your source material** (text, markdown, or documents)
2. **Add a steering prompt** to guide the AI (e.g., "Create a 5-minute summary for students")
3. **Select your AI providers**:
   - Choose an LLM for script generation
   - Choose a TTS service for narration
   - Select a voice that fits your content
4. **Enter your API keys** (stored securely in your browser)
5. **Generate your video** and download the MP4 file

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend App   │────▶│  Orchestration   │────▶│  AI Services    │
│  (Next.js 15)   │     │    Service       │     │  (LLM & TTS)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Video Rendering  │
                        │    (Remotion)    │
                        └──────────────────┘
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Project Structure

```
makeitvid/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions and services
├── public/           # Static assets
├── .claude/          # AI assistant documentation
└── docs/             # Project documentation
```

## Roadmap

- [x] Frontend UI foundation
- [x] Project documentation and PRD
- [ ] Backend orchestration service
- [ ] LLM provider integrations
- [ ] TTS provider integrations
- [ ] Remotion video rendering
- [ ] Multi-language support
- [ ] Cloud deployment
- [ ] API documentation
- [ ] Plugin system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Google's NotebookLM Video Overviews
- Built with amazing open-source technologies
- Special thanks to the Remotion team for the video framework

## Support

- 📖 [Documentation](docs/)
- 💬 [Discussions](https://github.com/yourusername/makeitvid/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/makeitvid/issues)
- 📧 Contact: support@makeitvid.com

---

**Note**: This project is in active development. Features and APIs may change.