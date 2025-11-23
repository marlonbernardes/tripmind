// Simplified types for UI prototype
export interface SimpleTrip {
  id: string
  name: string
  startDate: string
  endDate: string
  color: string
  activitiesCount: number
}

export interface SimpleActivity {
  id: string
  tripId: string
  type: 'flight' | 'hotel' | 'event' | 'transport' | 'note' | 'task'
  title: string
  start: string
  end?: string
  city?: string
}
