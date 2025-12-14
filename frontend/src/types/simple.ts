// ==================== TRIPS ====================

interface TripBase {
  id: string
  name: string
  color: string
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

export type ActivityType = 'flight' | 'stay' | 'event' | 'transport' | 'note' | 'task'
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
  
  // Content
  notes?: string
  
  // Type-specific metadata
  metadata?: FlightMetadata | StayMetadata | EventMetadata | TransportMetadata | NoteMetadata | TaskMetadata
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
  propertyLink?: string
  confirmationCode?: string
  roomType?: string
}

export interface EventMetadata {
  venue?: string
  ticketLink?: string
  organizer?: string
}

export interface TransportMetadata {
  from?: string
  to?: string
  vehicleType?: string
  confirmationCode?: string
}

export interface NoteMetadata {
  category?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface TaskMetadata {
  category?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}

// ==================== LEGACY TYPE MAPPINGS ====================
// These help with migration - can be removed once migration is complete

// Map old 'hotel' type to new 'stay' type
export type LegacyActivityType = 'flight' | 'hotel' | 'event' | 'transport' | 'note' | 'task'

// Map old 'planned'/'booked' status to new 'draft'/'confirmed'
export type LegacyActivityStatus = 'planned' | 'booked'

// Legacy metadata type (for reference during migration)
export interface HotelMetadata {
  hotelName?: string
  hotelLink?: string
  confirmationCode?: string
  roomType?: string
}
