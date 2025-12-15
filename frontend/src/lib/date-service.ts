/**
 * Date Service - Centralized date handling for trips and activities
 * 
 * This service handles conversion between relative (day-based) and absolute (ISO datetime) dates.
 */

import type { Trip, FixedTrip, FlexibleTrip, Activity } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'

// Constants
export const MAX_TRIP_DURATION = 30 // Maximum trip duration in days

/**
 * Calculate the duration (in days) of a trip
 */
export function getTripDuration(trip: Trip): number {
  if (isFixedTrip(trip)) {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
  return trip.duration
}

/**
 * Get array of day numbers [1, 2, 3, ...] for a trip
 */
export function getTripDays(trip: Trip): number[] {
  const duration = getTripDuration(trip)
  return Array.from({ length: duration }, (_, i) => i + 1)
}

/**
 * For FixedTrip: convert Day X @ HH:mm → ISO datetime
 * Returns empty string if invalid
 */
export function resolveAbsoluteDateTime(trip: FixedTrip, day: number, time?: string): string {
  const startDate = new Date(trip.startDate)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + (day - 1))
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    targetDate.setHours(hours, minutes, 0, 0)
    return targetDate.toISOString()
  }
  
  return targetDate.toISOString().split('T')[0]
}

/**
 * For FixedTrip: get the date for a specific day
 */
export function getDateForDay(trip: FixedTrip, day: number): Date {
  const startDate = new Date(trip.startDate)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + (day - 1))
  return targetDate
}

/**
 * For FixedTrip: convert an absolute date to a day number
 * Returns -1 if the date is outside the trip range
 */
export function getDayFromDate(trip: FixedTrip, date: string): number {
  const startDate = new Date(trip.startDate)
  const targetDate = new Date(date.split('T')[0])
  const diffTime = targetDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const day = diffDays + 1
  
  if (day < 1 || day > getTripDuration(trip)) {
    return -1
  }
  return day
}

/**
 * Format day header for display
 * Fixed trips: "Mon, Jan 8"
 * Flexible trips: "Day 1"
 */
export function formatDayHeader(trip: Trip, day: number): string {
  if (isFixedTrip(trip)) {
    const date = getDateForDay(trip, day)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${dayName}, ${monthDay}`
  }
  return `Day ${day}`
}

/**
 * Format day header with short format
 * Fixed trips: "Jan 8"
 * Flexible trips: "Day 1"
 */
export function formatShortDayHeader(trip: Trip, day: number): string {
  if (isFixedTrip(trip)) {
    const date = getDateForDay(trip, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return `Day ${day}`
}

/**
 * Format day of week
 * Fixed trips: "Mon", "Tue", etc.
 * Flexible trips: empty string
 */
export function formatDayOfWeek(trip: Trip, day: number): string {
  if (isFixedTrip(trip)) {
    const date = getDateForDay(trip, day)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return ''
}

/**
 * Get computed datetime range for an activity
 */
export interface ActivityDateRange {
  start: string      // ISO datetime for fixed, "Day X HH:mm" for flexible
  end?: string
  isRelative: boolean
}

export function getActivityDateRange(trip: Trip, activity: Activity): ActivityDateRange {
  if (isFixedTrip(trip)) {
    const startDateTime = resolveAbsoluteDateTime(trip, activity.day, activity.time)
    let endDateTime: string | undefined
    
    if (activity.endDay !== undefined || activity.endTime) {
      const endDay = activity.endDay ?? activity.day
      endDateTime = resolveAbsoluteDateTime(trip, endDay, activity.endTime)
    }
    
    return {
      start: startDateTime,
      end: endDateTime,
      isRelative: false
    }
  }
  
  // Flexible trip - return relative format
  const startStr = activity.time 
    ? `Day ${activity.day} ${activity.time}` 
    : `Day ${activity.day}`
  
  let endStr: string | undefined
  if (activity.endDay !== undefined || activity.endTime) {
    const endDay = activity.endDay ?? activity.day
    endStr = activity.endTime 
      ? `Day ${endDay} ${activity.endTime}` 
      : `Day ${endDay}`
  }
  
  return {
    start: startStr,
    end: endStr,
    isRelative: true
  }
}

/**
 * Compare two activities for sorting by their timing
 * Returns negative if a comes before b, positive if after, 0 if same
 */
export function compareActivities(a: Activity, b: Activity): number {
  // First compare by day
  if (a.day !== b.day) {
    return a.day - b.day
  }
  
  // Then compare by time
  const aTime = a.time ?? '00:00'
  const bTime = b.time ?? '00:00'
  return aTime.localeCompare(bTime)
}

/**
 * Check if a day number is valid for a trip
 */
export function isValidDay(trip: Trip, day: number): boolean {
  return day >= 1 && day <= getTripDuration(trip)
}

/**
 * Format activity time for display
 */
export function formatActivityTime(activity: Activity): string {
  if (activity.allDay) {
    return 'All day'
  }
  return activity.time ?? ''
}

/**
 * Resolve a day number to an ISO date string (YYYY-MM-DD) for fixed trips.
 * Returns empty string for flexible trips.
 */
export function resolveDayToDate(trip: Trip, day: number): string {
  if (!isFixedTrip(trip)) {
    return '' // Flexible trips don't have fixed dates
  }
  
  const startDate = new Date(trip.startDate)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + (day - 1))
  
  return targetDate.toISOString().split('T')[0]
}

/**
 * Format date for Skyscanner URL (YYMMDD)
 */
export function formatSkyscannerDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${year.slice(2)}${month}${day}`
}

/**
 * Format activity date range for display
 * Shows start time, and end if different day or specified
 */
export function formatActivityDateDisplay(trip: Trip, activity: Activity): string {
  if (activity.allDay) {
    if (activity.endDay && activity.endDay !== activity.day) {
      return `${formatShortDayHeader(trip, activity.day)} - ${formatShortDayHeader(trip, activity.endDay)}`
    }
    return formatShortDayHeader(trip, activity.day)
  }
  
  const startTime = activity.time ?? ''
  const endTime = activity.endTime ?? ''
  
  if (activity.endDay && activity.endDay !== activity.day) {
    // Multi-day with times
    return `${formatShortDayHeader(trip, activity.day)} ${startTime} - ${formatShortDayHeader(trip, activity.endDay)} ${endTime}`
  }
  
  if (endTime && endTime !== startTime) {
    // Same day with time range
    return `${startTime} - ${endTime}`
  }
  
  return startTime
}
