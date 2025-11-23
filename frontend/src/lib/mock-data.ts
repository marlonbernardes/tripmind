import type { SimpleTrip, SimpleActivity } from '@/types/simple'

// Mock trips data
export const mockTrips: SimpleTrip[] = [
  {
    id: '1',
    name: 'Trip to Asia Jan 2026',
    startDate: '2026-01-08',
    endDate: '2026-01-22',
    color: '#3B82F6',
    activitiesCount: 11
  },
  {
    id: '2',
    name: 'European Summer',
    startDate: '2025-06-10',
    endDate: '2025-06-25',
    color: '#10B981',
    activitiesCount: 12
  },
  {
    id: '3',
    name: 'Weekend in Paris',
    startDate: '2025-04-05',
    endDate: '2025-04-07',
    color: '#F59E0B',
    activitiesCount: 5
  }
]

// Mock activities data
export const mockActivities: SimpleActivity[] = [
  // Trip to Asia Jan 2026 activities
  {
    id: 'a1',
    tripId: '1',
    type: 'flight',
    title: 'Dublin (DUB) → Beijing (PEK) - HU752, Terminal 1',
    start: '2026-01-08T11:00:00',
    end: '2026-01-09T05:05:00',
    city: 'Dublin Airport (DUB)'
  },
  {
    id: 'a2',
    tripId: '1',
    type: 'flight',
    title: 'Beijing (PEK) → Bangkok (BKK) - HU429, Terminal 2',
    start: '2026-01-09T09:40:00',
    end: '2026-01-09T14:10:00',
    city: 'Bangkok'
  },
  {
    id: 'a3',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (BKK) → Phuket (HKT) - VZ2304',
    start: '2026-01-09T17:30:00',
    end: '2026-01-09T19:00:00',
    city: 'Bangkok'
  },
  {
    id: 'a4',
    tripId: '1',
    type: 'hotel',
    title: 'Bandaloo Boutique Hotel',
    start: '2026-01-09T20:30:00',
    end: '2026-01-10T12:00:00',
    city: 'Phuket'
  },
  {
    id: 'a5',
    tripId: '1',
    type: 'event',
    title: 'Phuket nightlife',
    start: '2026-01-09T20:30:00',
    city: 'Phuket'
  },
  {
    id: 'a6',
    tripId: '1',
    type: 'hotel',
    title: 'Phuket resort - All inclusive (3 days)',
    start: '2026-01-10T12:00:00',
    end: '2026-01-12T21:00:00',
    city: 'Phuket'
  },
  {
    id: 'a7',
    tripId: '1',
    type: 'flight',
    title: 'Phuket (HKT) → Bangkok (BKK) - VZ309',
    start: '2026-01-12T21:25:00',
    end: '2026-01-12T22:55:00',
    city: 'Phuket'
  },
  {
    id: 'a8',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (DMK) → Maldives (MLE) - FD175',
    start: '2026-01-13T09:15:00',
    end: '2026-01-13T11:30:00',
    city: 'Bangkok'
  },
  {
    id: 'a9',
    tripId: '1',
    type: 'hotel',
    title: 'Maldives resort - Paradise vacation (4 days)',
    start: '2026-01-13T12:00:00',
    end: '2026-01-17T12:00:00',
    city: 'Maldives'
  },
  {
    id: 'a10',
    tripId: '1',
    type: 'flight',
    title: 'Maldives (MLE) → Bangkok (DMK)',
    start: '2026-01-17T12:30:00',
    end: '2026-01-17T18:55:00',
    city: 'Maldives'
  },
  {
    id: 'a11',
    tripId: '1',
    type: 'hotel',
    title: 'Bangkok city hotel & exploration (4 days)',
    start: '2026-01-17T20:00:00',
    end: '2026-01-21T16:00:00',
    city: 'Bangkok'
  },
  {
    id: 'a12',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (BKK) → Beijing (PEK) - HU430',
    start: '2026-01-21T16:20:00',
    end: '2026-01-21T22:00:00',
    city: 'Suvarnabhumi Airport (BKK)'
  },
  {
    id: 'a13',
    tripId: '1',
    type: 'flight',
    title: 'Beijing (PEK) → Dublin (DUB) - HU751, Terminal 2',
    start: '2026-01-22T02:40:00',
    end: '2026-01-22T05:50:00',
    city: 'Beijing'
  },
  
  // European Summer activities
  {
    id: 'b1',
    tripId: '2',
    type: 'flight',
    title: 'Flight to London',
    start: '2025-06-10T08:15:00',
    end: '2025-06-10T09:45:00'
  },
  {
    id: 'b2',
    tripId: '2',
    type: 'hotel',
    title: 'The Shard Hotel',
    start: '2025-06-10T15:00:00',
    city: 'London Bridge'
  },
  {
    id: 'b3',
    tripId: '2',
    type: 'event',
    title: 'British Museum',
    start: '2025-06-11T10:00:00',
    end: '2025-06-11T16:00:00',
    city: 'Bloomsbury'
  },
  {
    id: 'b4',
    tripId: '2',
    type: 'transport',
    title: 'Eurostar to Paris',
    start: '2025-06-15T12:31:00',
    end: '2025-06-15T15:47:00'
  },
  
  // Weekend in Paris activities
  {
    id: 'c1',
    tripId: '3',
    type: 'flight',
    title: 'Flight to Paris',
    start: '2025-04-05T19:45:00',
    end: '2025-04-05T22:10:00'
  },
  {
    id: 'c2',
    tripId: '3',
    type: 'hotel',
    title: 'Le Marais Boutique Hotel',
    start: '2025-04-05T15:00:00',
    city: 'Le Marais'
  },
  {
    id: 'c3',
    tripId: '3',
    type: 'event',
    title: 'Eiffel Tower Visit',
    start: '2025-04-06T10:00:00',
    end: '2025-04-06T12:00:00',
    city: 'Champ de Mars'
  },
  {
    id: 'c4',
    tripId: '3',
    type: 'event',
    title: 'Louvre Museum',
    start: '2025-04-06T14:00:00',
    end: '2025-04-06T17:00:00',
    city: '1st Arrondissement'
  },
  {
    id: 'c5',
    tripId: '3',
    type: 'flight',
    title: 'Return Flight',
    start: '2025-04-07T14:20:00',
    end: '2025-04-07T15:55:00'
  }
]

// Utility functions
export function getActivitiesForTrip(tripId: string): SimpleActivity[] {
  return mockActivities.filter(activity => activity.tripId === tripId)
}

// Helper function to extract date from datetime string
export function getDateFromDateTime(datetime: string): string {
  return datetime.split('T')[0]
}

// Helper function to format time from datetime string
export function getTimeFromDateTime(datetime: string): string {
  const time = datetime.split('T')[1]
  return time ? time.substring(0, 5) : ''
}

// Helper function to format datetime for display
export function formatDateTime(datetime: string): string {
  const date = new Date(datetime)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric'
  }
  
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`
  }
  
  if (start.getMonth() !== end.getMonth()) {
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.getDate()}, ${end.getFullYear()}`
}

export function getDaysCount(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}
