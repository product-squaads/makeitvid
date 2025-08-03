'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import { useIframeScaling, useAudioPlayer } from '@/hooks/preview-modals'
import {
  AudioControls,
  SlideContent,
  FallbackSlideContent,
  ModalHeader
} from '@/components/preview-modals'

interface HtmlSlideData {
  id: number
  narration: string
  duration: number
  html: string
}

interface HtmlSlidePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slide: HtmlSlideData | null
  audioUrl: string | null
  sectionIndex: number
  totalSections: number
}

export function HtmlSlidePreviewModal({ 
  open, 
  onOpenChange, 
  slide, 
  audioUrl,
  sectionIndex,
  totalSections
}: HtmlSlidePreviewModalProps) {
  const { iframeRef, setIframeContent } = useIframeScaling({ isOpen: open })
  const { fallbackHtml } = FallbackSlideContent()
  
  const {
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    reset
  } = useAudioPlayer({ 
    audioUrl, 
    autoPlay: true,
    onEnded: () => reset()
  })

  // Update iframe content when slide changes
  useEffect(() => {
    if (!open || !slide) return
    
    // Small delay to ensure iframe is mounted
    const timeoutId = setTimeout(() => {
      if (iframeRef.current && slide) {
        console.log('🔍 HtmlSlidePreviewModal - Slide data:', { 
          hasSlide: !!slide,
          hasHtml: !!slide?.html,
          htmlLength: slide?.html?.length || 0,
          slideId: slide.id
        })
        
        // Set content or fallback
        setIframeContent(slide?.html || fallbackHtml)
      }
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [slide, open, iframeRef, setIframeContent, fallbackHtml])

  if (!slide) return null

  // Log warning if slide doesn't have html
  if (!slide.html) {
    console.warn('⚠️ Slide missing html field:', slide)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] min-w-[95vw] h-[95vh] p-0 overflow-hidden bg-black flex flex-col">
        <DialogHeader className="absolute top-4 left-4 right-4 z-20">
          <ModalHeader 
            sectionIndex={sectionIndex}
            totalSections={totalSections}
            onClose={() => onOpenChange(false)}
          />
        </DialogHeader>

        {/* Main content area */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
          {/* 16:9 Aspect Ratio Container with proper scaling */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ maxWidth: 'calc(90vh * 16 / 9)', maxHeight: '90vh' }}
          >
            <SlideContent 
              ref={iframeRef}
              title={`slide-preview-${slide?.id || 0}`}
            />
          </div>
        </div>

        {/* Audio Controls */}
        <AudioControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={slide.duration}
          onTogglePlayPause={togglePlayPause}
        />
      </DialogContent>
    </Dialog>
  )
}