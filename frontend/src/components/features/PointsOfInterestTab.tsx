'use client'

import { useState, useCallback, useMemo } from 'react'
import { MapPin, Plus, Search, X, Star, Check, Trash2 } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { searchEstablishments } from '@/lib/places-service'
import type { PlaceResult } from '@/lib/places-service'
import type { PointOfInterest } from '@/types/simple'

export function PointsOfInterestTab() {
  const { pois, addPoi, updatePoi, deletePoi, trip } = useTripContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  // Group POIs by city
  const poisByCity = useMemo(() => {
    const grouped: Record<string, PointOfInterest[]> = {}
    pois.forEach(poi => {
      if (!grouped[poi.city]) {
        grouped[poi.city] = []
      }
      grouped[poi.city].push(poi)
    })
    return grouped
  }, [pois])

  const cities = Object.keys(poisByCity).sort()

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchEstablishments(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleAddPoi = useCallback((place: PlaceResult) => {
    if (!trip) return

    const newPoi: Omit<PointOfInterest, 'id'> = {
      tripId: trip.id,
      placeId: place.placeId,
      name: place.name,
      address: place.address,
      city: place.city || 'Unknown',
      location: {
        lat: place.lat || 0,
        lng: place.lng || 0
      },
      category: place.types[0] || undefined,
      visited: false,
      favorite: false
    }

    addPoi(newPoi)
    setSearchQuery('')
    setSearchResults([])
  }, [trip, addPoi])

  const toggleFavorite = useCallback((id: string, currentFavorite: boolean) => {
    updatePoi(id, { favorite: !currentFavorite })
  }, [updatePoi])

  const toggleVisited = useCallback((id: string, currentVisited: boolean) => {
    updatePoi(id, { visited: !currentVisited })
  }, [updatePoi])

  const handleDeletePoi = useCallback((id: string) => {
    // TODO: Replace with proper modal/confirmation dialog for consistency
    if (confirm('Remove this point of interest?')) {
      deletePoi(id)
    }
  }, [deletePoi])

  return (
    <div className="flex flex-col h-full">
      {/* Search Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for places..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            {searchResults.map((place) => {
              const isAdded = pois.some(poi => poi.placeId === place.placeId)
              return (
                <button
                  key={place.placeId}
                  onClick={() => !isAdded && handleAddPoi(place)}
                  disabled={isAdded}
                  className={`w-full px-3 py-2 text-left text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                    isAdded
                      ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{place.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{place.address}</div>
                      {isAdded && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Already added</div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {isSearching && (
          <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}
      </div>

      {/* POIs List */}
      <div className="flex-1 overflow-y-auto">
        {cities.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              No points of interest yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Search for places above to add them to your trip
            </p>
          </div>
        ) : (
          <>
            {/* City Filter */}
            {cities.length > 1 && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCity(null)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCity === null
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Cities ({pois.length})
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedCity === city
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {city} ({poisByCity[city].length})
                  </button>
                ))}
              </div>
            )}

            {/* POIs by City */}
            {cities
              .filter(city => selectedCity === null || city === selectedCity)
              .map((city) => (
                <div key={city} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {city}
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {poisByCity[city].map((poi) => (
                      <div
                        key={poi.id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-pink-500" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {poi.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {poi.address}
                                </p>
                                {poi.category && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                    {poi.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => toggleFavorite(poi.id, poi.favorite || false)}
                                  className={`p-1 rounded transition-colors ${
                                    poi.favorite
                                      ? 'text-yellow-500 hover:text-yellow-600'
                                      : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500'
                                  }`}
                                  title={poi.favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                  <Star className="w-4 h-4" fill={poi.favorite ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => toggleVisited(poi.id, poi.visited || false)}
                                  className={`p-1 rounded transition-colors ${
                                    poi.visited
                                      ? 'text-green-500 hover:text-green-600'
                                      : 'text-gray-300 dark:text-gray-600 hover:text-green-500'
                                  }`}
                                  title={poi.visited ? 'Mark as not visited' : 'Mark as visited'}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePoi(poi.id)}
                                  className="p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}
