# Lessons Learned - makeitvid Development

## API Integration Insights

### Google Gemini API (2025)
1. **Package Change**: Use `@google/genai` NOT `@google/generative-ai`
2. **Model Names**: `gemini-2.5-flash-lite` is the best for cost/performance
3. **Streaming Required**: Use `generateContentStream()` for proper responses
4. **Type Imports**: Must import `Type` for schema definitions
5. **Response Structure**: No nested `.response.text()` - just `chunk.text` in stream

### Cartesia API
1. **Headers**: Use `X-API-Key` NOT `Authorization: Bearer`
2. **Version Header**: `Cartesia-Version: 2024-06-10` is required
3. **Endpoint**: `/tts/bytes` NOT `/v1/audio/speech`
4. **No Speed Parameter**: Causes 422 error - remove it completely
5. **Voice Structure**: Use `voice: { mode: 'id', id: 'voice-id' }`

## Development Best Practices

### Package Management
- Always use `pnpm` instead of `npm`
- Add dev dependencies with `pnpm add -D`

### Testing Philosophy
- **Integration Tests Are Critical**: Mock tests miss API changes
- **Test with Real APIs**: Use actual keys in development
- **Save Test Outputs**: Keep MP3/JSON files for verification
- **Run Before Marking Complete**: `npx tsx src/tests/*.test.ts`

### Documentation
- Keep ROADMAP.md updated after EVERY task
- Document actual vs estimated time
- Record all API quirks and fixes
- Update technical guides with working code

### Environment Setup
- API keys in `.env` need correct names
- NEXT_PUBLIC_ prefix only for client-side variables
- Server-side keys don't need prefix

## Common Pitfalls Avoided

1. **Wrong Gemini Package**: The old package is deprecated
2. **API Documentation Lag**: Official docs often outdated
3. **Cartesia Speed Parameter**: Not documented but causes errors
4. **Response Parsing**: Different APIs have different response structures
5. **Header Names**: Each API has its own header conventions

## Time Tracking

- Initial estimate: 10 hours
- Time spent so far: 4 hours
- Progress: 40% complete
- Efficiency tips:
  - Integration tests saved ~1 hour of debugging
  - Real API testing caught issues immediately
  - Good documentation prevents repeated research

## Next Phase Preparation

For HTML/Video generation:
- Puppeteer for screenshots (not Playwright)
- FFmpeg for video assembly
- Temporary file management critical
- Consider streaming for large files