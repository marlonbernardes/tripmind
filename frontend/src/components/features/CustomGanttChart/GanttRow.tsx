import { addHours } from 'date-fns'
import { cn } from '@/lib/utils'
import { GanttBar } from './GanttBar'
import { calculateBarPosition } from './utils/positionUtils'
import type { GanttRowProps } from './types'

export function GanttRow({
  activity,
  ganttStart,
  viewModeConfig,
  rowIndex,
  isSelected,
  columns,
  onActivityUpdate
}: GanttRowProps) {
  const activityStart = new Date(activity.start)
  const activityEnd = activity.end ? new Date(activity.end) : addHours(activityStart, 1)
  
  const { x, width } = calculateBarPosition(
    activityStart,
    activityEnd,
    ganttStart,
    viewModeConfig
  )
  
  return (
    <div className={cn(
      "relative h-12 border-b border-gray-200 dark:border-gray-700",
      rowIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/20" : "bg-white dark:bg-gray-900"
    )}>
      {/* Vertical grid lines for this row */}
      <div className="absolute inset-0 flex pointer-events-none">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="border-r border-gray-100 dark:border-gray-800 h-full"
            style={{ width: viewModeConfig.columnWidth }}
          />
        ))}
      </div>
      <GanttBar
        activity={activity}
        x={x}
        width={width}
        viewModeConfig={viewModeConfig}
        ganttStart={ganttStart}
        isSelected={isSelected}
        onActivityUpdate={onActivityUpdate}
      />
    </div>
  )
}
