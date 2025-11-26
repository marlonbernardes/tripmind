import { format, isSameMonth, startOfDay, endOfDay } from 'date-fns'
import { calculateBarPosition } from './utils/positionUtils'
import type { ViewModeConfig } from './types'
import type { SimpleActivity } from '@/types/simple'

interface GanttDateRangePillProps {
  activity: SimpleActivity
  ganttStart: Date
  viewModeConfig: ViewModeConfig
}

export function GanttDateRangePill({
  activity,
  ganttStart,
  viewModeConfig
}: GanttDateRangePillProps) {
  const start = new Date(activity.start)
  const end = new Date(activity.end || activity.start)
  
  // Use full day boundaries for the pill
  const dayStart = startOfDay(start)
  const dayEnd = endOfDay(end)
  
  const { x, width } = calculateBarPosition(dayStart, dayEnd, ganttStart, viewModeConfig)
  
  // Add padding
  const padding = 4 // pixels on each side
  
  // Format date range
  const formatDateRange = () => {
    if (isSameMonth(start, end)) {
      // Same month: "Jan 08 – Jan 12"
      return `${format(start, 'MMM dd')} – ${format(end, 'dd')}`
    } else {
      // Different months: "Nov 29 – Dec 03"
      return `${format(start, 'MMM dd')} – ${format(end, 'MMM dd')}`
    }
  }
  
  return (
    <div
      className="absolute rounded bg-blue-400/20 dark:bg-blue-500/20 transition-opacity duration-200 z-30 pointer-events-none"
      style={{
        left: x - padding,
        width: width + (padding * 2),
        top: '3rem', // Position on second row with better vertical centering
        height: '1.5rem', // 24px height (more compact)
      }}
    />
  )
}
