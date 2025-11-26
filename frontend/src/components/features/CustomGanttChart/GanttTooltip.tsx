import { format, isSameMonth } from 'date-fns'
import { ACTIVITY_COLORS } from './utils/viewModeConfig'
import type { SimpleActivity } from '@/types/simple'
import { useEffect, useState, useRef } from 'react'

interface GanttTooltipProps {
  activity: SimpleActivity
  barX: number
  barY: number
  barWidth: number
  containerRef: HTMLDivElement | null
}

export function GanttTooltip({
  activity,
  barX,
  barY,
  barWidth,
  containerRef
}: GanttTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'top' as 'top' | 'bottom' })
  
  const start = new Date(activity.start)
  const end = new Date(activity.end || activity.start)
  
  // Calculate smart positioning
  useEffect(() => {
    if (!tooltipRef.current || !containerRef) return
    
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const containerRect = containerRef.getBoundingClientRect()
    
    // Calculate centered position
    let x = barX + barWidth / 2 - tooltipRect.width / 2
    let y = barY - tooltipRect.height - 12 // 12px gap above bar
    let placement: 'top' | 'bottom' = 'top'
    
    // Check if tooltip goes above visible area
    if (y < 0) {
      // Flip to bottom
      y = barY + 40 + 8 // bar height (40px) + gap (8px)
      placement = 'bottom'
    }
    
    // Check if tooltip goes off left edge
    if (x < 0) {
      x = 8 // 8px padding from edge
    }
    
    // Check if tooltip goes off right edge
    const rightEdge = x + tooltipRect.width
    const containerWidth = containerRect.width
    if (rightEdge > containerWidth) {
      x = containerWidth - tooltipRect.width - 8 // 8px padding from edge
    }
    
    setPosition({ x, y, placement })
  }, [barX, barY, barWidth, containerRef])
  
  const activityColor = ACTIVITY_COLORS[activity.type] || '#6B7280'
  
  return (
    <div
      ref={tooltipRef}
      className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[9999] transition-opacity duration-200 border border-gray-200 dark:border-gray-700 min-w-[220px] max-w-[320px] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Arrow pointer */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-transparent ${
          position.placement === 'top'
            ? 'bottom-[-8px] border-t-8 border-t-white dark:border-t-gray-800'
            : 'top-[-8px] border-b-8 border-b-white dark:border-b-gray-800'
        }`}
      />
      
      {/* Content */}
      <div className="space-y-1.5">
        {/* Title */}
        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {activity.title}
        </h4>
        
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: activityColor }}
          >
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </span>
        </div>
        
        {/* Date range - From/To format */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 pt-1">
          <div className="flex items-start gap-1">
            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 space-y-0.5">
              <div className="flex gap-2">
                <span className="font-medium text-right w-12">From:</span>
                <span>{format(start, 'MMM dd, h:mm a')}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-right w-12">To:</span>
                <span>{format(end, 'MMM dd, h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
