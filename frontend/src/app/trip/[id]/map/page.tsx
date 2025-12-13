'use client'

import React from 'react'
import { TripLayout } from '@/components/features/TripLayout'
import { TripMap } from '@/components/features/TripMap'
import { TripSidePanel } from '@/components/features/TripSidePanel'
import { useTripContext } from '@/contexts/TripContext'
import { useTheme } from '@/contexts/ThemeContext'

interface MapPageProps {
  params: Promise<{
    id: string;
  }>;
}

function MapContent() {
  const { activities } = useTripContext()
  const { theme } = useTheme()

  // Check if there are any activities with locations
  const hasLocationActivities = activities.some(a => a.location || a.locationRange)

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Panel - Map (60% on desktop, full width on mobile) */}
      <div className="w-full md:w-[60%] h-[50%] md:h-full bg-gray-100 dark:bg-gray-900 border-b md:border-b-0 border-gray-200 dark:border-gray-800">
        {!hasLocationActivities ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No locations yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Add activities with locations to see them on the map.
              </p>
            </div>
          </div>
        ) : (
          // Key by theme to remount the map when theme changes (ensures correct map style)
          <TripMap key={theme} className="h-full" />
        )}
      </div>

      {/* Right Panel - Details/Recommendations/AI Chat (40% on desktop, full width on mobile) */}
      <div className="w-full md:w-[40%] h-[50%] md:h-full">
        <TripSidePanel />
      </div>
    </div>
  )
}

export default function MapPage({ params }: MapPageProps) {
  const { id: tripId } = React.use(params)
  
  return (
    <TripLayout tripId={tripId} hideSidePanel>
      <MapContent />
    </TripLayout>
  )
}
