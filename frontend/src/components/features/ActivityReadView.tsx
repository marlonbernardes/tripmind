'use client'

import type { SimpleActivity, FlightMetadata, HotelMetadata, EventMetadata } from '@/types/simple'
import { getDateFromDateTime, getTimeFromDateTime } from '@/lib/mock-data'

interface ActivityReadViewProps {
  activity: SimpleActivity
  onEdit?: () => void
}

export function ActivityReadView({ activity, onEdit }: ActivityReadViewProps) {
  const formatDate = (dateStr: string) => {
    return new Date(getDateFromDateTime(dateStr)).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActivityIcon = (type: SimpleActivity['type']) => {
    switch (type) {
      case 'flight': return '✈️'
      case 'hotel': return '🏨'
      case 'event': return '🎫'
      case 'transport': return '🚗'
      case 'note': return '📝'
      case 'task': return '✅'
      default: return '📝'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.title}
            </h4>
            <span className={`inline-block mt-1 px-1.5 py-0.5 text-xs rounded ${
              activity.status === 'booked' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {activity.status === 'booked' ? 'Booked' : 'Planned'}
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
            {formatDate(activity.start)}
            {' • '}
            {getTimeFromDateTime(activity.start)}
            {activity.end && ` – ${getTimeFromDateTime(activity.end)}`}
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
        
        {activity.type === 'hotel' && activity.metadata && (
          <HotelDetails metadata={activity.metadata as HotelMetadata} />
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
          {metadata.flightNumberOutbound && ` • ${metadata.flightNumberOutbound}`}
        </div>
      )}
    </div>
  )
}

// Hotel-specific details
function HotelDetails({ metadata }: { metadata: HotelMetadata }) {
  return (
    <div className="space-y-2">
      {metadata.hotelName && (
        <div className="text-gray-600 dark:text-gray-400 font-medium">
          {metadata.hotelName}
        </div>
      )}
      {metadata.roomType && (
        <div className="text-gray-500 dark:text-gray-500">
          {metadata.roomType}
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

// Event-specific details
function EventDetails({ metadata }: { metadata: EventMetadata }) {
  return (
    <div className="space-y-2">
      {metadata.venue && (
        <div className="text-gray-600 dark:text-gray-400">
          📍 {metadata.venue}
        </div>
      )}
      {metadata.organizer && (
        <div className="text-gray-500 dark:text-gray-500">
          By {metadata.organizer}
        </div>
      )}
    </div>
  )
}
