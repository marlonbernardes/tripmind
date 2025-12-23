/**
 * Google Places Service
 * 
 * Provides autocomplete functionality for places using Google Places API.
 * Supports filtering by type: lodging (hotels), cities, or general places.
 * 
 * TODO: Add Google Places API key to environment variables:
 * NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
 */

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => GoogleAutocompleteService
          PlacesService: new (div: HTMLDivElement) => GooglePlacesService
          PlacesServiceStatus: {
            OK: string
          }
        }
      }
    }
  }
}

// Simplified types for Google Places API
interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: AutocompletionRequest,
    callback: (predictions: AutocompletePrediction[] | null, status: string) => void
  ) => void
}

interface GooglePlacesService {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (place: unknown, status: string) => void
  ) => void
}

interface AutocompletionRequest {
  input: string
  types?: string[]
  locationBias?: {
    center: { lat: number; lng: number }
    radius: number
  }
}

interface AutocompletePrediction {
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text?: string
  }
  types?: string[]
}

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  types: string[]
}

export interface CityResult {
  placeId: string
  city: string
  country: string
  fullAddress: string
}

export interface HotelResult {
  placeId: string
  name: string
  address: string
  city?: string
}

export type PlaceType = 'lodging' | 'cities' | 'establishment' | 'all'

// Check if Google Places API is available
let autocompleteService: GoogleAutocompleteService | null = null

function getAutocompleteService(): GoogleAutocompleteService | null {
  if (typeof window === 'undefined') return null
  if (!window.google?.maps?.places) return null
  
  if (!autocompleteService) {
    autocompleteService = new window.google.maps.places.AutocompleteService()
  }
  return autocompleteService
}

/**
 * Check if Google Places API is loaded and ready
 */
export function isPlacesApiReady(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps?.places
}

/**
 * Get the type restrictions for Google Places API based on PlaceType
 */
function getTypeRestrictions(type: PlaceType): string[] | undefined {
  switch (type) {
    case 'lodging':
      return ['lodging']
    case 'cities':
      return ['(cities)']
    case 'establishment':
      return ['establishment']
    case 'all':
    default:
      return undefined // No restriction
  }
}

/**
 * Search for places using Google Places Autocomplete
 * 
 * @param query - Search query
 * @param type - Type of place to search for
 * @param location - Optional location to bias results
 * @returns Array of place results
 */
export async function searchPlaces(
  query: string,
  type: PlaceType = 'all',
  location?: { lat: number; lng: number }
): Promise<PlaceResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const service = getAutocompleteService()
  
  if (!service) {
    console.warn('Google Places API not loaded. Using mock data.')
    return searchPlacesMock(query, type)
  }

  return new Promise((resolve) => {
    const request: AutocompletionRequest = {
      input: query,
      types: getTypeRestrictions(type),
    }

    // Add location bias if provided
    if (location) {
      request.locationBias = {
        center: location,
        radius: 50000, // 50km radius
      }
    }

    service.getPlacePredictions(request, (predictions, status) => {
      if (status !== window.google?.maps?.places?.PlacesServiceStatus?.OK || !predictions) {
        resolve([])
        return
      }

      const results: PlaceResult[] = predictions.slice(0, 8).map(prediction => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text || '',
        types: prediction.types || [],
      }))

      resolve(results)
    })
  })
}

/**
 * Search for hotels/lodging
 */
export async function searchHotels(
  query: string,
  location?: { lat: number; lng: number }
): Promise<HotelResult[]> {
  const places = await searchPlaces(query, 'lodging', location)
  
  return places.map(place => ({
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    city: extractCity(place.address),
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
      fullAddress: `${place.name}, ${place.address}`,
    }
  })
}

/**
 * Search for any establishment (restaurants, museums, attractions, etc.)
 */
export async function searchEstablishments(
  query: string,
  location?: { lat: number; lng: number }
): Promise<PlaceResult[]> {
  return searchPlaces(query, 'all', location)
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

// ==================== MOCK DATA ====================
// Used when Google Places API is not available

const MOCK_HOTELS: HotelResult[] = [
  { placeId: 'mock-1', name: 'The Grand Hotel', address: '123 Main St, Dublin, Ireland', city: 'Dublin' },
  { placeId: 'mock-2', name: 'Park Hyatt', address: '456 Park Ave, Tokyo, Japan', city: 'Tokyo' },
  { placeId: 'mock-3', name: 'The Ritz', address: '789 Bond St, London, UK', city: 'London' },
  { placeId: 'mock-4', name: 'Four Seasons', address: '321 Beach Rd, Bali, Indonesia', city: 'Bali' },
  { placeId: 'mock-5', name: 'Marriott Downtown', address: '555 City Center, New York, USA', city: 'New York' },
]

const MOCK_CITIES: CityResult[] = [
  { placeId: 'city-1', city: 'Dublin', country: 'Ireland', fullAddress: 'Dublin, Ireland' },
  { placeId: 'city-2', city: 'London', country: 'United Kingdom', fullAddress: 'London, United Kingdom' },
  { placeId: 'city-3', city: 'Paris', country: 'France', fullAddress: 'Paris, France' },
  { placeId: 'city-4', city: 'Tokyo', country: 'Japan', fullAddress: 'Tokyo, Japan' },
  { placeId: 'city-5', city: 'New York', country: 'United States', fullAddress: 'New York, NY, USA' },
  { placeId: 'city-6', city: 'Barcelona', country: 'Spain', fullAddress: 'Barcelona, Spain' },
  { placeId: 'city-7', city: 'Rome', country: 'Italy', fullAddress: 'Rome, Italy' },
  { placeId: 'city-8', city: 'Amsterdam', country: 'Netherlands', fullAddress: 'Amsterdam, Netherlands' },
  { placeId: 'city-9', city: 'Berlin', country: 'Germany', fullAddress: 'Berlin, Germany' },
  { placeId: 'city-10', city: 'Sydney', country: 'Australia', fullAddress: 'Sydney, Australia' },
  { placeId: 'city-11', city: 'Dubai', country: 'United Arab Emirates', fullAddress: 'Dubai, UAE' },
  { placeId: 'city-12', city: 'Singapore', country: 'Singapore', fullAddress: 'Singapore' },
  { placeId: 'city-13', city: 'Bangkok', country: 'Thailand', fullAddress: 'Bangkok, Thailand' },
  { placeId: 'city-14', city: 'Lisbon', country: 'Portugal', fullAddress: 'Lisbon, Portugal' },
  { placeId: 'city-15', city: 'Prague', country: 'Czech Republic', fullAddress: 'Prague, Czech Republic' },
]

const MOCK_PLACES: PlaceResult[] = [
  { placeId: 'place-1', name: 'The Louvre', address: 'Paris, France', types: ['museum'] },
  { placeId: 'place-2', name: 'Central Park', address: 'New York, USA', types: ['park'] },
  { placeId: 'place-3', name: 'Eiffel Tower', address: 'Paris, France', types: ['tourist_attraction'] },
  { placeId: 'place-4', name: 'Nobu Restaurant', address: 'London, UK', types: ['restaurant'] },
  { placeId: 'place-5', name: 'British Museum', address: 'London, UK', types: ['museum'] },
]

/**
 * Mock search function when Google Places API is not available
 */
function searchPlacesMock(query: string, type: PlaceType): PlaceResult[] {
  const normalizedQuery = query.toLowerCase()
  
  if (type === 'lodging') {
    return MOCK_HOTELS
      .filter(h => 
        h.name.toLowerCase().includes(normalizedQuery) ||
        h.city?.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(h => ({
        placeId: h.placeId,
        name: h.name,
        address: h.address,
        types: ['lodging'],
      }))
  }
  
  if (type === 'cities') {
    return MOCK_CITIES
      .filter(c => 
        c.city.toLowerCase().includes(normalizedQuery) ||
        c.country.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 8)
      .map(c => ({
        placeId: c.placeId,
        name: c.city,
        address: c.country,
        types: ['locality'],
      }))
  }
  
  // Generic places
  return MOCK_PLACES
    .filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.address.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 5)
}

// ==================== GOOGLE MAPS SCRIPT LOADER ====================

let scriptLoadPromise: Promise<void> | null = null

/**
 * Load Google Maps Places API script
 * Call this on app initialization if you need Places API
 */
export function loadGooglePlacesScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  
  if (!apiKey) {
    console.warn('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY not set. Places autocomplete will use mock data.')
    return Promise.resolve()
  }
  
  if (isPlacesApiReady()) {
    return Promise.resolve()
  }
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
  
  return scriptLoadPromise
}
