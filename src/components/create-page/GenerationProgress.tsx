'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface GenerationProgressProps {
  isGenerating: boolean
  progress: number
  currentStep: string
}

export function GenerationProgress({
  isGenerating,
  progress,
  currentStep
}: GenerationProgressProps) {
  if (!isGenerating) return null

  return (
    <Card className="p-6 mb-4">
      <h3 className="font-medium mb-4">Generation Progress</h3>
      <Progress value={progress} className="mb-2" />
      <p className="text-sm text-gray-600">{currentStep}</p>
    </Card>
  )
}