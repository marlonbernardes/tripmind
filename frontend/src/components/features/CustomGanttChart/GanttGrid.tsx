import React, { useState, useEffect } from 'react'
import { GanttRow } from './GanttRow'
import { GanttBar } from './GanttBar'
import { GanttTooltip } from './GanttTooltip'
import { calculateBarPosition } from './utils/positionUtils'
import type { GanttGridProps } from './types'

export function GanttGrid({
  columns,
  groupedActivities,
  viewModeConfig,
  ganttStart,
  selectedActivityId,
  onActivityUpdate,
  onActivityHover,
  onActivityClick,
  activeActivity,
  containerRef
}: GanttGridProps) {
  // Mobile detection - hide tooltip on mobile devices
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Calculate total rows to render vertical lines properly
  const totalRows = groupedActivities.reduce((sum, group) => {
    // Each group has 1 category row + number of activity rows (if expanded)
    return sum + 1 + group.activities.length
  }, 0)
  
  return (
    <div className="relative overflow-visible">
      {/* Tooltip - rendered at grid level for proper positioning, hidden on mobile */}
      {!isMobile && activeActivity && containerRef && (() => {
        const { x, width } = calculateBarPosition(
          new Date(activeActivity.start),
          activeActivity.end ? new Date(activeActivity.end) : new Date(activeActivity.start),
          ganttStart,
          viewModeConfig
        )
        
        // Find the row index for this activity
        let rowY = 0
        let found = false
        for (const group of groupedActivities) {
          if (!found && group.activities.length === 0) {
            // Collapsed category - check allActivities
            if (group.allActivities.some(a => a.id === activeActivity.id)) {
              found = true
              break
            }
            rowY += 48 // category row height
          } else {
            rowY += 48 // category row height
            for (const activity of group.activities) {
              if (activity.id === activeActivity.id) {
                found = true
                break
              }
              rowY += 48 // activity row height
            }
            if (found) break
          }
        }
        
        return (
          <GanttTooltip
            activity={activeActivity}
            barX={x}
            barY={rowY}
            barWidth={width}
            containerRef={containerRef}
          />
        )
      })()}
      
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
                    onHover={onActivityHover}
                    onClick={onActivityClick}
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
              onActivityHover={onActivityHover}
              onActivityClick={onActivityClick}
            />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
