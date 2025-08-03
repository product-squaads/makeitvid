'use client'

import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'

interface AudioControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlayPause: () => void
}

export function AudioControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause
}: AudioControlsProps) {
  return (
    <div className="relative bg-gradient-to-t from-black to-transparent p-6">
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={onTogglePlayPause}
          variant="ghost"
          size="lg"
          className="text-white hover:text-white hover:bg-white/20"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8" />
          )}
        </Button>
        <div className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 w-full max-w-2xl mx-auto">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-200"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}