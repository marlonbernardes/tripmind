import Link from 'next/link'
import type { Trip } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { getTripDuration } from '@/lib/date-service'

interface TripCardProps {
  trip: Trip
  activitiesCount?: number
}

export function TripCard({ trip, activitiesCount = 0 }: TripCardProps) {
  const duration = getTripDuration(trip)
  
  // Format date range for display
  const getDateDisplay = () => {
    if (isFixedTrip(trip)) {
      const startDate = new Date(trip.startDate)
      const endDate = new Date(trip.endDate)
      const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${startStr} - ${endStr}`
    }
    // Flexible trip
    return 'Flexible dates'
  }

  return (
    <Link href={`/trip/${trip.id}/timeline`}>
      <div className="group p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {trip.name}
          </h3>
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: trip.color }}
          />
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            {getDateDisplay()}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {duration} {duration === 1 ? 'day' : 'days'}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
          </span>
          <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
