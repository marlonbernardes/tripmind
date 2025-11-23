'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Trip {
  id: string
  name: string
  color: string
}

interface TripHeaderProps {
  trip: Trip
  activityCount: number
}

const tripViews = [
  { id: 'timeline', label: 'Timeline', path: 'timeline' },
  { id: 'overview', label: 'Overview', path: 'overview' },
  { id: 'map', label: 'Map', path: 'map' }
]

export function TripHeader({ trip, activityCount }: TripHeaderProps) {
  const pathname = usePathname()
  
  // Extract current view from pathname
  const currentView = tripViews.find(view => pathname.includes(`/${view.path}`))?.id || 'timeline'
  
  return (
    <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {trip.name}
            </h1>
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: trip.color }}
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tripViews.find(view => view.id === currentView)?.label || 'Timeline'} View • {activityCount} activities
          </p>
        </div>
        
        {/* Trip Sub-Navigation */}
        <nav className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tripViews.map((view) => {
            const isActive = currentView === view.id
            return (
              <Link
                key={view.id}
                href={`/trip/${trip.id}/${view.path}`}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-all',
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
  )
}
