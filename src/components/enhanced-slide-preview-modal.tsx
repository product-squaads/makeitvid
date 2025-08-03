'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play, Pause, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThemeById, getAnimationTypeById } from '@/lib/slide-themes'

interface SlideData {
  id: number
  title: string
  content: string
  narration: string
  duration: number
  visualElements?: {
    type: 'bullet' | 'quote' | 'stat' | 'image' | 'icon'
    text: string
    animationDelay?: number
    emphasis?: boolean
  }[]
  transitions?: {
    entrance: 'fade' | 'slide' | 'zoom' | 'typewriter'
    exitDelay?: number
  }
}

interface EnhancedSlidePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slide: SlideData | null
  audioUrl: string | null
  sectionIndex: number
  totalSections: number
  selectedTheme?: string
  selectedAnimation?: string
}

export function EnhancedSlidePreviewModal({ 
  open, 
  onOpenChange, 
  slide, 
  audioUrl,
  sectionIndex,
  totalSections,
  selectedTheme = 'cosmic',
  selectedAnimation = 'dynamic'
}: EnhancedSlidePreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showElements, setShowElements] = useState<boolean[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const theme = getThemeById(selectedTheme)
  const animationType = getAnimationTypeById(selectedAnimation)

  useEffect(() => {
    if (audioUrl && open) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        resetAnimations()
      })
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      
      // Initialize show elements array
      if (slide?.visualElements) {
        setShowElements(new Array(slide.visualElements.length).fill(false))
      }
      
      // Auto-play when modal opens
      playAudio()
    }

    return () => {
      // Clear all animation timeouts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      animationTimeoutsRef.current = []
      
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, open, slide])

  const resetAnimations = useCallback(() => {
    // Clear existing timeouts
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    animationTimeoutsRef.current = []
    
    // Reset all elements to hidden
    if (slide?.visualElements) {
      setShowElements(new Array(slide.visualElements.length).fill(false))
    }
  }, [slide?.visualElements])

  const startAnimations = useCallback(() => {
    if (!slide?.visualElements) return
    
    resetAnimations()
    
    // Schedule each element to appear based on its animationDelay
    slide.visualElements.forEach((element, index) => {
      const delay = (element.animationDelay || index * theme.animations.elementStagger) * animationType.timingMultiplier
      
      const timeout = setTimeout(() => {
        setShowElements(prev => {
          const newState = [...prev]
          newState[index] = true
          return newState
        })
      }, delay)
      
      animationTimeoutsRef.current.push(timeout)
    })
  }, [slide?.visualElements, theme.animations.elementStagger, animationType.timingMultiplier, resetAnimations])

  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
      startAnimations()
    }
  }, [startAnimations])

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
      // Reset and start from beginning
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
      playAudio()
    }
  }

  const renderVisualElement = (element: NonNullable<SlideData['visualElements']>[0], index: number) => {
    const isVisible = showElements[index]
    const entranceAnimation = slide?.transitions?.entrance || theme.animations.defaultEntrance
    
    const animationClass = cn(
      'transition-all duration-1000',
      {
        'opacity-0 translate-y-4': !isVisible && entranceAnimation === 'fade',
        'opacity-0 translate-x-[-30px]': !isVisible && entranceAnimation === 'slide',
        'opacity-0 scale-0': !isVisible && entranceAnimation === 'zoom',
        'opacity-0': !isVisible && entranceAnimation === 'typewriter',
        'opacity-100 translate-y-0 translate-x-0 scale-100': isVisible,
      }
    )
    
    switch (element.type) {
      case 'bullet':
        return (
          <li key={index} className={cn(animationClass, 'flex items-start gap-4 mb-4')}>
            <span className={cn(theme.colors.accent, 'text-2xl mt-1')}>•</span>
            <p className={cn(theme.colors.text, 'text-xl leading-relaxed', theme.fonts.body)}>
              {element.text}
            </p>
          </li>
        )
      
      case 'quote':
        return (
          <blockquote key={index} className={cn(animationClass, 'border-l-4 border-current pl-6 my-6', theme.colors.accent)}>
            <p className={cn(theme.colors.primary, 'text-2xl italic', theme.fonts.body, {
              'font-bold': element.emphasis
            })}>
              &ldquo;{element.text}&rdquo;
            </p>
          </blockquote>
        )
      
      case 'stat':
        return (
          <div key={index} className={cn(animationClass, 'text-center my-8')}>
            <p className={cn(theme.colors.accent, 'text-6xl font-bold mb-2', {
              'animate-pulse': element.emphasis
            })}>
              {element.text}
            </p>
          </div>
        )
      
      case 'icon':
        return (
          <div key={index} className={cn(animationClass, 'flex items-center gap-4 my-4')}>
            <p className={cn(theme.colors.primary, 'text-2xl', theme.fonts.body)}>
              {element.text}
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  const renderBackgroundPattern = () => {
    switch (theme.animations.backgroundPattern) {
      case 'floating':
        return (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
          </>
        )
      case 'geometric':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
            }} />
          </div>
        )
      case 'particles':
        return (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        )
      case 'waves':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q 25 25, 50 50 T 100 50 L 100 100 L 0 100 Z' fill='white' opacity='0.1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 100px',
              animation: 'wave 10s linear infinite'
            }} />
          </div>
        )
      default:
        return null
    }
  }

  if (!slide) return null

  // Parse content for backwards compatibility
  const bullets = slide.content
    .split('•')
    .filter(b => b.trim())
    .map(b => b.trim())

  // Use visual elements if available, otherwise fall back to parsed bullets
  const visualElements = slide.visualElements || bullets.map((text, index) => ({
    type: 'bullet' as const,
    text,
    animationDelay: index * 800,
    emphasis: false
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black">
        <DialogHeader className="absolute top-4 left-4 right-4 z-20">
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
          <div className={cn(
            "relative w-full h-full max-w-[calc(95vh*16/9)] max-h-[calc(95vw*9/16)]",
            theme.colors.backgroundGradient,
            theme.colors.background
          )}>
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              {renderBackgroundPattern()}
            </div>

            {/* Slide Content */}
            <div className="relative z-10 h-full flex items-center justify-center px-16 py-12">
              <div className="max-w-5xl mx-auto w-full">
                {sectionIndex === 0 ? (
                  // Title Slide
                  <div className="text-center space-y-8">
                    <h1 className={cn(
                      'text-6xl',
                      theme.colors.primary,
                      theme.fonts.heading,
                      showElements[0] ? 'animate-slideDown' : 'opacity-0'
                    )}>
                      {slide.title}
                    </h1>
                    {visualElements.slice(0, 3).map((element, index) => (
                      <div key={index} className="animate-fadeIn" style={{ animationDelay: `${(index + 1) * 500}ms` }}>
                        {renderVisualElement(element, index)}
                      </div>
                    ))}
                  </div>
                ) : sectionIndex === totalSections - 1 ? (
                  // Conclusion Slide
                  <div className="text-center space-y-8">
                    <h2 className={cn(
                      'text-5xl mb-8',
                      theme.colors.primary,
                      theme.fonts.heading,
                      'animate-slideDown'
                    )}>
                      {slide.title}
                    </h2>
                    <div className="space-y-4">
                      {visualElements.map((element, index) => renderVisualElement(element, index))}
                    </div>
                    {showElements.length === visualElements.length && (
                      <div className="pt-8 animate-fadeIn animation-delay-1000">
                        <p className={cn('text-lg', theme.colors.accent)}>Thank you for watching!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Content Slide
                  <div className="space-y-8">
                    <h2 className={cn(
                      'text-4xl mb-8',
                      theme.colors.primary,
                      theme.fonts.heading,
                      'animate-slideRight'
                    )}>
                      {slide.title}
                    </h2>
                    <ul className="space-y-2">
                      {visualElements.map((element, index) => renderVisualElement(element, index))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
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