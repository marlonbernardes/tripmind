import { cn } from '@/lib/utils'
import { ACTIVITY_COLORS } from './utils/viewModeConfig'
import { useGanttDrag } from './hooks/useGanttDrag'
import { useState, useCallback, useEffect } from 'react'
import type { GanttBarProps } from './types'

export function GanttBar({
  activity,
  x,
  width,
  viewModeConfig,
  ganttStart,
  isSelected,
  onActivityUpdate,
  onHover,
  onClick
}: GanttBarProps) {
  const { isDragging, handleMouseDown, handleTouchStart } = useGanttDrag(
    activity,
    viewModeConfig,
    ganttStart,
    onActivityUpdate
  )
  
  const [resizing, setResizing] = useState<'start' | 'end' | null>(null)
  const [resizeStartPos, setResizeStartPos] = useState<{ x: number; startDate: Date; endDate: Date } | null>(null)
  
  const handleResizeStart = useCallback((e: React.MouseEvent, edge: 'start' | 'end') => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(edge)
    setResizeStartPos({
      x: e.clientX,
      startDate: new Date(activity.start),
      endDate: new Date(activity.end || activity.start)
    })
  }, [activity.start, activity.end])
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing || !resizeStartPos || !onActivityUpdate) return
    
    const deltaX = e.clientX - resizeStartPos.x
    const deltaCols = deltaX / viewModeConfig.columnWidth
    const deltaMs = deltaCols * viewModeConfig.step
    const snappedDelta = Math.round(deltaMs / viewModeConfig.snapInterval) * viewModeConfig.snapInterval
    
    if (resizing === 'start') {
      const newStart = new Date(resizeStartPos.startDate.getTime() + snappedDelta)
      // Don't allow start to go beyond end, keep end fixed
      if (newStart < resizeStartPos.endDate) {
        onActivityUpdate(activity.id, {
          start: newStart.toISOString(),
          end: resizeStartPos.endDate.toISOString() // Keep original end date fixed
        })
      }
    } else {
      const newEnd = new Date(resizeStartPos.endDate.getTime() + snappedDelta)
      // Don't allow end to go before start, keep start fixed
      if (newEnd > resizeStartPos.startDate) {
        onActivityUpdate(activity.id, {
          start: resizeStartPos.startDate.toISOString(), // Keep original start date fixed
          end: newEnd.toISOString()
        })
      }
    }
  }, [resizing, resizeStartPos, activity.id, viewModeConfig, onActivityUpdate])
  
  const handleResizeEnd = useCallback(() => {
    setResizing(null)
    setResizeStartPos(null)
  }, [])
  
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizing, handleResizeMove, handleResizeEnd])
  
  return (
    <div
      data-activity-bar
      className={cn(
        "absolute top-2 h-8 rounded px-2 flex items-center cursor-move transition-opacity select-none group border-2 bg-white dark:bg-gray-900",
        isDragging && "opacity-70 shadow-lg z-10",
        resizing && "opacity-70 shadow-lg z-10",
        isSelected && "ring-2 ring-blue-500 ring-offset-1"
      )}
      style={{
        left: x,
        width: Math.max(width, 60),
        borderColor: ACTIVITY_COLORS[activity.type] || '#6B7280',
        minWidth: '60px'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => onHover?.(activity)}
      onMouseLeave={() => onHover?.(null)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(activity)
      }}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, 'start')}
        onClick={(e) => e.stopPropagation()}
      />
      
      <span className="text-xs font-medium truncate pointer-events-none text-gray-800 dark:text-gray-200">
        {activity.title}
      </span>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, 'end')}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
