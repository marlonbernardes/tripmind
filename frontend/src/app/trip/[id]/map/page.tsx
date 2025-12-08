'use client'

import React from 'react'
import { TripLayout } from '@/components/features/TripLayout'
import { TripMap } from '@/components/features/TripMap'
import { useTripContext } from '@/contexts/TripContext'

interface MapPageProps {
  params: Promise<{
    id: string;
  }>;
}

function MapContent() {
  const { activities } = useTripContext()

  if (activities.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start planning your trip by adding activities with locations to see them on the map.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <TripMap />
    </div>
  )
}

export default function MapPage({ params }: MapPageProps) {
  const { id: tripId } = React.use(params)
  
  return (
    <TripLayout tripId={tripId}>
      <MapContent />
    </TripLayout>
  )
}
