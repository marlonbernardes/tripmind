/**
 * Suggestion Service
 * 
 * Generates trip suggestions based on activities.
 * Currently generates suggestions locally in the frontend.
 * Designed to be easily replaced with backend API calls in the future.
 */

import type { Trip, Activity, Suggestion, StaySuggestionContext, FlightSuggestionContext } from '@/types/simple'
import { getTripDuration } from './date-service'

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
 * 3. Group consecutive missing nights into single suggestions
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
  
  // Find missing nights and group consecutive ones
  let missingStart: number | null = null
  let missingEnd: number | null = null
  let lastCity = getDefaultCity(activities)
  
  for (let night = 1; night <= totalNights; night++) {
    if (!coveredNights.has(night)) {
      // This night is missing accommodation
      if (missingStart === null) {
        missingStart = night
        // Try to find city from activities on this day
        lastCity = getCityForDay(activities, night) || lastCity
      }
      missingEnd = night
    } else {
      // Night is covered - if we had a gap, create suggestion
      if (missingStart !== null && missingEnd !== null) {
        suggestions.push(createStaySuggestion(tripId, missingStart, missingEnd, lastCity))
        missingStart = null
        missingEnd = null
      }
    }
  }
  
  // Handle trailing missing nights
  if (missingStart !== null && missingEnd !== null) {
    suggestions.push(createStaySuggestion(tripId, missingStart, missingEnd, lastCity))
  }
  
  return suggestions
}

function createStaySuggestion(
  tripId: string,
  startNight: number,
  endNight: number,
  city: string
): Suggestion {
  const nightCount = endNight - startNight + 1
  const nightLabel = nightCount === 1 
    ? `night ${startNight}` 
    : `nights ${startNight}-${endNight}`
  
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
 * Get the city for activities on a specific day.
 */
function getCityForDay(activities: Activity[], day: number): string | null {
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
