'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types/simple'
import { isFixedTrip, isFlexibleTrip } from '@/types/simple'
import { TripEditModal } from './TripEditModal'

interface TripHeaderProps {
  trip: Trip
  activityCount: number
  /** Callback to open the Preferences tab in the side panel */
  onOpenPreferences?: () => void
}

/**
 * Format trip dates for display
 * Fixed trips: "Jan 8 – Jan 15, 2026" or "Jan 8 – 15, 2026" (same month)
 * Flexible trips: "8 days"
 */
function formatTripDates(trip: Trip): string {
  if (isFlexibleTrip(trip)) {
    const days = trip.duration
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  
  if (isFixedTrip(trip)) {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    const year = end.getFullYear()
    
    // Same month: "Jan 8 – 15, 2026"
    if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`
    }
    
    // Different months: "Jan 8 – Feb 15, 2026"
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
  }
  
  return ''
}

const tripViews = [
  { id: 'timeline', label: 'Timeline', path: 'timeline' },
  { id: 'map', label: 'Map', path: 'map' }
]

export function TripHeader({ trip, activityCount, onOpenPreferences }: TripHeaderProps) {
  const pathname = usePathname()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Extract current view from pathname
  const currentView = tripViews.find(view => pathname.includes(`/${view.path}`))?.id || 'timeline'
  
  // Format dates for display
  const dateDisplay = formatTripDates(trip)
  
  return (
    <>
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full max-w-full overflow-hidden">
        {/* Mobile Layout - 2 rows */}
        <div className="md:hidden">
          {/* Row 1: Trip Name and Dates */}
          <div className="flex items-center justify-center gap-2 px-3 py-2">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: trip.color }}
            />
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
              {trip.name}
            </h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              •  {dateDisplay}
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Edit trip name and color"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          
          {/* Row 2: Full-width Navigation */}
          <nav className="flex w-full bg-gray-100 dark:bg-gray-800">
            {tripViews.map((view) => {
              const isActive = currentView === view.id
              return (
                <Link
                  key={view.id}
                  href={`/trip/${trip.id}/${view.path}`}
                  className={cn(
                    'flex-1 text-center py-2 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {view.label}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Desktop Layout - Single row */}
        <div className="hidden md:block px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: trip.color }}
              />
              <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {trip.name}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                •  {dateDisplay}
              </span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Edit trip name and color"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Trip Sub-Navigation */}
            <nav className="flex flex-shrink-0 gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
              {tripViews.map((view) => {
                const isActive = currentView === view.id
                return (
                  <Link
                    key={view.id}
                    href={`/trip/${trip.id}/${view.path}`}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {view.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Trip Modal */}
      <TripEditModal
        trip={trip}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onOpenPreferences={onOpenPreferences}
      />
    </>
  )
}
