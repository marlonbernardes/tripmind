/**
 * Suggestion Service
 * 
 * Generates trip suggestions based on activities.
 * Currently generates suggestions locally in the frontend.
 * Designed to be easily replaced with backend API calls in the future.
 */

import type { Trip, Activity, Suggestion, StaySuggestionContext, FlightSuggestionContext } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { getTripDuration, formatShortDayHeader } from './date-service'

// In-memory store for dismissed suggestions (session-only for MVP)
const dismissedSuggestionIds = new Set<string>()

/**
 * Get suggestions for a trip.
 * Currently computed locally, will be replaced with API call in the future.
 */
export async function getSuggestions(
  tripId: string,
  trip: Trip,
  activities: Activity[]
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = []
  
  // Generate missing stay suggestions
  suggestions.push(...generateMissingStaySuggestions(tripId, trip, activities))
  
  // Generate missing flight suggestions
  suggestions.push(...generateMissingFlightSuggestions(tripId, trip, activities))
  
  // Filter out dismissed suggestions
  return suggestions.filter(s => !dismissedSuggestionIds.has(s.id))
}

/**
 * Dismiss a suggestion (hide it from the user).
 * Currently stores in memory, will be replaced with API call in the future.
 */
export async function dismissSuggestion(suggestionId: string): Promise<void> {
  dismissedSuggestionIds.add(suggestionId)
}

/**
 * Clear all dismissed suggestions (useful for testing or reset).
 */
export function clearDismissedSuggestions(): void {
  dismissedSuggestionIds.clear()
}

// ==================== STAY SUGGESTIONS ====================

/**
 * Generate suggestions for missing hotel/stay bookings.
 * 
 * Logic:
 * 1. For each night of the trip (night N = between Day N and Day N+1)
 * 2. Check if any 'stay' activity spans that night
 * 3. Check if any flight "covers" that night (overnight flight or early morning departure)
 * 4. Group consecutive missing nights into single suggestions, but break when city changes
 */
function generateMissingStaySuggestions(
  tripId: string,
  trip: Trip,
  activities: Activity[]
): Suggestion[] {
  const duration = getTripDuration(trip)
  const suggestions: Suggestion[] = []
  
  // Don't need accommodation for the last night (trip ends)
  const totalNights = duration - 1
  if (totalNights <= 0) return suggestions
  
  // Find which nights are covered by stay activities
  const coveredNights = new Set<number>()
  const stayActivities = activities.filter(a => a.type === 'stay')
  
  for (const stay of stayActivities) {
    const startDay = stay.day
    const endDay = stay.endDay || stay.day
    
    // A stay from day X to day Y covers nights X, X+1, ..., Y-1
    // (sleeping in the hotel from night X until checkout on day Y)
    for (let night = startDay; night < endDay; night++) {
      coveredNights.add(night)
    }
  }
  
  // Also check flights that "cover" nights:
  // 1. Overnight flights (endDay > day) cover the departure night
  // 2. Early morning flights (before 06:00) mean you're at the airport overnight
  const flightActivities = activities.filter(a => a.type === 'flight' || a.type === 'transport')
  
  for (const flight of flightActivities) {
    const departureDay = flight.day
    const arrivalDay = flight.endDay || flight.day
    const departureTime = flight.time || '12:00'
    
    // Overnight flight: covers the departure night (you're on the plane)
    if (arrivalDay > departureDay) {
      coveredNights.add(departureDay)
    }
    
    // Early morning flight (before 06:00): covers previous night 
    // (you're at the airport or traveling to it)
    if (departureTime < '06:00' && departureDay > 1) {
      coveredNights.add(departureDay - 1)
    }
  }
  
  // Build a map of cities for each night based on where flights arrive
  // This helps us detect when the user changes cities
  const cityAtNight = buildCityMap(activities, totalNights)
  
  // Find missing nights and group consecutive ones, but break when city changes
  let missingStart: number | null = null
  let missingEnd: number | null = null
  let currentCity: string | null = null
  
  for (let night = 1; night <= totalNights; night++) {
    if (!coveredNights.has(night)) {
      // This night is missing accommodation
      const nightCity = cityAtNight.get(night) || getDefaultCity(activities)
      
      if (missingStart === null) {
        // Starting a new gap
        missingStart = night
        missingEnd = night
        currentCity = nightCity
      } else if (currentCity && nightCity !== currentCity) {
        // City changed - create suggestion for previous gap and start new one
        suggestions.push(createStaySuggestion(tripId, trip, missingStart, missingEnd!, currentCity))
        missingStart = night
        missingEnd = night
        currentCity = nightCity
      } else {
        // Same city, extend the gap
        missingEnd = night
      }
    } else {
      // Night is covered - if we had a gap, create suggestion
      if (missingStart !== null && missingEnd !== null && currentCity) {
        suggestions.push(createStaySuggestion(tripId, trip, missingStart, missingEnd, currentCity))
        missingStart = null
        missingEnd = null
        currentCity = null
      }
    }
  }
  
  // Handle trailing missing nights
  if (missingStart !== null && missingEnd !== null && currentCity) {
    suggestions.push(createStaySuggestion(tripId, trip, missingStart, missingEnd, currentCity))
  }
  
  return suggestions
}

/**
 * Build a map of which city the user is in for each night.
 * 
 * Uses flight arrivals to determine city transitions:
 * - When a flight arrives on day N, the destination city applies from night N onwards
 * - If multiple flights arrive on the same day, use the LAST one (final destination)
 * - Until another flight arrival changes the city
 */
function buildCityMap(activities: Activity[], totalNights: number): Map<number, string> {
  const cityMap = new Map<number, string>()
  
  // Get all transport activities with arrival info, sorted by day then by arrival time
  const transports = activities
    .filter(a => a.type === 'flight' || a.type === 'transport')
    .map(a => ({
      arrivalDay: a.endDay || a.day,
      arrivalTime: a.endTime || a.time || '12:00',
      destinationCity: (a.metadata as { to?: string } | undefined)?.to || null
    }))
    .filter(t => t.destinationCity !== null)
    .sort((a, b) => {
      // Sort by day first, then by time (later arrivals come last)
      if (a.arrivalDay !== b.arrivalDay) return a.arrivalDay - b.arrivalDay
      return a.arrivalTime.localeCompare(b.arrivalTime)
    })
  
  // Also get cities from non-transport activities as fallback
  const activityCities = activities
    .filter(a => a.type !== 'flight' && a.type !== 'transport' && a.city)
    .map(a => ({
      day: a.day,
      city: a.city!
    }))
    .sort((a, b) => a.day - b.day)
  
  // Build a map of the LAST arriving transport for each day
  // This represents where the user ends up at the end of that day
  const lastTransportPerDay = new Map<number, string>()
  for (const t of transports) {
    // Since transports are sorted by time, later ones will overwrite earlier ones
    lastTransportPerDay.set(t.arrivalDay, t.destinationCity!)
  }
  
  // Build the city timeline
  let currentCity: string | null = null
  
  for (let night = 1; night <= totalNights; night++) {
    // Check if any transport arrives on this day - use the LAST one
    if (lastTransportPerDay.has(night)) {
      currentCity = lastTransportPerDay.get(night)!
    }
    
    // If no city yet, try to find from activities on this day
    if (!currentCity) {
      const activityOnDay = activityCities.find(a => a.day === night || a.day === night + 1)
      if (activityOnDay) {
        currentCity = activityOnDay.city
      }
    }
    
    if (currentCity) {
      cityMap.set(night, currentCity)
    }
  }
  
  // Forward fill: use previous city if current is unknown
  let lastKnownCity: string | null = null
  for (let night = 1; night <= totalNights; night++) {
    if (cityMap.has(night)) {
      lastKnownCity = cityMap.get(night)!
    } else if (lastKnownCity) {
      cityMap.set(night, lastKnownCity)
    }
  }
  
  return cityMap
}

function createStaySuggestion(
  tripId: string,
  trip: Trip,
  startNight: number,
  endNight: number,
  city: string
): Suggestion {
  // Format night label based on trip type
  let nightLabel: string
  const nightCount = endNight - startNight + 1
  
  if (isFixedTrip(trip)) {
    // For fixed trips, show actual dates
    const startDate = formatShortDayHeader(trip, startNight)
    if (nightCount === 1) {
      nightLabel = startDate
    } else {
      const endDate = formatShortDayHeader(trip, endNight)
      nightLabel = `${startDate} - ${endDate}`
    }
  } else {
    // For flexible trips, show night numbers
    nightLabel = nightCount === 1 
      ? `night ${startNight}` 
      : `nights ${startNight}-${endNight}`
  }
  
  const context: StaySuggestionContext = {
    type: 'stay',
    city,
    checkInDay: startNight,
    checkOutDay: endNight + 1
  }
  
  return {
    id: `stay-${tripId}-${startNight}-${endNight}`,
    tripId,
    type: 'stay',
    title: 'Add accommodation',
    description: `No hotel for ${nightLabel}`,
    day: startNight,
    dismissed: false,
    context
  }
}

// ==================== FLIGHT SUGGESTIONS ====================

/**
 * Generate suggestions for missing flights between cities.
 * 
 * Logic:
 * 1. Group activities by city
 * 2. Find city transitions (activities in City A followed by City B)
 * 3. Check if there's a flight/transport between them
 */
function generateMissingFlightSuggestions(
  tripId: string,
  trip: Trip,
  activities: Activity[]
): Suggestion[] {
  const suggestions: Suggestion[] = []
  
  // Sort activities by day and time
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day
    if (!a.time && !b.time) return 0
    if (!a.time) return 1
    if (!b.time) return -1
    return a.time.localeCompare(b.time)
  })
  
  // Find city transitions
  let lastCity: string | null = null
  let lastCityDay = 0
  
  for (const activity of sortedActivities) {
    // Skip transport activities (they are the connection, not the destination)
    if (activity.type === 'flight' || activity.type === 'transport') {
      // A flight/transport activity resets the city tracking
      // The destination becomes the new "last city"
      const metadata = activity.metadata as { to?: string } | undefined
      if (metadata?.to) {
        lastCity = metadata.to
        lastCityDay = activity.endDay || activity.day
      }
      continue
    }
    
    const currentCity = activity.city
    if (!currentCity) continue
    
    // Check if we've moved to a different city
    if (lastCity && currentCity !== lastCity) {
      // Check if there's already a flight/transport between lastCityDay and this activity
      const hasTransport = sortedActivities.some(a => 
        (a.type === 'flight' || a.type === 'transport') &&
        a.day >= lastCityDay &&
        a.day <= activity.day
      )
      
      if (!hasTransport) {
        const context: FlightSuggestionContext = {
          type: 'flight',
          originCity: lastCity,
          destinationCity: currentCity,
          departureDay: activity.day > 1 ? activity.day - 1 : 1
        }
        
        suggestions.push({
          id: `flight-${tripId}-${lastCity}-${currentCity}-${activity.day}`,
          tripId,
          type: 'flight',
          title: 'Add a flight',
          description: `Travel from ${lastCity} to ${currentCity}`,
          day: context.departureDay,
          dismissed: false,
          context
        })
      }
    }
    
    lastCity = currentCity
    lastCityDay = activity.endDay || activity.day
  }
  
  return suggestions
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get the city where the user will be spending the night on a specific day.
 * 
 * Priority:
 * 1. Check for flights/transport arriving on this day - use destination city
 * 2. Fall back to activities on this day - use their city
 */
function getCityForDay(activities: Activity[], day: number): string | null {
  // First, check for flights/transport arriving on this day
  // These indicate where the user will be after traveling
  const arrivingTransport = activities.find(a => 
    (a.type === 'flight' || a.type === 'transport') &&
    (a.endDay || a.day) === day
  )
  
  if (arrivingTransport) {
    // Try to get the destination city from metadata
    const metadata = arrivingTransport.metadata as { to?: string } | undefined
    if (metadata?.to) {
      return metadata.to
    }
  }
  
  // Fall back to activities on this day
  const dayActivities = activities.filter(a => 
    a.day === day || (a.day <= day && (a.endDay || a.day) >= day)
  )
  
  for (const activity of dayActivities) {
    if (activity.city) return activity.city
  }
  
  return null
}

/**
 * Get a default city from any activity in the trip.
 */
function getDefaultCity(activities: Activity[]): string {
  for (const activity of activities) {
    if (activity.city) return activity.city
  }
  return 'your destination'
}

// ==================== SUGGESTION SERVICE OBJECT ====================

/**
 * Suggestion service object for easier mocking and future API replacement.
 */
export const suggestionService = {
  getSuggestions,
  dismissSuggestion,
  clearDismissedSuggestions
}
