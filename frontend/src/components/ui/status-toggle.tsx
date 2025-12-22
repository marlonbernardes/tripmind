'use client'

import { cn } from '@/lib/utils'
import { FileEdit, CheckCircle } from 'lucide-react'
import type { ActivityStatus } from '@/types/simple'

interface StatusToggleProps {
  value: ActivityStatus
  onChange: (status: ActivityStatus) => void
  className?: string
}

/**
 * Segmented control for selecting activity status (draft/confirmed)
 * Two-line layout with icons
 */
export function StatusToggle({ value, onChange, className }: StatusToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-input p-0.5 bg-muted/30', className)}>
      <button
        type="button"
        onClick={() => onChange('draft')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
          value === 'draft'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileEdit className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <div className="text-xs font-medium">Draft</div>
          <div className="text-[10px] opacity-70">Not yet booked</div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onChange('confirmed')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
          value === 'confirmed'
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <CheckCircle className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <div className="text-xs font-medium">Confirmed</div>
          <div className="text-[10px] opacity-70">All set</div>
        </div>
      </button>
    </div>
  )
}
