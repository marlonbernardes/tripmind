import type { Trip, Activity } from '@/types/simple'
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
