'use client'

import { ExternalLink, Plane, Building2, Calendar, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SimpleActivity } from '@/types/simple'
import { getDateFromDateTime } from '@/lib/mock-data'

interface RecommendationsSectionProps {
  activity: {
    type: SimpleActivity['type']
    status: 'planned' | 'booked'
    city?: string
    start: string
    end?: string
  }
}

interface BookingLink {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const generateBookingUrls = (
  type: SimpleActivity['type'],
  city?: string,
  startDate?: string,
  endDate?: string
): BookingLink[] => {
  const start = startDate ? getDateFromDateTime(startDate) : ''
  const end = endDate ? getDateFromDateTime(endDate) : ''
  const cityParam = city ? encodeURIComponent(city) : ''

  switch (type) {
    case 'flight':
      return [
        {
          name: 'Google Flights',
          url: `https://flights.google.com/search?q=${cityParam}&date=${start}`,
          icon: Plane,
          description: 'Compare flight prices and schedules'
        },
        {
          name: 'Skyscanner',
          url: `https://skyscanner.com/transport/flights/?to=${cityParam}&outbounddate=${start}`,
          icon: Plane,
          description: 'Find cheap flights worldwide'
        }
      ]
    
    case 'hotel':
      return [
        {
          name: 'Booking.com',
          url: `https://booking.com/search?city=${cityParam}&checkin=${start}&checkout=${end || start}`,
          icon: Building2,
          description: 'Hotels, apartments, and unique stays'
        },
        {
          name: 'Airbnb',
          url: `https://airbnb.com/s/${cityParam}/homes?checkin=${start}&checkout=${end || start}`,
          icon: Building2,
          description: 'Vacation rentals and experiences'
        }
      ]
    
    case 'transport':
      return [
        {
          name: 'Rome2rio',
          url: `https://rome2rio.com/search/${cityParam}`,
          icon: Car,
          description: 'Compare transport options'
        },
        {
          name: 'Omio',
          url: `https://omio.com/search?destination=${cityParam}&departure_date=${start}`,
          icon: Car,
          description: 'Trains, buses, and flights'
        }
      ]
    
    case 'event':
      return [
        {
          name: 'Eventbrite',
          url: `https://eventbrite.com/d/${cityParam}/events--${start}`,
          icon: Calendar,
          description: 'Find events and activities'
        },
        {
          name: 'TripAdvisor',
          url: `https://tripadvisor.com/Search?q=${cityParam}&searchSessionId=events`,
          icon: Calendar,
          description: 'Tours, attractions, and experiences'
        }
      ]
    
    default:
      return []
  }
}

export function RecommendationsSection({ activity }: RecommendationsSectionProps) {
  // Don't show recommendations for booked activities
  if (activity.status === 'booked') {
    return null
  }

  const bookingLinks = generateBookingUrls(
    activity.type,
    activity.city,
    activity.start,
    activity.end
  )

  // Don't render if no booking links are available
  if (bookingLinks.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Booking Recommendations
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Book this activity to remove these suggestions
        </p>
      </div>
      
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
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <link.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
      
      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">💡</span>
          <span>
            Tip: These links include your dates and location. Mark as "Booked" once you've completed your reservation.
          </span>
        </p>
      </div>
    </div>
  )
}
