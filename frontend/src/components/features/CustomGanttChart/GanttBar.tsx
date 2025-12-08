import { cn } from '@/lib/utils'
import { ACTIVITY_COLORS } from './utils/viewModeConfig'
import type { GanttBarProps } from './types'

export function GanttBar({
  activity,
  x,
  width,
  isSelected,
  onHover,
  onClick
}: GanttBarProps) {
  return (
    <div
      data-activity-bar
      className={cn(
        "absolute top-2 h-8 rounded px-2 flex items-center cursor-pointer transition-opacity select-none group border-2 bg-white dark:bg-gray-900",
        isSelected && "ring-2 ring-blue-500 ring-offset-1"
      )}
      style={{
        left: x,
        width: Math.max(width, 24),
        borderColor: ACTIVITY_COLORS[activity.type] || '#6B7280',
        minWidth: '24px'
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
