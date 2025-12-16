import Link from 'next/link'
import type { Trip, Activity } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { getTripDuration } from '@/lib/date-service'

interface TripCardProps {
  trip: Trip
  activities?: Activity[]
}

export function TripCard({ trip, activities = [] }: TripCardProps) {
  const duration = getTripDuration(trip)
  
  // Extract unique cities from activities
  const cities = [...new Set(activities.map(a => a.city).filter(Boolean))] as string[]
  
  // Count different activity types
  const flightCount = activities.filter(a => a.type === 'flight').length
  const stayCount = activities.filter(a => a.type === 'stay').length
  const eventCount = activities.filter(a => a.type === 'event').length
  
  // Format date range for display
  const getDateDisplay = () => {
    if (isFixedTrip(trip)) {
      const startDate = new Date(trip.startDate)
      const endDate = new Date(trip.endDate)
      const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${startStr} - ${endStr}`
    }
    return `${duration} ${duration === 1 ? 'day' : 'days'} trip`
  }

  return (
    <Link href={`/trip/${trip.id}/timeline`} className="block group">
      <div 
        className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5"
      >
        {/* Color accent bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: trip.color }}
        />
        
        <div className="p-5 pt-4">
          {/* Header with name */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {trip.name}
            </h3>
            {cities.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {cities.slice(0, 3).join(' → ')}{cities.length > 3 ? ' +' + (cities.length - 3) + ' more' : ''}
              </p>
            )}
          </div>
          
          {/* Date and duration */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">{getDateDisplay()}</span>
            {isFixedTrip(trip) && (
              <span className="text-gray-400 dark:text-gray-500">
                · {duration} {duration === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>
          
          {/* Activity stats */}
          {activities.length > 0 ? (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {flightCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>✈️</span>
                  <span>{flightCount}</span>
                </span>
              )}
              {stayCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>🏨</span>
                  <span>{stayCount}</span>
                </span>
              )}
              {eventCount > 0 && (
                <span className="flex items-center gap-1">
                  <span>🎯</span>
                  <span>{eventCount}</span>
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500">
                · {activities.length} total
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              No activities yet
            </p>
          )}
        </div>
        
        {/* Hover indicator */}
        <div className="absolute bottom-3 right-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
