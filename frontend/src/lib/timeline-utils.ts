import type { Trip, Activity, Suggestion, ActivityType } from '@/types/simple'
import { compareActivities, formatShortDayHeader, formatDayOfWeek, getTripDuration } from './date-service'

export interface ExpandedActivity extends Activity {
  /** The specific day this row represents (for multi-day activities) */
  displayDay: number
  /** Day number within a multi-day activity (1-based), undefined for single-day */
  dayNumber?: number
  /** Total days for a multi-day activity, undefined for single-day */
  totalDays?: number
}

/**
 * Expands multi-day activities into individual day entries.
 * Single-day activities remain as-is.
 * 
 * @param activities - Array of activities to expand
 * @returns Array of expanded activities, sorted by displayDay then time
 */
export function expandActivitiesToDays(activities: Activity[]): ExpandedActivity[] {
  const expanded: ExpandedActivity[] = []
  
  activities.forEach(activity => {
    const startDay = activity.day
    const endDay = activity.endDay ?? activity.day
    
    if (endDay > startDay) {
      // Multi-day activity
      const totalDays = endDay - startDay + 1
      
      for (let currentDay = startDay; currentDay <= endDay; currentDay++) {
        expanded.push({
          ...activity,
          displayDay: currentDay,
          dayNumber: currentDay - startDay + 1,
          totalDays
        })
      }
    } else {
      // Single-day activity
      expanded.push({
        ...activity,
        displayDay: startDay
      })
    }
  })
  
  // Sort by displayDay, then by original activity start (day + time), then by activity ID
  // This keeps multi-day activities together and ordered by when they originally started
  return expanded.sort((a, b) => {
    // Primary: sort by display day
    if (a.displayDay !== b.displayDay) {
      return a.displayDay - b.displayDay
    }
    
    // Secondary: sort by original activity start day
    if (a.day !== b.day) {
      return a.day - b.day
    }
    
    // Tertiary: sort by original start time
    const aTime = a.time ?? '00:00'
    const bTime = b.time ?? '00:00'
    if (aTime !== bTime) {
      return aTime.localeCompare(bTime)
    }
    
    // Quaternary: keep same activity's days together (by ID)
    return a.id.localeCompare(b.id)
  })
}

/**
 * Groups activities by day, expanding multi-day activities to appear in each day.
 * 
 * @param activities - Array of activities to group
 * @returns Object with day number keys and arrays of activities
 */
export function groupActivitiesByDay(activities: Activity[]): Record<number, Activity[]> {
  const grouped: Record<number, Activity[]> = {}
  
  activities.forEach(activity => {
    const startDay = activity.day
    const endDay = activity.endDay ?? activity.day
    
    for (let currentDay = startDay; currentDay <= endDay; currentDay++) {
      if (!grouped[currentDay]) {
        grouped[currentDay] = []
      }
      grouped[currentDay].push(activity)
    }
  })
  
  // Sort activities within each day
  Object.keys(grouped).forEach(day => {
    grouped[Number(day)].sort(compareActivities)
  })
  
  return grouped
}

/**
 * Get all days that should be displayed for a trip
 * Includes all days from 1 to trip duration
 */
export function getAllTripDays(trip: Trip): number[] {
  const duration = getTripDuration(trip)
  return Array.from({ length: duration }, (_, i) => i + 1)
}

/**
 * Format day header for display (delegates to date-service)
 */
export function formatShortDate(trip: Trip, day: number): string {
  return formatShortDayHeader(trip, day)
}

/**
 * Format day of week (delegates to date-service)
 */
export function getDayOfWeek(trip: Trip, day: number): string {
  return formatDayOfWeek(trip, day)
}

// ==================== SUGGESTION GROUPING ====================

/**
 * Groups suggestions by their day property.
 * 
 * @param suggestions - Array of suggestions to group
 * @returns Object with day number keys and arrays of suggestions
 */
export function groupSuggestionsByDay(suggestions: Suggestion[]): Record<number, Suggestion[]> {
  const grouped: Record<number, Suggestion[]> = {}
  
  suggestions.forEach(suggestion => {
    const day = suggestion.day
    if (!grouped[day]) {
      grouped[day] = []
    }
    grouped[day].push(suggestion)
  })
  
  return grouped
}

/**
 * Maps a suggestion's context type to the corresponding activity type.
 * This is used to determine which type section a suggestion belongs to.
 * 
 * @param suggestion - The suggestion to get the activity type for
 * @returns The corresponding activity type
 */
export function getSuggestionActivityType(suggestion: Suggestion): ActivityType {
  const contextType = suggestion.context?.type
  
  switch (contextType) {
    case 'stay':
      return 'stay'
    case 'flight':
      return 'flight'
    default:
      // Default to 'event' for unknown types
      return 'event'
  }
}

/**
 * Groups suggestions by their mapped activity type.
 * Uses the suggestion's context.type to determine the activity type.
 * 
 * @param suggestions - Array of suggestions to group
 * @returns Object with activity type keys and arrays of suggestions
 */
export function groupSuggestionsByActivityType(suggestions: Suggestion[]): Record<ActivityType, Suggestion[]> {
  const grouped: Record<ActivityType, Suggestion[]> = {
    flight: [],
    stay: [],
    event: [],
    transport: [],
  }
  
  suggestions.forEach(suggestion => {
    const activityType = getSuggestionActivityType(suggestion)
    grouped[activityType].push(suggestion)
  })
  
  return grouped
}

/**
 * Sort suggestions by day for chronological display.
 * 
 * @param suggestions - Array of suggestions to sort
 * @returns New sorted array of suggestions
 */
export function sortSuggestionsByDay(suggestions: Suggestion[]): Suggestion[] {
  return [...suggestions].sort((a, b) => a.day - b.day)
}

// ==================== MERGED TIMELINE ITEMS ====================

/**
 * A timeline item that can be either an activity or a suggestion.
 * Used for the flat "All" view where items are interleaved by day.
 */
export type TimelineItem = 
  | { type: 'activity'; item: ExpandedActivity }
  | { type: 'suggestion'; item: Suggestion }

/**
 * Merges expanded activities and suggestions into a single sorted list.
 * Items are sorted by day, with suggestions appearing first within each day.
 * 
 * @param activities - Array of expanded activities
 * @param suggestions - Array of suggestions
 * @returns Merged and sorted array of timeline items
 */
export function mergeActivitiesAndSuggestions(
  activities: ExpandedActivity[],
  suggestions: Suggestion[]
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...activities.map(a => ({ type: 'activity' as const, item: a })),
    ...suggestions.map(s => ({ type: 'suggestion' as const, item: s }))
  ]
  
  // Sort by day, then suggestions before activities within the same day
  items.sort((a, b) => {
    const dayA = a.type === 'activity' ? a.item.displayDay : a.item.day
    const dayB = b.type === 'activity' ? b.item.displayDay : b.item.day
    
    if (dayA !== dayB) return dayA - dayB
    
    // Same day: suggestions first
    if (a.type === 'suggestion' && b.type === 'activity') return -1
    if (a.type === 'activity' && b.type === 'suggestion') return 1
    
    // Both activities: sort by time
    if (a.type === 'activity' && b.type === 'activity') {
      const timeA = a.item.time ?? '00:00'
      const timeB = b.item.time ?? '00:00'
      return timeA.localeCompare(timeB)
    }
    
    return 0
  })
  
  return items
}
