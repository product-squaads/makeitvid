import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

interface StorageAdapter {
  save(file: Buffer, filename: string): Promise<string>
  retrieve(url: string): Promise<Buffer>
  delete(url: string): Promise<void>
}

// Local file storage for self-hosted deployments
class LocalFileStorage implements StorageAdapter {
  private storageDir: string

  constructor() {
    this.storageDir = path.join(process.cwd(), 'storage', 'audio')
  }

  async ensureDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create storage directory:', error)
    }
  }

  async save(file: Buffer, filename: string): Promise<string> {
    await this.ensureDir()
    const uniqueFilename = `${uuidv4()}-${filename}`
    const filepath = path.join(this.storageDir, uniqueFilename)
    
    await fs.writeFile(filepath, file)
    
    // Return a URL that can be used to retrieve the file
    return `/api/storage/audio/${uniqueFilename}`
  }

  async retrieve(url: string): Promise<Buffer> {
    // Extract filename from URL
    const filename = url.split('/').pop()
    if (!filename) throw new Error('Invalid URL')
    
    const filepath = path.join(this.storageDir, filename)
    return await fs.readFile(filepath)
  }

  async delete(url: string): Promise<void> {
    const filename = url.split('/').pop()
    if (!filename) return
    
    const filepath = path.join(this.storageDir, filename)
    try {
      await fs.unlink(filepath)
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }
}

// Vercel Blob storage for production
class VercelBlobStorage implements StorageAdapter {
  async save(file: Buffer, filename: string): Promise<string> {
    // For MVP, we'll just return a data URL
    // In production, you would integrate with @vercel/blob
    const base64 = file.toString('base64')
    const mimeType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'
    return `data:${mimeType};base64,${base64}`
  }

  async retrieve(url: string): Promise<Buffer> {
    // For data URLs, extract the base64 content
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1]
      return Buffer.from(base64, 'base64')
    }
    throw new Error('Invalid URL format')
  }

  async delete(url: string): Promise<void> {
    // Data URLs don't need deletion
    // In production with @vercel/blob, you would delete the blob
  }
}

// Factory to get the appropriate storage adapter
export function getStorageAdapter(): StorageAdapter {
  if (process.env.VERCEL) {
    return new VercelBlobStorage()
  }
  return new LocalFileStorage()
}

// Helper functions for easy use
export async function saveAudio(file: Buffer, filename: string): Promise<string> {
  const storage = getStorageAdapter()
  return await storage.save(file, filename)
}

export async function getAudio(url: string): Promise<Buffer> {
  const storage = getStorageAdapter()
  return await storage.retrieve(url)
}

export async function deleteAudio(url: string): Promise<void> {
  const storage = getStorageAdapter()
  return await storage.delete(url)
}