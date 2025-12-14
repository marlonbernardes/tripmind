'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { TripProvider, useTripContext } from '@/contexts/TripContext'
import { TripHeader } from './TripHeader'
import { tripService } from '@/lib/trip-service'

interface TripLayoutProps {
  children: ReactNode
  tripId: string
  hideSidePanel?: boolean
}

function TripLayoutContent({ children, tripId }: { children: ReactNode; tripId: string }) {
  const { trip, setTrip, activities, setActivities } = useTripContext()
  const [isLoading, setIsLoading] = useState(true)

  // Load trip and activities data from service
  useEffect(() => {
    async function loadTripData() {
      setIsLoading(true)
      try {
        const [tripData, activitiesData] = await Promise.all([
          tripService.getTrip(tripId),
          tripService.getActivities(tripId)
        ])
        
        if (tripData) {
          setTrip(tripData)
          setActivities(activitiesData)
        } else {
          setTrip(null)
          setActivities([])
        }
      } catch (error) {
        console.error('Failed to load trip:', error)
        setTrip(null)
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTripData()
  }, [tripId, setTrip, setActivities])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Trip not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            The trip you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            href="/trips"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-full bg-white dark:bg-gray-950">
      {/* Trip Header with Sub-Navigation - auto height */}
      <TripHeader trip={trip} activityCount={activities.length} />

      {/* Content Area - fills remaining space (1fr) */}
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function TripLayout({ children, tripId, hideSidePanel = false }: TripLayoutProps) {
  return (
    <TripProvider>
      <TripLayoutContent tripId={tripId}>
        {children}
      </TripLayoutContent>
    </TripProvider>
  )
}
