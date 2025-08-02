'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function TestGeminiPage() {
  const [document, setDocument] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [steeringPrompt, setSteeringPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testGemini = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          apiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY,
          steeringPrompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Gemini Integration</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Text
            </label>
            <Textarea
              placeholder="Paste your document text here..."
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="h-40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Gemini API Key (optional if set in .env)
            </label>
            <Input
              type="password"
              placeholder="Your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Steering Prompt (optional)
            </label>
            <Input
              placeholder="e.g., Make it fun and engaging for students"
              value={steeringPrompt}
              onChange={(e) => setSteeringPrompt(e.target.value)}
            />
          </div>

          <Button
            onClick={testGemini}
            disabled={loading || !document}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Video Script'}
          </Button>
        </div>

        {error && (
          <Card className="mt-6 p-4 bg-red-50 border-red-200">
            <p className="text-red-700">Error: {error}</p>
          </Card>
        )}

        {result && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Script</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total slides: {result.slideCount} | 
                Duration: {Math.floor(result.totalDuration / 60)}m {result.totalDuration % 60}s
              </p>
            </div>
            <div className="space-y-4">
              {result.slides.map((slide: any) => (
                <Card key={slide.id} className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">
                    Slide {slide.id}: {slide.title}
                  </h3>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Content:</p>
                    <p className="text-sm whitespace-pre-wrap">{slide.content}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Narration:</p>
                    <p className="text-sm italic">{slide.narration}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Duration: {slide.duration} seconds
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}