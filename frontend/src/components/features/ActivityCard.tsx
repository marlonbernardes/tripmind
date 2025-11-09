import type { SimpleActivity } from '@/types/simple'

interface ActivityCardProps {
  activity: SimpleActivity
  isSelected?: boolean
  onClick?: () => void
}

const activityTypeConfig = {
  flight: { emoji: '✈️', color: 'bg-blue-100 text-blue-700', name: 'Flight' },
  hotel: { emoji: '🏨', color: 'bg-green-100 text-green-700', name: 'Hotel' },
  event: { emoji: '🎯', color: 'bg-purple-100 text-purple-700', name: 'Event' },
  transport: { emoji: '🚌', color: 'bg-yellow-100 text-yellow-700', name: 'Transport' },
  note: { emoji: '📝', color: 'bg-gray-100 text-gray-700', name: 'Note' },
  task: { emoji: '✅', color: 'bg-orange-100 text-orange-700', name: 'Task' }
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
    ? `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`
    : formatTime(activity.startTime)

  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${config.color} dark:opacity-90`}>
        {config.emoji}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
            {activity.title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${config.color} font-medium`}>
            {config.name}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
          {timeDisplay}
        </p>
        
        {activity.city && (
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {activity.city}
          </p>
        )}
      </div>
    </div>
  )
}
