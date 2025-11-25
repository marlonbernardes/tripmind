import React from 'react'
import { GanttRow } from './GanttRow'
import { GanttBar } from './GanttBar'
import { calculateBarPosition } from './utils/positionUtils'
import type { GanttGridProps } from './types'

export function GanttGrid({
  columns,
  groupedActivities,
  viewModeConfig,
  ganttStart,
  selectedActivityId,
  onActivityUpdate
}: GanttGridProps) {
  // Calculate total rows to render vertical lines properly
  const totalRows = groupedActivities.reduce((sum, group) => {
    // Each group has 1 category row + number of activity rows (if expanded)
    return sum + 1 + group.activities.length
  }, 0)
  
  return (
    <div>
      {/* Activity Rows with Bars */}
      <div>
        {groupedActivities.map((group, groupIdx) => (
          <React.Fragment key={group.type}>
          {/* Category Row - shows all activities if collapsed, empty if expanded */}
          {group.activities.length === 0 ? (
            // Collapsed: Show all activities from this category on the parent row
            <div className="relative h-12 border-b border-gray-200 dark:border-gray-700">
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
              {group.allActivities.map((activity) => {
                const { x, width } = calculateBarPosition(
                  new Date(activity.start),
                  activity.end ? new Date(activity.end) : new Date(activity.start),
                  ganttStart,
                  viewModeConfig
                )
                return (
                  <GanttBar
                    key={activity.id}
                    activity={activity}
                    x={x}
                    width={width}
                    viewModeConfig={viewModeConfig}
                    ganttStart={ganttStart}
                    isSelected={selectedActivityId === activity.id}
                    onActivityUpdate={onActivityUpdate}
                  />
                )
              })}
            </div>
          ) : (
            // Expanded: Show empty category row
            <div className="relative h-12 border-b border-gray-200 dark:border-gray-700">
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
            </div>
          )}
          
          {/* Activity Rows - only show if category is expanded */}
          {group.activities.length > 0 && group.activities.map((activity, actIdx) => (
            <GanttRow
              key={activity.id}
              activity={activity}
              ganttStart={ganttStart}
              viewModeConfig={viewModeConfig}
              rowIndex={groupIdx * 100 + actIdx}
              isSelected={selectedActivityId === activity.id}
              columns={columns}
              onActivityUpdate={onActivityUpdate}
            />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
