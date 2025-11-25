import { format } from 'date-fns'
import type { ViewModeConfig } from './types'

interface GanttUnifiedHeaderProps {
  columns: Date[]
  viewModeConfig: ViewModeConfig
  leftPanelWidth: number
}

export function GanttUnifiedHeader({ 
  columns, 
  viewModeConfig,
  leftPanelWidth
}: GanttUnifiedHeaderProps) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Date Headers */}
      <div className="bg-gray-50 dark:bg-gray-800">
        {/* Upper Header Row (Month/Year) - no vertical dividers */}
        <div className="flex h-11 border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {columns.map((col, idx) => {
              const prev = idx > 0 ? columns[idx - 1] : undefined
              const showText = viewModeConfig.showUpperWhen(col, prev)
              
              return (
                <div
                  key={idx}
                  className="px-2 flex items-center"
                  style={{ width: viewModeConfig.columnWidth }}
                >
                  {showText && (
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {format(col, viewModeConfig.upperFormat)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Middle Header Row (Day/Month) - no vertical dividers */}
        <div className="flex h-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="px-2 flex items-center justify-center"
                style={{ width: viewModeConfig.columnWidth }}
              >
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {format(col, viewModeConfig.lowerFormat)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Lower Header Row (Day of Week - single letter) - no vertical dividers */}
        <div className="flex h-6">
          <div className="flex">
            {columns.map((col, idx) => (
              <div
                key={idx}
                className="px-2 flex items-center justify-center"
                style={{ width: viewModeConfig.columnWidth }}
              >
                <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  {format(col, 'EEEEE')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
