'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripCard } from '@/components/features/TripCard'
import { tripService } from '@/lib/trip-service'
import { MAX_TRIP_DURATION } from '@/lib/date-service'
import type { Trip } from '@/types/simple'

type DateMode = 'fixed' | 'flexible'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
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
      const data = await tripService.getTrips()
      setTrips(data)
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
      // In a real app, show error toast here
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-full bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-12 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight mb-3">Your Trips</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              Plan and organize your travel adventures
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/plan')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan Your Next Trip
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
            >
              or create manually
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No trips yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first trip to start planning your adventure.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={() => router.push('/plan')}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium shadow-sm"
              >
                Plan Your First Trip
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
              >
                or create manually
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

      {/* Simple Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Trip
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-5">
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
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="px-3 py-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLocation}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  When are you traveling?
                </label>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDateMode('fixed')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input 
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
              
              {/* Flexible Dates - Duration Slider */}
              {dateMode === 'flexible' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trip Duration
                    </label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {getDurationLabel(duration)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={MAX_TRIP_DURATION}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-gray-100"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>1 day</span>
                    <span>{MAX_TRIP_DURATION} days</span>
                  </div>
                </div>
              )}
              
              {/* Note about editing later */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Don't worry! You can change any of these details later, add activities, and customize your itinerary.</span>
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  onClick={handleCreateTrip}
                  className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
