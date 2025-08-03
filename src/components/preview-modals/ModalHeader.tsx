'use client'

import { X } from 'lucide-react'
import { DialogTitle } from '@/components/ui/dialog'

interface ModalHeaderProps {
  sectionIndex: number
  totalSections: number
  onClose: () => void
}

export function ModalHeader({ sectionIndex, totalSections, onClose }: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <DialogTitle className="text-white text-sm opacity-80">
        Section {sectionIndex + 1} of {totalSections}
      </DialogTitle>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}