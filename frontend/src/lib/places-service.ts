/**
 * Google Places Service (New)
 * 
 * Uses the new Places API (REST) for autocomplete with coordinates.
 * https://developers.google.com/maps/documentation/places/web-service/op-overview
 * 
 * Requires NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in environment variables.
 */

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  types: string[]
  lat?: number
  lng?: number
  city?: string
}

export interface CityResult {
  placeId: string
  city: string
  country: string
  fullAddress: string
  lat?: number
  lng?: number
}

export interface HotelResult {
  placeId: string
  name: string
  address: string
  city?: string
  lat?: number
  lng?: number
}

export type PlaceType = 'lodging' | 'cities' | 'establishment' | 'all'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

/**
 * Check if Google Places API key is configured
 */
export function isPlacesApiReady(): boolean {
  return !!API_KEY
}

/**
 * Search for places using Google Places API (New) Text Search
 * 
 * @param query - Search query
 * @param type - Type of place to search for
 * @returns Array of place results with coordinates
 */
export async function searchPlaces(
  query: string,
  type: PlaceType = 'all'
): Promise<PlaceResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  if (!API_KEY) {
    console.warn('Google Places API key not configured.')
    return []
  }

  try {
    const includedTypes = getIncludedTypes(type)
    
    const requestBody: Record<string, unknown> = {
      textQuery: query,
      maxResultCount: 8,
      languageCode: 'en',
    }

    // Add type filter if specified
    if (includedTypes.length > 0) {
      requestBody.includedType = includedTypes[0] // API only accepts single type
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.location',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error('Places API error:', response.status, await response.text())
      return []
    }

    const data = await response.json()
    
    if (!data.places || data.places.length === 0) {
      return []
    }

    return data.places.map((place: PlacesApiResult) => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      types: place.types || [],
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      city: extractCity(place.formattedAddress || ''),
    }))
  } catch (error) {
    console.error('Places API search error:', error)
    return []
  }
}

// Type for Places API (New) response
interface PlacesApiResult {
  id: string
  displayName?: { text: string; languageCode: string }
  formattedAddress?: string
  types?: string[]
  location?: { latitude: number; longitude: number }
}

/**
 * Get included types for Places API based on PlaceType
 */
function getIncludedTypes(type: PlaceType): string[] {
  switch (type) {
    case 'lodging':
      return ['lodging']
    case 'cities':
      return ['locality'] // Cities are localities in the new API
    case 'establishment':
      return [] // No filter, includes all establishments
    case 'all':
    default:
      return []
  }
}

/**
 * Search for hotels/lodging
 */
export async function searchHotels(query: string): Promise<HotelResult[]> {
  const places = await searchPlaces(query, 'lodging')
  
  return places.map(place => ({
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    city: extractCity(place.address),
    lat: place.lat,
    lng: place.lng,
  }))
}

/**
 * Search for cities
 */
export async function searchCities(query: string): Promise<CityResult[]> {
  const places = await searchPlaces(query, 'cities')
  
  return places.map(place => {
    const parts = place.address.split(', ')
    return {
      placeId: place.placeId,
      city: place.name,
      country: parts[parts.length - 1] || '',
      fullAddress: place.address,
      lat: place.lat,
      lng: place.lng,
    }
  })
}

/**
 * Search for any establishment (restaurants, museums, attractions, etc.)
 */
export async function searchEstablishments(query: string): Promise<PlaceResult[]> {
  return searchPlaces(query, 'all')
}

/**
 * Extract city from address string
 */
function extractCity(address: string): string | undefined {
  if (!address) return undefined
  const parts = address.split(', ')
  // Usually city is the first or second part
  return parts[0] || undefined
}
