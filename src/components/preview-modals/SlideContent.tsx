'use client'

import { forwardRef } from 'react'

interface SlideContentProps {
  title?: string
  sandbox?: string
}

export const SlideContent = forwardRef<HTMLIFrameElement, SlideContentProps>(
  ({ title, sandbox = "allow-scripts allow-same-origin" }, ref) => {
    return (
      <div 
        className="relative w-full bg-white"
        style={{ aspectRatio: '16/9' }}
      >
        <iframe
          ref={ref}
          title={title}
          className="absolute inset-0 w-full h-full"
          style={{
            border: 'none',
            backgroundColor: 'white',
            transformOrigin: 'top left',
          }}
          sandbox={sandbox}
        />
      </div>
    )
  }
)

SlideContent.displayName = 'SlideContent'