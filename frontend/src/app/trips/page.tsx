'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TripCard } from '@/components/features/TripCard'
import { mockTrips } from '@/lib/mock-data'

type DateType = 'specific' | 'flexible'

export default function TripsPage() {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dateType, setDateType] = useState<DateType>('specific')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [locations, setLocations] = useState<string[]>([''])
  
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
  
  // Generate next 6 months for flexible dates
  const getNextMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      months.push({
        id: `${date.getFullYear()}-${date.getMonth()}-${i}`, // Unique ID
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      })
    }
    return months
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
        
        {mockTrips.length === 0 ? (
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
          {mockTrips.map((trip) => (
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
              
              {/* Date Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Preference
                </label>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDateType('specific')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      dateType === 'specific'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Specific Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType('flexible')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      dateType === 'flexible'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Flexible Dates
                  </button>
                </div>
              </div>
              
              {/* Specific Dates Fields */}
              {dateType === 'specific' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
              
              {/* Flexible Dates Fields */}
              {dateType === 'flexible' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                      <option>Weekend (2-3 days)</option>
                      <option>1 Week</option>
                      <option>10 Days</option>
                      <option>2 Weeks</option>
                      <option>3 Weeks</option>
                      <option>1 Month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Preferred Month
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {getNextMonths().map((month) => (
                        <button
                          key={month.id}
                          type="button"
                          onClick={() => setSelectedMonth(month.value)}
                          className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                            selectedMonth === month.value
                              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
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
                  className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Create Trip
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
