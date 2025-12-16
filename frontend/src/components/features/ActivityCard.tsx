import type { Activity, ActivityType } from '@/types/simple'
import { getActivityColor, getActivityLabel } from '@/lib/activity-config'

interface ActivityCardProps {
  activity: Activity
  isSelected?: boolean
  onClick?: () => void
}

export function ActivityCard({ activity, isSelected = false, onClick }: ActivityCardProps) {
  const activityColor = getActivityColor(activity.type)
  const activityLabel = getActivityLabel(activity.type)
  
  const startTime = activity.time ?? ''
  const endTime = activity.endTime ?? null
  
  const timeDisplay = endTime 
    ? `${startTime} – ${endTime}`
    : startTime

  // Get subtle background color based on activity type
  const getBackgroundColor = () => {
    const colors: Record<ActivityType, string> = {
      flight: 'bg-blue-50 dark:bg-blue-950/30',
      stay: 'bg-green-50 dark:bg-green-950/30',
      event: 'bg-purple-50 dark:bg-purple-950/30',
      transport: 'bg-amber-50 dark:bg-amber-950/30'
    }
    return colors[activity.type] || 'bg-gray-50 dark:bg-gray-800/30'
  }

  const getBorderColor = () => {
    if (isSelected) {
      return 'border-gray-300 dark:border-gray-600'
    }
    return 'border-gray-200 dark:border-gray-700'
  }

  // Get styling for draft activities
  const getDraftStyling = () => {
    if (activity.status === 'draft') {
      return {
        borderLeft: 'border-l-4 border-l-amber-500',
        opacity: 'opacity-85',
        background: 'bg-amber-50/50 dark:bg-amber-950/20'
      }
    }
    return {
      borderLeft: '',
      opacity: '',
      background: getBackgroundColor()
    }
  }

  const draftStyling = getDraftStyling()

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm ${
        draftStyling.background
      } ${getBorderColor()} ${draftStyling.borderLeft} ${draftStyling.opacity}`}
    >
      {/* Colored dot indicator */}
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: activityColor }}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
            {activity.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {activity.status === 'draft' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                DRAFT
              </span>
            )}
            {activity.status === 'confirmed' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                CONFIRMED
              </span>
            )}
            {timeDisplay && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {timeDisplay}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {activityLabel}
          </span>
          {activity.city && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activity.city}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
