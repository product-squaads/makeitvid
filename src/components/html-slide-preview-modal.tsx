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
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

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

  useEffect(() => {
    // Update iframe content when slide changes
    if (!open || !slide) return
    
    // Small delay to ensure iframe is mounted
    const timeoutId = setTimeout(() => {
      if (iframeRef.current && slide) {
        console.log('🔍 HtmlSlidePreviewModal - Slide data:', { 
          hasSlide: !!slide,
          hasHtml: !!slide?.html,
          htmlLength: slide?.html?.length || 0,
          htmlPreview: slide?.html?.substring(0, 200),
          slideId: slide.id,
          iframeElement: !!iframeRef.current
        })
        
        if (slide?.html) {
          // Clear any existing content first
          iframeRef.current.srcdoc = ''
          
          // Force a reflow to ensure iframe is ready
          iframeRef.current.offsetHeight
          
          // Check if this is a complete HTML document or just content
          const isCompleteHTML = slide.html.includes('<!DOCTYPE') || slide.html.includes('<html')
          
          console.log('📝 Setting iframe content, isCompleteHTML:', isCompleteHTML)
          console.log('📄 HTML content length:', slide.html.length)
          console.log('🔗 First 200 chars of HTML:', slide.html.substring(0, 200))
          
          // Set the content directly
          if (isCompleteHTML) {
            // Inject scaling CSS to make the 1920x1080 content fit properly
            const scaledHTML = slide.html.replace(
              '</head>',
              `<style>
                html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                }
                body {
                  transform-origin: top left;
                  position: absolute;
                  top: 0;
                  left: 0;
                }
              </style>
              </head>`
            )
            
            // Use srcDoc for complete HTML documents
            iframeRef.current.srcdoc = scaledHTML
            console.log('✅ Set scaled HTML to iframe.srcdoc')
            
            // Setup scaling after iframe loads
            iframeRef.current.onload = () => {
              console.log('🔄 Iframe loaded, applying scaling...')
              // Apply scaling after a small delay to ensure content is rendered
              setTimeout(() => {
                applyScaling()
              }, 100)
            }
          } else {
            // If it's partial HTML, wrap it in a basic document structure
            const wrappedHTML = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body {
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9f9f9;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  }
                </style>
              </head>
              <body>
                ${slide.html}
              </body>
              </html>
            `
            iframeRef.current.srcdoc = wrappedHTML
            console.log('✅ Set wrapped HTML to iframe.srcdoc')
          }
        } else {
        // Fallback for old slide format
        const fallbackHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: white;
                padding: 40px;
              }
              .message {
                text-align: center;
                max-width: 600px;
                animation: fadeIn 0.8s ease-out;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              h1 { 
                font-size: 3rem; 
                margin-bottom: 1.5rem;
                font-weight: 700;
              }
              p { 
                font-size: 1.5rem; 
                opacity: 0.9;
                line-height: 1.6;
                margin-bottom: 1rem;
              }
              .icon {
                font-size: 4rem;
                margin-bottom: 2rem;
              }
              .action {
                margin-top: 2rem;
                padding: 12px 24px;
                background: rgba(255,255,255,0.2);
                border-radius: 8px;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <div class="message">
              <div class="icon">⚡</div>
              <h1>Slide Update Required</h1>
              <p>This slide was created with an older version.</p>
              <p>Click the refresh button (↻) next to this slide to regenerate it with beautiful animations!</p>
              <div class="action">Close this preview and click ↻ to regenerate</div>
            </div>
          </body>
          </html>
        `
        iframeRef.current.srcdoc = fallbackHtml
        }
      }
    }, 100) // 100ms delay
    
    return () => clearTimeout(timeoutId)
  }, [slide, open])

  const applyScaling = () => {
    try {
      const iframe = iframeRef.current
      const doc = iframe?.contentDocument
      if (doc && iframe && doc.body) {
        // Get the actual iframe dimensions
        const iframeWidth = iframe.clientWidth
        const iframeHeight = iframe.clientHeight
        
        // Original slide dimensions
        const slideWidth = 1920
        const slideHeight = 1080
        
        // Calculate scale to fit
        const scaleX = iframeWidth / slideWidth
        const scaleY = iframeHeight / slideHeight
        const scale = Math.min(scaleX, scaleY)
        
        // Apply transform to scale the content
        doc.body.style.transform = `scale(${scale})`
        doc.body.style.width = `${slideWidth}px`
        doc.body.style.height = `${slideHeight}px`
        
        // Center the scaled content
        const scaledWidth = slideWidth * scale
        const scaledHeight = slideHeight * scale
        const offsetX = (iframeWidth - scaledWidth) / 2
        const offsetY = (iframeHeight - scaledHeight) / 2
        doc.body.style.left = `${offsetX}px`
        doc.body.style.top = `${offsetY}px`
        
        console.log('✅ Applied scaling:', { scale, offsetX, offsetY, iframeWidth, iframeHeight })
      }
    } catch (e) {
      console.error('❌ Error in applyScaling:', e)
    }
  }

  // Set up resize observer
  useEffect(() => {
    if (open && iframeRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        applyScaling()
      })
      resizeObserverRef.current.observe(iframeRef.current)
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // If slide doesn't have html, show a message
  if (!slide.html) {
    console.warn('⚠️ Slide missing html field:', slide)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] min-w-[95vw] h-[95vh] p-0 overflow-hidden bg-black flex flex-col">
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

        {/* Main content area */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
          {/* 16:9 Aspect Ratio Container with proper scaling */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ maxWidth: 'calc(90vh * 16 / 9)', maxHeight: '90vh' }}
          >
            <div 
              className="relative w-full bg-white"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Iframe for HTML content */}
              <iframe
                ref={iframeRef}
                title={`slide-preview-${slide?.id || 0}`}
                className="absolute inset-0 w-full h-full"
                style={{
                  border: 'none',
                  backgroundColor: 'white',
                  transformOrigin: 'top left',
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="relative bg-gradient-to-t from-black to-transparent p-6">
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