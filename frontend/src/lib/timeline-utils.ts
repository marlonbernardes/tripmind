import type { SimpleActivity } from '@/types/simple'
import { getDateFromDateTime } from './mock-data'

export interface ExpandedActivity extends SimpleActivity {
  /** The specific date this row represents (for multi-day activities) */
  displayDate: string
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
 * @returns Array of expanded activities, sorted by displayDate then start time
 */
export function expandActivitiesToDays(activities: SimpleActivity[]): ExpandedActivity[] {
  const expanded: ExpandedActivity[] = []
  
  activities.forEach(activity => {
    const startDate = new Date(getDateFromDateTime(activity.start))
    
    if (activity.end) {
      const endDate = new Date(getDateFromDateTime(activity.end))
      const currentDate = new Date(startDate)
      let dayNumber = 1
      
      // Calculate total days
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      // Create an entry for each day
      while (currentDate <= endDate) {
        expanded.push({
          ...activity,
          displayDate: currentDate.toISOString().split('T')[0],
          dayNumber,
          totalDays
        })
        currentDate.setDate(currentDate.getDate() + 1)
        dayNumber++
      }
    } else {
      // Single-day activity
      expanded.push({
        ...activity,
        displayDate: getDateFromDateTime(activity.start)
      })
    }
  })
  
  // Sort by displayDate, then by start time
  return expanded.sort((a, b) => {
    const dateCompare = a.displayDate.localeCompare(b.displayDate)
    if (dateCompare !== 0) return dateCompare
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

/**
 * Groups activities by date, expanding multi-day activities to appear in each day.
 * 
 * @param activities - Array of activities to group
 * @returns Object with date keys and arrays of activities
 */
export function groupActivitiesByDate(activities: SimpleActivity[]): Record<string, SimpleActivity[]> {
  const grouped: Record<string, SimpleActivity[]> = {}
  
  activities.forEach(activity => {
    const startDate = new Date(getDateFromDateTime(activity.start))
    
    if (activity.end) {
      // Multi-day activity: add to all days it spans
      const endDate = new Date(getDateFromDateTime(activity.end))
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0]
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(activity)
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      // Single day activity: add only to start date
      const dateKey = getDateFromDateTime(activity.start)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(activity)
    }
  })
  
  return grouped
}

/**
 * Format date for display in short format
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format day of week (3 letters)
 */
export function formatDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}
