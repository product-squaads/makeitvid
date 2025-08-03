import { useRef, useEffect, useCallback } from 'react'

interface UseIframeScalingOptions {
  originalWidth?: number
  originalHeight?: number
  isOpen?: boolean
}

export function useIframeScaling({
  originalWidth = 1920,
  originalHeight = 1080,
  isOpen = false
}: UseIframeScalingOptions = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const applyScaling = useCallback(() => {
    try {
      const iframe = iframeRef.current
      const doc = iframe?.contentDocument
      if (doc && iframe && doc.body) {
        // Get the actual iframe dimensions
        const iframeWidth = iframe.clientWidth
        const iframeHeight = iframe.clientHeight
        
        // Calculate scale to fit
        const scaleX = iframeWidth / originalWidth
        const scaleY = iframeHeight / originalHeight
        const scale = Math.min(scaleX, scaleY)
        
        // Apply transform to scale the content
        doc.body.style.transform = `scale(${scale})`
        doc.body.style.width = `${originalWidth}px`
        doc.body.style.height = `${originalHeight}px`
        
        // Center the scaled content
        const scaledWidth = originalWidth * scale
        const scaledHeight = originalHeight * scale
        const offsetX = (iframeWidth - scaledWidth) / 2
        const offsetY = (iframeHeight - scaledHeight) / 2
        doc.body.style.left = `${offsetX}px`
        doc.body.style.top = `${offsetY}px`
        
        console.log('✅ Applied scaling:', { scale, offsetX, offsetY, iframeWidth, iframeHeight })
      }
    } catch (e) {
      console.error('❌ Error in applyScaling:', e)
    }
  }, [originalWidth, originalHeight])

  const setIframeContent = useCallback((html: string) => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    
    // Clear any existing content first
    iframe.srcdoc = ''
    
    // Force a reflow to ensure iframe is ready
    iframe.offsetHeight
    
    // Check if this is a complete HTML document or just content
    const isCompleteHTML = html.includes('<!DOCTYPE') || html.includes('<html')
    
    if (isCompleteHTML) {
      // Inject scaling CSS to make the content fit properly
      const scaledHTML = html.replace(
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
      
      iframe.srcdoc = scaledHTML
      
      // Setup scaling after iframe loads
      iframe.onload = () => {
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
          ${html}
        </body>
        </html>
      `
      iframe.srcdoc = wrappedHTML
    }
  }, [applyScaling])

  // Set up resize observer
  useEffect(() => {
    if (isOpen && iframeRef.current) {
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
  }, [isOpen, applyScaling])

  return {
    iframeRef,
    setIframeContent,
    applyScaling
  }
}