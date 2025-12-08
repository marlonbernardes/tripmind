// Simplified types for UI prototype
export interface SimpleTrip {
  id: string
  name: string
  startDate: string
  endDate: string
  color: string
  activitiesCount: number
}

// Geographic location for map display
export interface GeoLocation {
  lat: number
  lng: number
}

// Activity types
export type ActivityType = 'flight' | 'hotel' | 'event' | 'transport' | 'note' | 'task'

export interface SimpleActivity {
  id: string
  tripId: string
  type: ActivityType
  title: string
  start: string
  end?: string
  city?: string
  location?: GeoLocation
  status: 'planned' | 'booked'
  notes?: string
  metadata?: Record<string, unknown>
}

// Type-specific metadata interfaces
export interface FlightMetadata {
  from?: string
  to?: string
  flightNumberOutbound?: string
  flightNumberInbound?: string
  airline?: string
  confirmationCode?: string
}

export interface HotelMetadata {
  hotelName?: string
  hotelLink?: string
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
