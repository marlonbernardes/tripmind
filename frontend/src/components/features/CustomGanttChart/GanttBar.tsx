import { cn } from '@/lib/utils'
import { ACTIVITY_COLORS } from './utils/viewModeConfig'
import type { GanttBarProps } from './types'

// Minimum width threshold to show as a "dot" indicator
const DOT_THRESHOLD = 20

export function GanttBar({
  activity,
  x,
  width,
  isSelected,
  onHover,
  onClick
}: GanttBarProps) {
  const isPointEvent = width < DOT_THRESHOLD
  const activityColor = ACTIVITY_COLORS[activity.type] || '#6B7280'
  
  if (isPointEvent) {
    // Render as a small dot/marker for point-in-time events
    return (
      <div
        data-activity-bar
        className={cn(
          "absolute top-2 h-8 flex items-center justify-center cursor-pointer select-none",
          isSelected && "ring-2 ring-blue-500 ring-offset-1 rounded"
        )}
        style={{ left: x - 6 }} // Center the dot on the position
        onMouseEnter={() => onHover?.(activity)}
        onMouseLeave={() => onHover?.(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(activity)
        }}
      >
        {/* Diamond/dot marker */}
        <div
          className="w-3 h-3 rotate-45 border-2 bg-white dark:bg-gray-900"
          style={{ borderColor: activityColor }}
        />
      </div>
    )
  }
  
  return (
    <div
      data-activity-bar
      className={cn(
        "absolute top-2 h-8 rounded px-1.5 flex items-center cursor-pointer transition-opacity select-none group border-2 bg-white dark:bg-gray-900",
        isSelected && "ring-2 ring-blue-500 ring-offset-1"
      )}
      style={{
        left: x,
        width: width, // Use actual calculated width, no minimum
        borderColor: activityColor,
      }}
      onMouseEnter={() => onHover?.(activity)}
      onMouseLeave={() => onHover?.(null)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(activity)
      }}
    >
      <span className="text-xs font-medium truncate pointer-events-none text-gray-800 dark:text-gray-200">
        {activity.title}
      </span>
    </div>
  )
}
