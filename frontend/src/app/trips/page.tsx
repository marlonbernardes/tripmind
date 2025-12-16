'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripCard } from '@/components/features/TripCard'
import { tripService } from '@/lib/trip-service'
import { MAX_TRIP_DURATION } from '@/lib/date-service'
import type { Trip, Activity } from '@/types/simple'

type DateMode = 'fixed' | 'flexible'

interface TripWithActivities {
  trip: Trip
  activities: Activity[]
}

export default function TripsPage() {
  const router = useRouter()
  const [tripsWithActivities, setTripsWithActivities] = useState<TripWithActivities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [dateMode, setDateMode] = useState<DateMode>('fixed')
  const [duration, setDuration] = useState(7)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [locations, setLocations] = useState<string[]>([''])
  
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

  const resetForm = () => {
    setDateMode('fixed')
    setDuration(7)
    setStartDate('')
    setEndDate('')
    setLocations([''])
  }
  
  const addLocation = () => {
    setLocations([...locations, ''])
  }
  
  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index))
  }
  
  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }
  
  // Duration label helper
  const getDurationLabel = (days: number) => {
    if (days === 1) return '1 day'
    return `${days} days`
  }

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // Generate trip name from locations
      const validLocations = locations.filter(l => l.trim())
      const tripName = validLocations.length > 0 
        ? validLocations.join(' → ')
        : 'New Trip'

      const newTrip = await tripService.createTrip({
        name: tripName,
        dateMode,
        ...(dateMode === 'fixed' 
          ? { startDate, endDate }
          : { duration }
        ),
      })

      // Close modal, reset form, and navigate to new trip
      setShowCreateModal(false)
      resetForm()
      router.push(`/trip/${newTrip.id}/timeline`)
    } catch (error) {
      console.error('Failed to create trip:', error)
    } finally {
      setIsCreating(false)
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
            <div className="flex items-center gap-3">
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
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Quick Create
              </button>
            </div>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => router.push('/plan')}
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium shadow-sm"
              >
                Plan Your First Trip
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Quick Create
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripsWithActivities.map(({ trip, activities }) => (
              <TripCard key={trip.id} trip={trip} activities={activities} />
            ))}
          </div>
        )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Create Trip
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="p-6 space-y-5">
              {/* Location(s) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Where to?
                </label>
                <div className="space-y-2">
                  {locations.map((location, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => updateLocation(index, e.target.value)}
                        placeholder="e.g., Tokyo, Paris, Rome"
                        className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                      />
                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="px-2.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLocation}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add another city
                  </button>
                </div>
              </div>
              
              {/* Date Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  When?
                </label>
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDateMode('fixed')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      dateMode === 'fixed'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Fixed Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('flexible')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      dateMode === 'flexible'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Flexible
                  </button>
                </div>
              </div>
              
              {/* Fixed Dates Fields */}
              {dateMode === 'fixed' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Start
                    </label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      End
                    </label>
                    <input 
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}
              
              {/* Flexible Dates - Duration Slider */}
              {dateMode === 'flexible' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {getDurationLabel(duration)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={MAX_TRIP_DURATION}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <span>1 day</span>
                    <span>{MAX_TRIP_DURATION} days</span>
                  </div>
                </div>
              )}
              
              {/* Info note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  You can customize everything later — add activities, change dates, and more.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  onClick={handleCreateTrip}
                  className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isCreating ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
