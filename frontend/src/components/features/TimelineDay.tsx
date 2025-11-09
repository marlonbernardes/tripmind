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
    // Extract time for sorting (remove timezone indicators)
    const timeA = a.startTime.split('+')[0]
    const timeB = b.startTime.split('+')[0]
    return timeA.localeCompare(timeB)
  })

  return (
    <div className="mb-8">
      {/* Sticky Day Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
      <div className="space-y-3 ml-6">
        {sortedActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isSelected={selectedActivityId === activity.id}
            onClick={() => onActivitySelect?.(activity)}
          />
        ))}
        
        {/* Add Activity Button */}
        <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
