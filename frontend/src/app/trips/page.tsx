'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripCard } from '@/components/features/TripCard'
import { tripService } from '@/lib/trip-service'
import type { Trip, Activity } from '@/types/simple'

interface TripWithActivities {
  trip: Trip
  activities: Activity[]
}

export default function TripsPage() {
  const router = useRouter()
  const [tripsWithActivities, setTripsWithActivities] = useState<TripWithActivities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Load trips on mount
  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    setIsLoading(true)
    try {
      const trips = await tripService.getTrips()
      
      // Fetch activities for each trip
      const tripsData = await Promise.all(
        trips.map(async (trip) => {
          const activities = await tripService.getActivities(trip.id)
          return { trip, activities }
        })
      )
      
      setTripsWithActivities(tripsData)
    } catch (error) {
      console.error('Failed to load trips:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await tripService.deleteTrip(tripId)
      // Remove from local state
      setTripsWithActivities(prev => prev.filter(t => t.trip.id !== tripId))
    } catch (error) {
      console.error('Failed to delete trip:', error)
    }
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header - only show when there are trips */}
        {!isLoading && tripsWithActivities.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Your Trips
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {tripsWithActivities.length} {tripsWithActivities.length === 1 ? 'trip' : 'trips'}
              </p>
            </div>
            <button 
            onClick={() => router.push('/plan')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Plan New Trip</span>
            <span className="sm:hidden">New Trip</span>
          </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading trips...</p>
          </div>
        ) : tripsWithActivities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-4xl">🗺️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No trips yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Start planning your next adventure. Create your first trip to organize your itinerary.
            </p>
            <button 
              onClick={() => router.push('/plan')}
              className="w-full sm:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium shadow-sm"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripsWithActivities.map(({ trip, activities }) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                activities={activities} 
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
