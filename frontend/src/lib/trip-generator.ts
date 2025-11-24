import type { SimpleTrip, SimpleActivity, FlightMetadata, HotelMetadata, EventMetadata } from '@/types/simple'

interface TripGenerationOptions {
  destination: string
  startDate: Date
  duration: number // in days
  userPreferences: string
}

export function generateMockTrip(userInput: string): { trip: SimpleTrip, activities: SimpleActivity[] } {
  // This is a mock implementation - in the future this would be replaced with AI
  // For now, we'll generate a template trip based on common patterns
  
  const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + 30) // Start trip in 30 days
  
  // Generate a trip to Tokyo for 7 days (template)
  const trip: SimpleTrip = {
    id: tripId,
    name: 'AI Generated Tokyo Adventure',
    startDate: baseDate.toISOString().split('T')[0],
    endDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    color: '#8B5CF6',
    activitiesCount: 10
  }

  const activities: SimpleActivity[] = []

  // Day 1: Arrival
  const day1 = new Date(baseDate)
  
  // Outbound flight
  activities.push({
    id: `${tripId}_flight_outbound`,
    tripId,
    type: 'flight',
    title: 'Flight to Tokyo - TBA',
    start: new Date(day1.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours before arrival
    end: day1.toISOString(),
    city: 'Narita Airport (NRT)',
    status: 'planned',
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
    start: new Date(day1.getTime() + 1 * 60 * 60 * 1000).toISOString(),
    end: new Date(day1.getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
    city: 'Tokyo',
    status: 'planned'
  })

  // Hotel check-in
  activities.push({
    id: `${tripId}_hotel_main`,
    tripId,
    type: 'hotel',
    title: 'Tokyo Hotel - 6 nights',
    start: new Date(day1.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    end: new Date(day1.getTime() + 6 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    city: 'Shibuya',
    status: 'planned',
    metadata: {
      hotelName: 'Tokyo Central Hotel (TBD)',
      roomType: 'Standard Room'
    } as HotelMetadata
  })

  // Day 2: Sightseeing
  const day2 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
  
  activities.push({
    id: `${tripId}_event_senso_ji`,
    tripId,
    type: 'event',
    title: 'Visit Senso-ji Temple',
    start: new Date(day2.getTime() + 9 * 60 * 60 * 1000).toISOString(),
    end: new Date(day2.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    city: 'Asakusa',
    status: 'planned',
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
    start: new Date(day2.getTime() + 14 * 60 * 60 * 1000).toISOString(),
    end: new Date(day2.getTime() + 17 * 60 * 60 * 1000).toISOString(),
    city: 'Sumida',
    status: 'planned',
    metadata: {
      venue: 'Tokyo Skytree',
      ticketLink: 'https://www.tokyo-skytree.jp/en/'
    } as EventMetadata
  })

  // Day 3: Culture and food
  const day3 = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000)
  
  activities.push({
    id: `${tripId}_event_tsukiji`,
    tripId,
    type: 'event',
    title: 'Tsukiji Outer Market Food Tour',
    start: new Date(day3.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    end: new Date(day3.getTime() + 11 * 60 * 60 * 1000).toISOString(),
    city: 'Tsukiji',
    status: 'planned',
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
    start: new Date(day3.getTime() + 13 * 60 * 60 * 1000).toISOString(),
    end: new Date(day3.getTime() + 17 * 60 * 60 * 1000).toISOString(),
    city: 'Shibuya',
    status: 'planned',
    metadata: {
      venue: 'Meiji Shrine & Harajuku District'
    } as EventMetadata
  })

  // Day 7: Departure
  const day7 = new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  // Return flight
  activities.push({
    id: `${tripId}_flight_return`,
    tripId,
    type: 'flight',
    title: 'Return Flight - TBA',
    start: new Date(day7.getTime() + 14 * 60 * 60 * 1000).toISOString(),
    end: new Date(day7.getTime() + 20 * 60 * 60 * 1000).toISOString(),
    city: 'Narita Airport (NRT)',
    status: 'planned',
    metadata: {
      from: 'Tokyo',
      to: 'Home City',
      airline: 'To be booked'
    } as FlightMetadata
  })

  // Add a pre-flight task
  activities.push({
    id: `${tripId}_task_packing`,
    tripId,
    type: 'task',
    title: 'Pack luggage and check-out',
    start: new Date(day7.getTime() + 10 * 60 * 60 * 1000).toISOString(),
    end: new Date(day7.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    city: 'Shibuya',
    status: 'planned'
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
