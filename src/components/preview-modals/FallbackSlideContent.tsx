'use client'

export function FallbackSlideContent() {
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
  
  return { fallbackHtml }
}