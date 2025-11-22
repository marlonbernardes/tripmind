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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
      {/* Day Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
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
      <div className="p-6">
        <div className="space-y-2">
          {sortedActivities.map((activity, index) => (
            <div key={activity.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/30'}>
              <ActivityCard
                activity={activity}
                isSelected={selectedActivityId === activity.id}
                onClick={() => onActivitySelect?.(activity)}
              />
            </div>
          ))}
        </div>
        
        {/* Add Activity Button */}
        <button className="w-full mt-4 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
