import { NextRequest, NextResponse } from 'next/server'
import { hasDevApiKeys, isDevelopment } from '@/lib/env'

export async function GET(request: NextRequest) {
  // Only allow this endpoint in development
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    hasDevKeys: hasDevApiKeys(),
    isDevelopment: true
  })
}