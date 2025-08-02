/**
 * Environment utilities for development mode features
 */

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    // Server-side check
    return process.env.NODE_ENV === 'development'
  }
  // Client-side check
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.startsWith('192.168.')
}

/**
 * Get API keys from environment variables (development only)
 * Returns null in production to prevent accidental exposure
 */
export function getDevApiKeys() {
  // Only allow in development mode
  if (!isDevelopment()) {
    return {
      gemini: null,
      cartesia: null
    }
  }

  return {
    gemini: process.env.GOOGLE_GEMINI_API_KEY || null,
    cartesia: process.env.CARTESIA_API_KEY || null
  }
}

/**
 * Check if development API keys are available
 */
export function hasDevApiKeys(): boolean {
  if (!isDevelopment()) return false
  
  const keys = getDevApiKeys()
  return !!(keys.gemini || keys.cartesia)
}