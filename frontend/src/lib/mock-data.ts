import type { Trip, FixedTrip, Activity, FlightMetadata, StayMetadata, TripInterest } from '@/types/simple'

// Mock trips data - using new FixedTrip format
export const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Trip to Asia Jan 2026',
    dateMode: 'fixed',
    startDate: '2026-01-08',
    endDate: '2026-01-22',
    color: '#3B82F6',
    interests: ['food', 'culture', 'relaxation'] as TripInterest[],
    pacing: 'moderate'
  } as FixedTrip,
  {
    id: '2',
    name: 'European Summer',
    dateMode: 'fixed',
    startDate: '2025-06-10',
    endDate: '2025-06-25',
    color: '#10B981',
    interests: ['culture', 'photos', 'food'] as TripInterest[],
    pacing: 'packed'
  } as FixedTrip,
  {
    id: '3',
    name: 'Weekend in Paris',
    dateMode: 'fixed',
    startDate: '2025-04-05',
    endDate: '2025-04-07',
    color: '#F59E0B',
    interests: ['food', 'culture', 'photos'] as TripInterest[],
    pacing: 'packed'
  } as FixedTrip,
  {
    id: '4',
    name: 'Edge Cases Test Trip',
    dateMode: 'fixed',
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    color: '#8B5CF6',
    interests: ['adventure'] as TripInterest[],
    pacing: 'relaxed'
  } as FixedTrip
]

// Mock activities data - using new day-based format
export const mockActivities: Activity[] = [
  // Trip to Asia Jan 2026 activities (starts Jan 8)
  // Day 1: Jan 8 - Dublin to Beijing
  {
    id: 'a1',
    tripId: '1',
    type: 'flight',
    title: 'Dublin (DUB) → Beijing (PEK) - HU752, Terminal 1',
    day: 1, // Jan 8
    time: '11:00',
    endDay: 2, // Jan 9
    endTime: '05:05',
    city: 'Dublin Airport',
    location: {
      start: { lat: 53.4264, lng: -6.2499 },
      end: { lat: 39.9042, lng: 116.4074 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Dublin',
      to: 'Beijing',
      flightNumber: 'HU752',
      airline: 'Hainan Airlines'
    } as FlightMetadata
  },
  // Day 2: Jan 9 - Beijing to Bangkok to Phuket
  {
    id: 'a2',
    tripId: '1',
    type: 'flight',
    title: 'Beijing (PEK) → Bangkok (BKK) - HU429, Terminal 2',
    day: 2,
    time: '09:40',
    endDay: 2,
    endTime: '14:10',
    city: 'Beijing',
    location: {
      start: { lat: 39.9042, lng: 116.4074 },
      end: { lat: 13.7563, lng: 100.5018 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Beijing',
      to: 'Bangkok',
      flightNumber: 'HU429',
      airline: 'Hainan Airlines'
    } as FlightMetadata
  },
  {
    id: 'a3',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (BKK) → Phuket (HKT) - VZ2304',
    day: 2,
    time: '18:35',
    endDay: 2,
    endTime: '20:10',
    city: 'Bangkok',
    location: {
      start: { lat: 13.7563, lng: 100.5018 },
      end: { lat: 7.8804, lng: 98.3923 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Bangkok',
      to: 'Phuket',
      flightNumber: 'VZ2304',
      airline: 'VietJet Air'
    } as FlightMetadata
  },
  {
    id: 'a4',
    tripId: '1',
    type: 'stay',
    title: 'Bandaloo Boutique Hotel',
    day: 2,
    time: '20:30',
    endDay: 3,
    endTime: '12:00',
    city: 'Phuket',
    location: { start: { lat: 7.8804, lng: 98.3923 } },
    status: 'confirmed'
  },
  {
    id: 'a5',
    tripId: '1',
    type: 'event',
    title: 'Phuket nightlife',
    day: 2,
    time: '20:30',
    city: 'Phuket',
    location: { start: { lat: 7.8804, lng: 98.3923 } },
    status: 'draft'
  },
  // Day 3-4: Jan 10-11 - Phuket resort
  {
    id: 'a6',
    tripId: '1',
    type: 'stay',
    title: 'Outrigger Surin Beach Resort',
    day: 3,
    time: '12:00',
    endDay: 5,
    endTime: '00:00',
    city: 'Phuket',
    location: { start: { lat: 7.8804, lng: 98.3923 } },
    status: 'confirmed'
  },
  // Day 5: Jan 12 - Phuket to Bangkok
  {
    id: 'a7',
    tripId: '1',
    type: 'flight',
    title: 'Phuket (HKT) → Bangkok (BKK) - VZ309',
    day: 5,
    time: '21:25',
    endDay: 5,
    endTime: '22:55',
    city: 'Phuket',
    location: {
      start: { lat: 8.1053402, lng: 98.3005581 },
      end: { lat: 13.7563, lng: 100.5018 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Phuket',
      to: 'Bangkok',
      flightNumber: 'VZ309',
      airline: 'VietJet Air'
    } as FlightMetadata
  },
  // Day 6: Jan 13 - Bangkok to Maldives
  {
    id: 'a8',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (DMK) → Maldives (MLE) - FD175',
    day: 6,
    time: '09:15',
    endDay: 6,
    endTime: '18:30',
    city: 'Bangkok',
    location: {
      start: { lat: 13.9150135, lng: 100.6029074 },
      end: { lat: 4.1887763, lng: 73.5248302 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Bangkok',
      to: 'Maldives',
      flightNumber: 'FD175',
      airline: 'Thai AirAsia'
    } as FlightMetadata
  },
  // Day 6-10: Jan 13-17 - Maldives
  {
    id: 'a9',
    tripId: '1',
    type: 'stay',
    title: 'Maldives - Hard Rock Hotel',
    day: 6,
    time: '12:00',
    endDay: 10,
    endTime: '12:00',
    city: 'Maldives',
    location: { start: { lat: 4.1238366, lng: 73.4700359 } },
    status: 'confirmed'
  },
  // Day 10: Jan 17 - Maldives to Bangkok
  {
    id: 'a10',
    tripId: '1',
    type: 'flight',
    title: 'Maldives (MLE) → Bangkok (DMK)',
    day: 10,
    time: '12:30',
    endDay: 10,
    endTime: '20:55',
    city: 'Maldives',
    location: {
      start: { lat: 3.2028, lng: 73.2207 },
      end: { lat: 13.7563, lng: 100.5018 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Maldives',
      to: 'Bangkok',
      airline: 'Thai AirAsia'
    } as FlightMetadata
  },
  // Day 10-14: Jan 17-21 - Bangkok
  {
    id: 'a11',
    tripId: '1',
    type: 'stay',
    title: 'Bangkok - Eastin Grand Hotel Phayathai',
    day: 10,
    time: '20:00',
    endDay: 14,
    endTime: '12:00',
    city: 'Bangkok',
    location: { start: { lat: 13.7563, lng: 100.5018 } },
    status: 'confirmed'
  },
  // Day 14: Jan 21 - Bangkok to Beijing
  {
    id: 'a12',
    tripId: '1',
    type: 'flight',
    title: 'Bangkok (BKK) → Beijing (PEK) - HU430',
    day: 14,
    time: '16:20',
    endDay: 14,
    endTime: '22:00',
    city: 'Bangkok Airport',
    location: {
      start: { lat: 13.6900, lng: 100.7501 },
      end: { lat: 39.9042, lng: 116.4074 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Bangkok',
      to: 'Beijing',
      flightNumber: 'HU430',
      airline: 'Hainan Airlines'
    } as FlightMetadata
  },
  // Day 15: Jan 22 - Beijing to Dublin
  {
    id: 'a13',
    tripId: '1',
    type: 'flight',
    title: 'Beijing (PEK) → Dublin (DUB) - HU751, Terminal 2',
    day: 15,
    time: '02:40',
    endDay: 15,
    endTime: '05:50',
    city: 'Beijing',
    location: {
      start: { lat: 39.9042, lng: 116.4074 },
      end: { lat: 53.4264, lng: -6.2499 }
    },
    status: 'confirmed',
    metadata: {
      from: 'Beijing',
      to: 'Dublin',
      flightNumber: 'HU751',
      airline: 'Hainan Airlines'
    } as FlightMetadata
  },
  
  // European Summer activities (starts Jun 10)
  {
    id: 'b1',
    tripId: '2',
    type: 'flight',
    title: 'Flight to London',
    day: 1,
    time: '08:15',
    endDay: 1,
    endTime: '09:45',
    city: 'Dublin',
    location: { start: { lat: 53.4264, lng: -6.2499 } },
    status: 'confirmed'
  },
  {
    id: 'b2',
    tripId: '2',
    type: 'stay',
    title: 'The Shard Hotel',
    day: 1,
    time: '15:00',
    city: 'London',
    location: { start: { lat: 51.5055, lng: -0.0863 } },
    status: 'draft'
  },
  {
    id: 'b3',
    tripId: '2',
    type: 'event',
    title: 'British Museum',
    day: 2,
    time: '10:00',
    endDay: 2,
    endTime: '16:00',
    city: 'London',
    location: { start: { lat: 51.5226, lng: -0.1246 } },
    status: 'draft'
  },
  {
    id: 'b4',
    tripId: '2',
    type: 'transport',
    title: 'Eurostar to Paris',
    day: 6,
    time: '12:31',
    endDay: 6,
    endTime: '15:47',
    city: 'London',
    location: { start: { lat: 51.5305, lng: -0.1260 } },
    status: 'confirmed'
  },
  
  // Weekend in Paris activities (starts Apr 5)
  {
    id: 'c1',
    tripId: '3',
    type: 'flight',
    title: 'Flight to Paris',
    day: 1,
    time: '19:45',
    endDay: 1,
    endTime: '22:10',
    city: 'Dublin',
    location: { start: { lat: 53.4264, lng: -6.2499 } },
    status: 'confirmed'
  },
  {
    id: 'c2',
    tripId: '3',
    type: 'stay',
    title: 'Le Marais Boutique Hotel',
    day: 1,
    time: '15:00',
    city: 'Paris',
    location: { start: { lat: 48.8566, lng: 2.3615 } },
    status: 'draft'
  },
  {
    id: 'c3',
    tripId: '3',
    type: 'event',
    title: 'Eiffel Tower Visit',
    day: 2,
    time: '10:00',
    endDay: 2,
    endTime: '12:00',
    city: 'Paris',
    location: { start: { lat: 48.8584, lng: 2.2945 } },
    status: 'confirmed'
  },
  {
    id: 'c4',
    tripId: '3',
    type: 'event',
    title: 'Louvre Museum',
    day: 2,
    time: '14:00',
    endDay: 2,
    endTime: '17:00',
    city: 'Paris',
    location: { start: { lat: 48.8606, lng: 2.3376 } },
    status: 'confirmed'
  },
  {
    id: 'c5',
    tripId: '3',
    type: 'flight',
    title: 'Return Flight',
    day: 3,
    time: '14:20',
    endDay: 3,
    endTime: '15:55',
    city: 'Paris',
    location: { start: { lat: 49.0097, lng: 2.5479 } },
    status: 'confirmed'
  },
  
  // Edge Cases Test Trip - Various time scenarios (starts Jan 1)
  {
    id: 'd1',
    tripId: '4',
    type: 'event',
    title: 'Midnight Start (00:00)',
    day: 1,
    time: '00:00',
    endDay: 1,
    endTime: '02:00',
    city: 'Test City',
    status: 'draft'
  },
  {
    id: 'd2',
    tripId: '4',
    type: 'stay',
    title: 'Early Morning Check-in (3am-11am)',
    day: 2,
    time: '03:00',
    endDay: 2,
    endTime: '11:00',
    city: 'Test City',
    status: 'confirmed'
  },
  {
    id: 'd3',
    tripId: '4',
    type: 'event',
    title: 'Midday Event (12:00 PM)',
    day: 3,
    time: '12:00',
    endDay: 3,
    endTime: '14:30',
    city: 'Test City',
    status: 'draft'
  },
  {
    id: 'd4',
    tripId: '4',
    type: 'flight',
    title: 'Late Night Flight (11pm-2am next day)',
    day: 4,
    time: '23:00',
    endDay: 5,
    endTime: '02:00',
    city: 'Test City',
    status: 'confirmed'
  },
  {
    id: 'd5',
    tripId: '4',
    type: 'transport',
    title: 'Midnight Crossing (11:30pm-12:30am)',
    day: 5,
    time: '23:30',
    endDay: 6,
    endTime: '00:30',
    city: 'Test City',
    status: 'confirmed'
  },
  {
    id: 'd6',
    tripId: '4',
    type: 'event',
    title: 'Full Day Event (same day 00:00-23:59)',
    day: 6,
    time: '00:00',
    endDay: 6,
    endTime: '23:59',
    city: 'Test City',
    status: 'draft'
  },
  {
    id: 'd7',
    tripId: '4',
    type: 'stay',
    title: 'Multi-day Hotel (3 days)',
    day: 7,
    time: '14:00',
    endDay: 10,
    endTime: '11:00',
    city: 'Test City',
    status: 'confirmed'
  },
  {
    id: 'd8',
    tripId: '4',
    type: 'event',
    title: 'One Hour Event (9am-10am)',
    day: 8,
    time: '09:00',
    endDay: 8,
    endTime: '10:00',
    city: 'Test City',
    status: 'draft'
  },
  {
    id: 'd9',
    tripId: '4',
    type: 'event',
    title: 'End of Day Event (11:45pm-11:59pm)',
    day: 9,
    time: '23:45',
    endDay: 9,
    endTime: '23:59',
    city: 'Test City',
    status: 'draft'
  },
  {
    id: 'd10',
    tripId: '4',
    type: 'event',
    title: 'Single Moment (no end time)',
    day: 10,
    time: '15:30',
    city: 'Test City',
    status: 'draft'
  }
]

// Utility functions
export function getActivitiesForTrip(tripId: string): Activity[] {
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
