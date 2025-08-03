'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Palette, RefreshCw, Volume2, Loader2 } from 'lucide-react'
import { slideThemes, animationTypes } from '@/lib/slide-themes'

interface ContentInputSectionProps {
  title: string
  setTitle: (title: string) => void
  content: string
  setContent: (content: string) => void
  projectTheme: string
  setProjectTheme: (theme: string) => void
  projectAnimation: string
  setProjectAnimation: (animation: string) => void
  generateAudio: boolean
  setGenerateAudio: (generate: boolean) => void
  isGenerating: boolean
  onGenerate: () => void
  error?: string
}

export function ContentInputSection({
  title,
  setTitle,
  content,
  setContent,
  projectTheme,
  setProjectTheme,
  projectAnimation,
  setProjectAnimation,
  generateAudio,
  setGenerateAudio,
  isGenerating,
  onGenerate,
  error
}: ContentInputSectionProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Video Title
        </label>
        <Input
          id="title"
          placeholder="Enter a title for your video..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isGenerating}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </label>
          <Select value={projectTheme} onValueChange={setProjectTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {slideThemes.map(theme => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Animation Style
          </label>
          <Select value={projectAnimation} onValueChange={setProjectAnimation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {animationTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audio Generation Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-blue-600" />
          <div>
            <Label htmlFor="audio-toggle" className="font-medium">
              Generate Audio Narration
            </Label>
            <p className="text-sm text-gray-600">
              Disable to save API quota and only preview slide animations
            </p>
          </div>
        </div>
        <Switch
          id="audio-toggle"
          checked={generateAudio}
          onCheckedChange={setGenerateAudio}
        />
      </div>
      
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        Your Content
      </h2>
      <Textarea
        placeholder="Paste your content here... This can be an article, lesson notes, documentation, or any text you want to turn into a video."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[350px] resize-none"
        disabled={isGenerating}
      />
      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Videos will be generated with 3 sections to ensure quality and avoid rate limits.
      </p>
      <div className="mt-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !content.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </div>

      {error && (
        <Card className="mt-4 p-4 bg-red-50 border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}
    </Card>
  )
}