import React from 'react'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVITY_COLORS } from './utils/viewModeConfig'
import type { GanttLeftPanelProps } from './types'

export function GanttLeftPanel({
  groupedActivities,
  expandedCategories,
  onToggleCategory,
  selectedActivityId,
  onActivitySelect
}: GanttLeftPanelProps) {
  return (
    <div className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
      {/* Activity List */}
      {groupedActivities.map((group, groupIdx) => (
        <React.Fragment key={group.type}>
          {/* Category Header */}
          <div 
            className={cn(
              "flex items-center h-12 px-4 cursor-pointer border-b border-gray-200 dark:border-gray-700",
              groupIdx % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"
            )}
            onClick={() => onToggleCategory(group.type)}
          >
            <button className="w-4 h-4 mr-2">
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expandedCategories.has(group.type) ? "" : "-rotate-90"
              )} />
            </button>
            <div 
              className="w-3 h-3 rounded mr-2"
              style={{ backgroundColor: ACTIVITY_COLORS[group.type] }}
            />
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              {group.type.charAt(0).toUpperCase() + group.type.slice(1)}s ({group.allActivities.length})
            </span>
          </div>
          
          {/* Activity Rows */}
          {expandedCategories.has(group.type) && group.activities.map((activity, actIdx) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-center h-12 px-6 cursor-pointer border-b border-gray-200 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                selectedActivityId === activity.id && "bg-blue-50 dark:bg-blue-900/20",
                (groupIdx * 100 + actIdx) % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/20" : "bg-white dark:bg-gray-900"
              )}
              onClick={() => onActivitySelect?.(activity)}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: ACTIVITY_COLORS[activity.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                  {activity.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activity.city && `${activity.city} • `}
                  {format(new Date(activity.start), 'MMM d')}
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}
