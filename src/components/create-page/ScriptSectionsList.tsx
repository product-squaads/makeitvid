'use client'

import { Card } from '@/components/ui/card'
import { 
  Loader2, 
  Volume2, 
  Download,
  PlayCircle,
  Presentation,
  RefreshCw,
  FileDown
} from 'lucide-react'

interface ScriptSection {
  id: number
  narration: string
  duration: number
  html?: string
}

interface ScriptSectionsListProps {
  sections: ScriptSection[]
  audioUrls: string[]
  audioGenerationStatus: Record<number, 'pending' | 'generating' | 'completed' | 'error'>
  generateAudio: boolean
  onPlaySlide: (section: ScriptSection, index: number) => void
  onPlayAudio: (audioUrl: string) => void
  onDownloadAudio: (audioUrl: string, index: number) => void
  onDownloadAllAudios: () => void
  onRegenerateSlide: (index: number) => void
}

export function ScriptSectionsList({
  sections,
  audioUrls,
  audioGenerationStatus,
  generateAudio,
  onPlaySlide,
  onPlayAudio,
  onDownloadAudio,
  onDownloadAllAudios,
  onRegenerateSlide
}: ScriptSectionsListProps) {
  if (sections.length === 0) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium">Generated Sections</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Presentation className="h-3 w-3" />
            {generateAudio ? 
              'Click play button to preview slides with audio' : 
              'Click play button to preview slide animations (audio disabled)'}
          </p>
        </div>
        {generateAudio && audioUrls.filter(url => url).length === sections.length && (
          <button
            onClick={onDownloadAllAudios}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
          >
            <FileDown className="h-4 w-4" />
            Download All Audio
          </button>
        )}
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {sections.map((section, index) => {
          const status = audioGenerationStatus[index] || 'pending'
          return (
            <div key={section.id} className={`p-3 rounded-lg transition-all ${
              status === 'generating' ? 'bg-blue-50 border border-blue-200' :
              status === 'completed' ? 'bg-gray-50' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 opacity-60'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Section {index + 1}
                  {status === 'generating' && (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  )}
                </h4>
                <div className="flex items-center gap-2">
                  {status === 'completed' && (
                    <button
                      onClick={() => onRegenerateSlide(index)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                      title="Regenerate slide with current theme"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  {status === 'completed' && (
                    <>
                      <button
                        onClick={() => onPlaySlide(section, index)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 rounded"
                        title="Play with slide preview"
                      >
                        <PlayCircle className="h-5 w-5" />
                      </button>
                      {generateAudio && audioUrls[index] && (
                        <>
                          <button
                            onClick={() => onPlayAudio(audioUrls[index])}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                            title="Play audio only"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDownloadAudio(audioUrls[index], index)}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 rounded"
                            title="Download audio"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {section.narration}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Duration: {section.duration}s
                </p>
                <p className="text-xs">
                  {status === 'pending' && <span className="text-gray-400">Waiting...</span>}
                  {status === 'generating' && <span className="text-blue-600">Generating audio...</span>}
                  {status === 'completed' && <span className="text-green-600">✓ Ready</span>}
                  {status === 'error' && <span className="text-red-600">⚠ Error</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}