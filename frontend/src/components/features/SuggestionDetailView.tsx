'use client'

import { ExternalLink, Plus } from 'lucide-react'
import type { Suggestion, Trip, StaySuggestionContext, FlightSuggestionContext } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { getActivityLabel } from '@/lib/activity-config'
import { ActivityIcon } from '@/components/ui/activity-icon'
import { resolveDayToDate, formatSkyscannerDate, formatShortDayHeader } from '@/lib/date-service'

interface SuggestionDetailViewProps {
  suggestion: Suggestion
  trip: Trip
  onCreateActivity: () => void
}

interface BookingLink {
  name: string
  url: string
  description: string
}

/**
 * Generate booking URLs for stay suggestions
 */
function generateStayBookingUrls(context: StaySuggestionContext, trip: Trip): BookingLink[] {
  const { city, checkInDay, checkOutDay } = context
  const checkIn = resolveDayToDate(trip, checkInDay)
  const checkOut = resolveDayToDate(trip, checkOutDay)
  
  const links: BookingLink[] = [
    {
      name: 'Booking.com',
      url: checkIn && checkOut
        ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkIn}&checkout=${checkOut}`
        : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
      description: 'Hotels, apartments, and unique stays'
    },
    {
      name: 'Airbnb',
      url: checkIn && checkOut
        ? `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?checkin=${checkIn}&checkout=${checkOut}`
        : `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes`,
      description: 'Vacation rentals and experiences'
    }
  ]
  
  return links
}

/**
 * Generate booking URLs for flight suggestions
 */
function generateFlightBookingUrls(context: FlightSuggestionContext, trip: Trip): BookingLink[] {
  const { originCity, destinationCity, departureDay } = context
  const date = resolveDayToDate(trip, departureDay)
  const skyscannerDate = formatSkyscannerDate(date)
  
  const links: BookingLink[] = [
    {
      name: 'Google Flights',
      url: date
        ? `https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(originCity)}%20to%20${encodeURIComponent(destinationCity)}%20on%20${date}`
        : `https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(originCity)}%20to%20${encodeURIComponent(destinationCity)}`,
      description: 'Compare flight prices and schedules'
    },
    {
      name: 'Skyscanner',
      url: skyscannerDate
        ? `https://www.skyscanner.com/transport/flights/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destinationCity.toLowerCase())}/${skyscannerDate}/`
        : `https://www.skyscanner.com/transport/flights/?to=${encodeURIComponent(destinationCity)}`,
      description: 'Find cheap flights worldwide'
    }
  ]
  
  return links
}

/**
 * Get booking links based on suggestion type
 */
function getBookingLinks(suggestion: Suggestion, trip: Trip): BookingLink[] {
  if (suggestion.context.type === 'stay') {
    return generateStayBookingUrls(suggestion.context, trip)
  }
  
  if (suggestion.context.type === 'flight') {
    return generateFlightBookingUrls(suggestion.context, trip)
  }
  
  return []
}

export function SuggestionDetailView({ suggestion, trip, onCreateActivity }: SuggestionDetailViewProps) {
  const label = getActivityLabel(suggestion.type)
  const bookingLinks = getBookingLinks(suggestion, trip)
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          <ActivityIcon type={suggestion.type} size={20} colored />
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            {suggestion.title}
          </h3>
          {suggestion.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {suggestion.description}
            </p>
          )}
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
      </div>

      {/* Context Details */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Details
        </h4>
        {suggestion.context.type === 'stay' && (
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">City:</span> {suggestion.context.city}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">Check-in:</span>{' '}
              {isFixedTrip(trip) 
                ? formatShortDayHeader(trip, suggestion.context.checkInDay)
                : `Day ${suggestion.context.checkInDay}`}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">Check-out:</span>{' '}
              {isFixedTrip(trip)
                ? formatShortDayHeader(trip, suggestion.context.checkOutDay)
                : `Day ${suggestion.context.checkOutDay}`}
            </p>
          </div>
        )}
        {suggestion.context.type === 'flight' && (
          <div className="space-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">From:</span> {suggestion.context.originCity}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">To:</span> {suggestion.context.destinationCity}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500">Departure:</span>{' '}
              {isFixedTrip(trip)
                ? formatShortDayHeader(trip, suggestion.context.departureDay)
                : `Day ${suggestion.context.departureDay}`}
            </p>
          </div>
        )}
      </div>

      {/* Booking Links */}
      {bookingLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Search & Book
          </h4>
          <div className="space-y-2">
            {bookingLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <ActivityIcon type={suggestion.type} size={16} colored />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {link.name}
                      </h5>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Create Activity Button */}
      <div className="pt-2">
        <button
          onClick={onCreateActivity}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create {label}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Add this to your trip itinerary
        </p>
      </div>
    </div>
  )
}
