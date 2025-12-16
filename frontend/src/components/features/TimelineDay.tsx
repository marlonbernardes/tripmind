import type { Activity, Suggestion } from '@/types/simple'
import { ActivityCard } from './ActivityCard'
import { SuggestionCard } from './SuggestionCard'
import { useTripContext } from '@/contexts/TripContext'
import { compareActivities } from '@/lib/date-service'

interface TimelineDayProps {
  day: number
  dayHeader: string // Pre-formatted header like "Mon, Jan 8" or "Day 1"
  activities: Activity[]
  suggestions?: Suggestion[]
  selectedActivityId?: string
  selectedSuggestionId?: string
  onActivitySelect?: (activity: Activity) => void
  onSuggestionSelect?: (suggestion: Suggestion) => void
  onSuggestionDismiss?: (id: string) => void
}

export function TimelineDay({ 
  day, 
  dayHeader, 
  activities, 
  suggestions = [],
  selectedActivityId,
  selectedSuggestionId,
  onActivitySelect,
  onSuggestionSelect,
  onSuggestionDismiss
}: TimelineDayProps) {
  const { setIsCreatingActivity, setSelectedActivity, setSelectedSuggestion } = useTripContext()

  const handleAddActivityClick = () => {
    setSelectedActivity(null)
    setSelectedSuggestion(null)
    setIsCreatingActivity(true)
  }

  // Group activities by city for the day header
  const cities = [...new Set(activities.filter(a => a.city).map(a => a.city))]

  // Sort activities by time
  const sortedActivities = [...activities].sort(compareActivities)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Day Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-gray-900 dark:text-white">
              {dayHeader}
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
        <div className="space-y-0">
          {sortedActivities.map((activity, index) => (
            <div key={activity.id}>
              {index > 0 && (
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              )}
              <ActivityCard
                activity={activity}
                isSelected={selectedActivityId === activity.id}
                onClick={() => onActivitySelect?.(activity)}
              />
            </div>
          ))}
        </div>
        
        {/* Suggestions for this day */}
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestionId === suggestion.id}
                onClick={() => onSuggestionSelect?.(suggestion)}
                onDismiss={() => onSuggestionDismiss?.(suggestion.id)}
              />
            ))}
          </div>
        )}

        {/* Add Activity Button */}
        <button 
          onClick={handleAddActivityClick}
          className="w-full mt-4 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors group bg-white dark:bg-gray-900"
        >
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
