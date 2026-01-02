// ==================== TRIPS ====================

// Interest categories for trip personalization
export type TripInterest = 'food' | 'culture' | 'adventure' | 'nightlife' | 'shopping' | 'relaxation' | 'photos' | 'nature'

// Pacing controls how packed the agenda should be
export type TripPacing = 'relaxed' | 'moderate' | 'packed'

interface TripBase {
  id: string
  name: string
  color: string
  interests: TripInterest[]  // Selected interest categories
  pacing: TripPacing         // Controls suggestion density
}

// Fixed trip - has concrete dates
export interface FixedTrip extends TripBase {
  dateMode: 'fixed'
  startDate: string  // ISO date: '2026-01-08'
  endDate: string
}

// Flexible trip - duration. Might be extended in the future with months/years/seasons
// (see commented section below)
export interface FlexibleTrip extends TripBase {
  dateMode: 'flexible'
  duration: number   // Number of days
  // period?: {
  //  month: number
  // }
}

// Union type for all trips
export type Trip = FixedTrip | FlexibleTrip

// Type guard
export function isFixedTrip(trip: Trip): trip is FixedTrip {
  return trip.dateMode === 'fixed'
}

export function isFlexibleTrip(trip: Trip): trip is FlexibleTrip {
  return trip.dateMode === 'flexible'
}

// Legacy alias for backward compatibility during migration
export type SimpleTrip = Trip

// ==================== LOCATIONS ====================

export interface GeoLocation {
  lat: number
  lng: number
}

// Unified location structure - end is optional for single-point activities
export interface ActivityLocation {
  start: GeoLocation
  end?: GeoLocation  // Only for flights/transport with different arrival
}

// ==================== ACTIVITIES ====================

export type ActivityType = 'flight' | 'stay' | 'event' | 'transport'
export type ActivityStatus = 'draft' | 'confirmed'

export interface Activity {
  id: string
  tripId: string
  type: ActivityType
  title: string
  status: ActivityStatus
  
  // Relative timing (always stored)
  day: number           // 1-based: Day 1, Day 2, etc.
  time?: string         // 'HH:mm' format, e.g., '09:00'
  endDay?: number       // For multi-day activities
  endTime?: string      // 'HH:mm' format
  allDay?: boolean      // If true, time fields are ignored
  
  // Location (optional)
  location?: ActivityLocation
  city?: string
  address?: string  // Full address string
  
  // Type-specific metadata
  metadata?: FlightMetadata | StayMetadata | EventMetadata | TransportMetadata
}

// Legacy alias for backward compatibility during migration
export type SimpleActivity = Activity

// ==================== METADATA TYPES ====================

export interface FlightMetadata {
  from?: string
  to?: string
  flightNumber?: string
  airline?: string
  confirmationCode?: string
}

export interface StayMetadata {
  propertyName?: string
  confirmationCode?: string
}

export interface EventMetadata {
  placeName?: string  // Name of venue/place
}

export interface TransportMetadata {
  from?: string
  to?: string
  fromAddress?: string
  toAddress?: string
  vehicleType?: string
  confirmationCode?: string
}


// ==================== ACTIVITY CONTEXT ====================

/**
 * Context passed when creating a new activity to pre-populate form fields.
 * Used when creating activities from suggestions or with contextual awareness.
 */
export interface ActivityContext {
  day?: number              // Day to pre-select
  city?: string             // For stays/events - pre-populate city field
  fromCity?: string         // For flights/transport - pre-populate origin
  toCity?: string           // For flights/transport - pre-populate destination
  checkOutDay?: number      // For stays - pre-populate check-out day
  preselectedType?: ActivityType  // Skip type selection and go straight to form
}

// ==================== SUGGESTIONS ====================

export type SuggestionType = 'flight' | 'stay'

// Context for stay/hotel suggestions
export interface StaySuggestionContext {
  type: 'stay'
  city: string           // "Tokyo", "Paris" - for booking site URLs
  checkInDay: number     // Day number (1-based)
  checkOutDay: number    // Day number (1-based)
}

// Context for flight suggestions
export interface FlightSuggestionContext {
  type: 'flight'
  originCity: string         // "Paris"
  destinationCity: string    // "Tokyo"
  departureDay: number       // Day number (1-based)
  // Optional airport codes (backend can enrich these)
  originAirport?: string     // "CDG"
  destinationAirport?: string // "NRT"
}

export type SuggestionContext = StaySuggestionContext | FlightSuggestionContext

export interface Suggestion {
  id: string
  tripId: string
  type: SuggestionType
  title: string              // "Add accommodation" or "Add a flight"
  description?: string       // "No hotel for nights 3-4" or "Travel from Paris to Tokyo"
  day: number                // Where to show in timeline (1-based)
  dismissed: boolean         // User chose to hide this
  
  // Type-specific context for booking links
  context: SuggestionContext
}

// ==================== POINTS OF INTEREST ====================

/**
 * Point of Interest - places to visit during a trip.
 * Stored separately from activities as they don't have specific dates/times.
 * Sourced from Google Places API.
 */
export interface PointOfInterest {
  id: string
  tripId: string
  placeId: string          // Google Places ID
  name: string
  address: string
  city: string
  location: GeoLocation
  category?: string        // e.g., 'restaurant', 'museum', 'park'
  notes?: string           // User's personal notes about this place
  visited?: boolean        // Has the user visited this place
  favorite?: boolean       // User marked as favorite
}

// ==================== SIDE PANEL STATE ====================

/**
 * Represents the current mode of the side panel.
 * Simplified: always edit mode, no read-only view.
 */
export type SidePanelMode = 'empty' | 'editing' | 'creating' | 'suggestion'

/**
 * Represents the current state of the side panel.
 * Uses a discriminated union to ensure only one mode is active at a time.
 */
export type SidePanelState =
  | { mode: 'empty' }
  | { mode: 'editing'; activity: Activity }
  | { mode: 'creating'; context?: ActivityContext }
  | { mode: 'suggestion'; suggestion: Suggestion }

// ==================== LEGACY TYPE MAPPINGS ====================
// These help with migration - can be removed once migration is complete

// Map old 'hotel' type to new 'stay' type
export type LegacyActivityType = 'flight' | 'hotel' | 'event' | 'transport'

// Map old 'planned'/'booked' status to new 'draft'/'confirmed'
export type LegacyActivityStatus = 'planned' | 'booked'

// Legacy metadata type (for reference during migration)
export interface HotelMetadata {
  hotelName?: string
  hotelLink?: string
  confirmationCode?: string
  roomType?: string
}
