import type { SimpleTrip, SimpleActivity } from '@/types/simple'

// Mock trips data
export const mockTrips: SimpleTrip[] = [
  {
    id: '1',
    name: 'Tokyo Adventure',
    startDate: '2025-03-15',
    endDate: '2025-03-22',
    color: '#3B82F6',
    activitiesCount: 8
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
  // Tokyo Adventure activities
  {
    id: 'a1',
    tripId: '1',
    type: 'flight',
    title: 'Flight to Tokyo',
    startTime: '14:30',
    endTime: '18:45+1',
    date: '2025-03-15'
  },
  {
    id: 'a2',
    tripId: '1',
    type: 'hotel',
    title: 'Park Hyatt Tokyo',
    startTime: '15:00',
    city: 'Shinjuku',
    date: '2025-03-16'
  },
  {
    id: 'a3',
    tripId: '1',
    type: 'event',
    title: 'Tsukiji Fish Market',
    startTime: '06:00',
    endTime: '09:00',
    city: 'Tsukiji',
    date: '2025-03-17'
  },
  {
    id: 'a4',
    tripId: '1',
    type: 'transport',
    title: 'Train to Kyoto',
    startTime: '10:30',
    endTime: '13:15',
    date: '2025-03-18'
  },
  {
    id: 'a5',
    tripId: '1',
    type: 'event',
    title: 'Fushimi Inari Shrine',
    startTime: '09:00',
    endTime: '12:00',
    city: 'Kyoto',
    date: '2025-03-19'
  },
  {
    id: 'a6',
    tripId: '1',
    type: 'note',
    title: 'Try authentic ramen',
    startTime: '19:00',
    city: 'Shibuya',
    date: '2025-03-20'
  },
  {
    id: 'a7',
    tripId: '1',
    type: 'task',
    title: 'Buy omiyage souvenirs',
    startTime: '14:00',
    city: 'Harajuku',
    date: '2025-03-21'
  },
  {
    id: 'a8',
    tripId: '1',
    type: 'flight',
    title: 'Return Flight',
    startTime: '11:20',
    endTime: '15:30',
    date: '2025-03-22'
  },
  
  // European Summer activities
  {
    id: 'b1',
    tripId: '2',
    type: 'flight',
    title: 'Flight to London',
    startTime: '08:15',
    endTime: '09:45',
    date: '2025-06-10'
  },
  {
    id: 'b2',
    tripId: '2',
    type: 'hotel',
    title: 'The Shard Hotel',
    startTime: '15:00',
    city: 'London Bridge',
    date: '2025-06-10'
  },
  {
    id: 'b3',
    tripId: '2',
    type: 'event',
    title: 'British Museum',
    startTime: '10:00',
    endTime: '16:00',
    city: 'Bloomsbury',
    date: '2025-06-11'
  },
  {
    id: 'b4',
    tripId: '2',
    type: 'transport',
    title: 'Eurostar to Paris',
    startTime: '12:31',
    endTime: '15:47',
    date: '2025-06-15'
  },
  
  // Weekend in Paris activities
  {
    id: 'c1',
    tripId: '3',
    type: 'flight',
    title: 'Flight to Paris',
    startTime: '19:45',
    endTime: '22:10',
    date: '2025-04-05'
  },
  {
    id: 'c2',
    tripId: '3',
    type: 'hotel',
    title: 'Le Marais Boutique Hotel',
    startTime: '15:00',
    city: 'Le Marais',
    date: '2025-04-05'
  },
  {
    id: 'c3',
    tripId: '3',
    type: 'event',
    title: 'Eiffel Tower Visit',
    startTime: '10:00',
    endTime: '12:00',
    city: 'Champ de Mars',
    date: '2025-04-06'
  },
  {
    id: 'c4',
    tripId: '3',
    type: 'event',
    title: 'Louvre Museum',
    startTime: '14:00',
    endTime: '17:00',
    city: '1st Arrondissement',
    date: '2025-04-06'
  },
  {
    id: 'c5',
    tripId: '3',
    type: 'flight',
    title: 'Return Flight',
    startTime: '14:20',
    endTime: '15:55',
    date: '2025-04-07'
  }
]

// Utility functions
export function getActivitiesForTrip(tripId: string): SimpleActivity[] {
  return mockActivities.filter(activity => activity.tripId === tripId)
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
