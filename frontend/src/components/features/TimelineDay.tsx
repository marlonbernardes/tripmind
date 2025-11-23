import type { SimpleActivity } from '@/types/simple'
import { ActivityCard } from './ActivityCard'

interface TimelineDayProps {
  date: string
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
}

export function TimelineDay({ date, activities, selectedActivityId, onActivitySelect }: TimelineDayProps) {
  // Group activities by city for the day header
  const cities = [...new Set(activities.filter(a => a.city).map(a => a.city))]
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    return `${dayName}, ${monthDay}`
  }

  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Day Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-gray-900 dark:text-white">
              {formatDate(date)}
            </h2>
            {cities.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {cities.join(', ')}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
          </div>
        </div>
      </div>
      
      {/* Activities List */}
      <div className="p-4">
        <div className="space-y-2">
          {sortedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isSelected={selectedActivityId === activity.id}
              onClick={() => onActivitySelect?.(activity)}
            />
          ))}
        </div>
        
        {/* Add Activity Button */}
        <button className="w-full mt-4 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors group bg-white dark:bg-gray-900">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 flex items-center justify-center transition-colors">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium">Add activity</span>
          </div>
        </button>
      </div>
    </div>
  )
}
