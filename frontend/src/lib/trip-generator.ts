import type { Trip, FixedTrip, Activity, FlightMetadata, StayMetadata, EventMetadata, ActivityStatus } from '@/types/simple'

interface TripGenerationOptions {
  destination: string
  startDate: Date
  duration: number // in days
  userPreferences: string
}

export function generateMockTrip(userInput: string): { trip: Trip, activities: Activity[] } {
  // This is a mock implementation - in the future this would be replaced with AI
  // For now, we'll generate a template trip based on common patterns
  
  const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + 30) // Start trip in 30 days
  
  const startDate = baseDate.toISOString().split('T')[0]
  const endDate = new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // Generate a trip to Tokyo for 7 days (template)
  const trip: FixedTrip = {
    id: tripId,
    name: 'AI Generated Tokyo Adventure',
    dateMode: 'fixed',
    startDate,
    endDate,
    color: '#8B5CF6'
  }

  const activities: Activity[] = []
  const status: ActivityStatus = 'draft'

  // Day 1: Arrival
  
  // Outbound flight
  activities.push({
    id: `${tripId}_flight_outbound`,
    tripId,
    type: 'flight',
    title: 'Flight to Tokyo - TBA',
    day: 1,
    time: '10:00',
    endDay: 1,
    endTime: '18:00',
    city: 'Narita Airport (NRT)',
    status,
    metadata: {
      from: 'Home City',
      to: 'Tokyo',
      airline: 'To be booked'
    } as FlightMetadata
  })

  // Airport transfer
  activities.push({
    id: `${tripId}_transport_arrival`,
    tripId,
    type: 'transport',
    title: 'Airport Transfer to Hotel',
    day: 1,
    time: '19:00',
    endDay: 1,
    endTime: '20:30',
    city: 'Tokyo',
    status
  })

  // Hotel check-in (multi-day stay)
  activities.push({
    id: `${tripId}_stay_main`,
    tripId,
    type: 'stay',
    title: 'Tokyo Hotel - 6 nights',
    day: 1,
    time: '21:00',
    endDay: 7,
    endTime: '11:00',
    city: 'Shibuya',
    status,
    metadata: {
      propertyName: 'Tokyo Central Hotel (TBD)',
      roomType: 'Standard Room'
    } as StayMetadata
  })

  // Day 2: Sightseeing
  activities.push({
    id: `${tripId}_event_senso_ji`,
    tripId,
    type: 'event',
    title: 'Visit Senso-ji Temple',
    day: 2,
    time: '09:00',
    endDay: 2,
    endTime: '12:00',
    city: 'Asakusa',
    status,
    metadata: {
      venue: 'Senso-ji Temple',
      organizer: 'Self-guided'
    } as EventMetadata
  })

  activities.push({
    id: `${tripId}_event_tokyo_skytree`,
    tripId,
    type: 'event',
    title: 'Tokyo Skytree Observatory',
    day: 2,
    time: '14:00',
    endDay: 2,
    endTime: '17:00',
    city: 'Sumida',
    status,
    metadata: {
      venue: 'Tokyo Skytree',
      ticketLink: 'https://www.tokyo-skytree.jp/en/'
    } as EventMetadata
  })

  // Day 3: Culture and food
  activities.push({
    id: `${tripId}_event_tsukiji`,
    tripId,
    type: 'event',
    title: 'Tsukiji Outer Market Food Tour',
    day: 3,
    time: '08:00',
    endDay: 3,
    endTime: '11:00',
    city: 'Tsukiji',
    status,
    metadata: {
      venue: 'Tsukiji Outer Market',
      organizer: 'Self-guided food exploration'
    } as EventMetadata
  })

  activities.push({
    id: `${tripId}_event_meiji_shrine`,
    tripId,
    type: 'event',
    title: 'Meiji Shrine and Harajuku',
    day: 3,
    time: '13:00',
    endDay: 3,
    endTime: '17:00',
    city: 'Shibuya',
    status,
    metadata: {
      venue: 'Meiji Shrine & Harajuku District'
    } as EventMetadata
  })

  // Day 7: Departure
  
  // Add a pre-flight task
  activities.push({
    id: `${tripId}_task_packing`,
    tripId,
    type: 'task',
    title: 'Pack luggage and check-out',
    day: 7,
    time: '10:00',
    endDay: 7,
    endTime: '12:00',
    city: 'Shibuya',
    status
  })

  // Return flight
  activities.push({
    id: `${tripId}_flight_return`,
    tripId,
    type: 'flight',
    title: 'Return Flight - TBA',
    day: 7,
    time: '14:00',
    endDay: 7,
    endTime: '20:00',
    city: 'Narita Airport (NRT)',
    status,
    metadata: {
      from: 'Tokyo',
      to: 'Home City',
      airline: 'To be booked'
    } as FlightMetadata
  })

  return { trip, activities }
}

// Enhanced function that could parse user input better (for future AI integration)
export function parseUserTripRequest(userInput: string): TripGenerationOptions {
  // This is a simple mock parser - AI would do much better
  const input = userInput.toLowerCase()
  
  let destination = 'Tokyo'
  if (input.includes('paris')) destination = 'Paris'
  else if (input.includes('london')) destination = 'London'
  else if (input.includes('new york')) destination = 'New York'
  else if (input.includes('rome')) destination = 'Rome'
  
  let duration = 7 // default
  if (input.includes('3 days') || input.includes('weekend')) duration = 3
  else if (input.includes('5 days')) duration = 5
  else if (input.includes('10 days')) duration = 10
  else if (input.includes('2 weeks')) duration = 14
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 30) // Default to 30 days from now
  
  return {
    destination,
    startDate,
    duration,
    userPreferences: userInput
  }
}
