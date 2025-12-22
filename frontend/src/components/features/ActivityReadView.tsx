'use client'

import type { Activity, FlightMetadata, StayMetadata, EventMetadata } from '@/types/simple'
import { useTripContext } from '@/contexts/TripContext'
import { formatDayHeader } from '@/lib/date-service'
import { ActivityIcon } from '@/components/ui/activity-icon'

interface ActivityReadViewProps {
  activity: Activity
  onEdit?: () => void
}

export function ActivityReadView({ activity, onEdit }: ActivityReadViewProps) {
  const { trip } = useTripContext()

  // Format day display
  const getDayDisplay = () => {
    if (!trip) return `Day ${activity.day}`
    const dayHeader = formatDayHeader(trip, activity.day)
    
    if (activity.endDay && activity.endDay !== activity.day) {
      const endDayHeader = formatDayHeader(trip, activity.endDay)
      return `${dayHeader} – ${endDayHeader}`
    }
    return dayHeader
  }

  // Format time display
  const getTimeDisplay = () => {
    if (activity.allDay) return 'All day'
    if (!activity.time) return ''
    
    let display = activity.time
    if (activity.endTime) {
      display += ` – ${activity.endTime}`
    }
    return display
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <ActivityIcon type={activity.type} size={20} colored />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.title}
            </h4>
            <span className={`inline-block mt-1 px-1.5 py-0.5 text-xs rounded ${
              activity.status === 'confirmed' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {activity.status === 'confirmed' ? 'Confirmed' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="space-y-3 text-xs">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {getDayDisplay()}
            {getTimeDisplay() && ` • ${getTimeDisplay()}`}
          </span>
        </div>

        {/* Location */}
        {activity.city && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{activity.city}</span>
          </div>
        )}

        {/* Type-specific metadata */}
        {activity.type === 'flight' && activity.metadata && (
          <FlightDetails metadata={activity.metadata as FlightMetadata} />
        )}
        
        {activity.type === 'stay' && activity.metadata && (
          <StayDetails metadata={activity.metadata as StayMetadata} />
        )}
        
        {activity.type === 'event' && activity.metadata && (
          <EventDetails metadata={activity.metadata as EventMetadata} />
        )}

        {/* Notes */}
        {activity.notes && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">{activity.notes}</p>
          </div>
        )}
      </div>

      {/* Edit button */}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="w-full px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-xs font-medium"
        >
          Edit Activity
        </button>
      )}
    </div>
  )
}

// Flight-specific details
function FlightDetails({ metadata }: { metadata: FlightMetadata }) {
  return (
    <div className="space-y-2">
      {(metadata.from || metadata.to) && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span>{metadata.from} → {metadata.to}</span>
        </div>
      )}
      {metadata.airline && (
        <div className="text-gray-500 dark:text-gray-500">
          {metadata.airline}
          {metadata.flightNumber && ` • ${metadata.flightNumber}`}
        </div>
      )}
    </div>
  )
}

// Stay-specific details
function StayDetails({ metadata }: { metadata: StayMetadata }) {
  return (
    <div className="space-y-2">
      {metadata.propertyName && (
        <div className="text-gray-600 dark:text-gray-400 font-medium">
          {metadata.propertyName}
        </div>
      )}
      {metadata.confirmationCode && (
        <div className="text-gray-500 dark:text-gray-500">
          Confirmation: {metadata.confirmationCode}
        </div>
      )}
    </div>
  )
}

// Event-specific details - simplified, no metadata fields
function EventDetails({ metadata }: { metadata: EventMetadata }) {
  // EventMetadata is now empty, but we keep this for potential future fields
  return null
}
