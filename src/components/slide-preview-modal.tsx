'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play, Pause, X } from 'lucide-react'

interface SlideData {
  id: number
  title: string
  content: string
  narration: string
  duration: number
}

interface SlidePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slide: SlideData | null
  audioUrl: string | null
  sectionIndex: number
  totalSections: number
}

export function SlidePreviewModal({ 
  open, 
  onOpenChange, 
  slide, 
  audioUrl,
  sectionIndex,
  totalSections
}: SlidePreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioUrl && open) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      
      // Auto-play when modal opens
      playAudio()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioUrl, open])

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  if (!slide) return null

  // Parse content into bullet points
  const bullets = slide.content
    .split('•')
    .filter(b => b.trim())
    .map(b => b.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black">
        <DialogHeader className="absolute top-4 left-4 right-4 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white text-sm opacity-80">
              Section {sectionIndex + 1} of {totalSections}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* 16:9 Aspect Ratio Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* Slide Container with 16:9 Aspect Ratio */}
          <div className="relative w-full h-full max-w-[calc(90vh*16/9)] max-h-[calc(90vw*9/16)] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
          </div>

          {/* Slide Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-12 text-white animate-fadeIn">
            {sectionIndex === 0 ? (
              // Title Slide
              <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-slideDown">
                  {slide.title}
                </h1>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-400 to-blue-400 animate-scaleX" />
                <p className="text-xl text-gray-300 animate-fadeIn animation-delay-500">
                  {bullets[0] || slide.narration.substring(0, 100) + '...'}
                </p>
              </div>
            ) : sectionIndex === totalSections - 1 ? (
              // Conclusion Slide
              <div className="text-center space-y-8">
                <h2 className="text-5xl font-bold animate-slideDown">
                  {slide.title}
                </h2>
                <div className="space-y-4 animate-fadeIn animation-delay-300">
                  {bullets.map((bullet, index) => (
                    <p 
                      key={index} 
                      className="text-xl text-gray-200"
                      style={{ animationDelay: `${(index + 1) * 200}ms` }}
                    >
                      {bullet}
                    </p>
                  ))}
                </div>
                <div className="pt-8 animate-fadeIn animation-delay-1000">
                  <p className="text-lg text-purple-300">Thank you for watching!</p>
                </div>
              </div>
            ) : (
              // Content Slide
              <div className="space-y-8">
                <h2 className="text-4xl font-bold animate-slideRight">
                  {slide.title}
                </h2>
                <ul className="space-y-4">
                  {bullets.map((bullet, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-4 animate-slideRight"
                      style={{ animationDelay: `${(index + 1) * 200}ms` }}
                    >
                      <span className="text-purple-400 text-2xl mt-1">•</span>
                      <p className="text-xl text-gray-100 leading-relaxed">
                        {bullet}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={togglePlayPause}
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
              {formatTime(currentTime)} / {formatTime(slide.duration)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full max-w-2xl mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-200"
                style={{ width: `${(currentTime / slide.duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}