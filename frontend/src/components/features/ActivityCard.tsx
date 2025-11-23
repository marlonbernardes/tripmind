import type { SimpleActivity } from '@/types/simple'

interface ActivityCardProps {
  activity: SimpleActivity
  isSelected?: boolean
  onClick?: () => void
}

const activityTypeConfig = {
  flight: { dot: '#3B82F6', name: 'Flight' },
  hotel: { dot: '#10B981', name: 'Hotel' },
  event: { dot: '#8B5CF6', name: 'Event' },
  transport: { dot: '#F59E0B', name: 'Transport' },
  note: { dot: '#6B7280', name: 'Note' },
  task: { dot: '#F97316', name: 'Task' }
}

export function ActivityCard({ activity, isSelected = false, onClick }: ActivityCardProps) {
  const config = activityTypeConfig[activity.type]
  
  const formatTime = (time: string) => {
    // Handle timezone indicators like "+1"
    if (time.includes('+')) {
      const [baseTime, offset] = time.split('+')
      return `${baseTime} (+${offset})`
    }
    return time
  }

  const timeDisplay = activity.endTime 
    ? `${formatTime(activity.startTime)} – ${formatTime(activity.endTime)}`
    : formatTime(activity.startTime)

  // Get subtle background color based on activity type
  const getBackgroundColor = () => {
    const colors = {
      flight: 'bg-blue-50 dark:bg-blue-950/30',
      hotel: 'bg-green-50 dark:bg-green-950/30',
      event: 'bg-purple-50 dark:bg-purple-950/30',
      transport: 'bg-amber-50 dark:bg-amber-950/30',
      note: 'bg-gray-50 dark:bg-gray-800/30',
      task: 'bg-orange-50 dark:bg-orange-950/30'
    }
    return colors[activity.type] || colors.note
  }

  const getBorderColor = () => {
    if (isSelected) {
      return 'border-gray-300 dark:border-gray-600'
    }
    return 'border-gray-200 dark:border-gray-700'
  }

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm ${
        getBackgroundColor()
      } ${getBorderColor()}`}
    >
      {/* Colored dot indicator */}
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
            {activity.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {timeDisplay}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {config.name}
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
