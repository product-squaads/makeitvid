'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Save, Info } from 'lucide-react'
import { isLocalhost } from '@/lib/env'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState('')
  const [cartesiaKey, setCartesiaKey] = useState('')
  const [showGemini, setShowGemini] = useState(false)
  const [showCartesia, setShowCartesia] = useState(false)
  const [saved, setSaved] = useState(false)
  const [useDevKeys, setUseDevKeys] = useState(false)
  const [hasDevKeys, setHasDevKeys] = useState(false)
  const isLocal = isLocalhost()

  useEffect(() => {
    // Load existing keys from localStorage
    const storedGemini = localStorage.getItem('gemini_api_key') || ''
    const storedCartesia = localStorage.getItem('cartesia_api_key') || ''
    const storedUseDevKeys = localStorage.getItem('use_dev_keys') === 'true'
    
    setGeminiKey(storedGemini)
    setCartesiaKey(storedCartesia)
    setUseDevKeys(storedUseDevKeys && isLocal)
    
    // Check if dev keys are available
    if (isLocal) {
      fetch('/api/dev/check-keys')
        .then(res => res.json())
        .then(data => {
          setHasDevKeys(data.hasDevKeys || false)
        })
        .catch(() => setHasDevKeys(false))
    }
  }, [open, isLocal])

  const handleSave = () => {
    if (useDevKeys && isLocal) {
      // In dev mode, just save the preference
      localStorage.setItem('use_dev_keys', 'true')
      localStorage.removeItem('gemini_api_key')
      localStorage.removeItem('cartesia_api_key')
    } else {
      // In production or when not using dev keys
      localStorage.setItem('gemini_api_key', geminiKey)
      localStorage.setItem('cartesia_api_key', cartesiaKey)
      localStorage.setItem('use_dev_keys', 'false')
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys for video generation. Your keys are stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        {isLocal && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Mode:</strong> You can use API keys from your .env file instead of entering them here.
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useDevKeys}
                    onChange={(e) => setUseDevKeys(e.target.checked)}
                    className="rounded"
                    disabled={!hasDevKeys}
                  />
                  <span className="text-sm">
                    Use development API keys from .env
                    {!hasDevKeys && ' (No .env keys found)'}
                  </span>
                </label>
              </div>
              {useDevKeys && hasDevKeys && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Using API keys from your .env file
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gemini">Google Gemini API Key</Label>
            <div className="relative">
              <Input
                id="gemini"
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                disabled={useDevKeys}
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cartesia">Cartesia API Key</Label>
            <div className="relative">
              <Input
                id="cartesia"
                type={showCartesia ? 'text' : 'password'}
                value={cartesiaKey}
                onChange={(e) => setCartesiaKey(e.target.value)}
                placeholder="sk-..."
                disabled={useDevKeys}
              />
              <button
                type="button"
                onClick={() => setShowCartesia(!showCartesia)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCartesia ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your key from{' '}
              <a 
                href="https://www.cartesia.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Cartesia
              </a>
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!useDevKeys && (!geminiKey || !cartesiaKey)}>
            {saved ? (
              <>Saved!</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Keys
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}