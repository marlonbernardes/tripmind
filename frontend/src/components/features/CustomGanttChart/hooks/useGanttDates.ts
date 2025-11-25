import { useMemo } from 'react'
import { min, max, subDays, addDays, startOfDay, startOfMonth, addMonths } from 'date-fns'
import type { SimpleActivity } from '@/types/simple'
import type { ViewModeConfig, GanttDates } from '../types'

export function useGanttDates(
  activities: SimpleActivity[],
  viewModeConfig: ViewModeConfig
): GanttDates {
  return useMemo(() => {
    if (activities.length === 0) {
      // Return default range for empty state
      const now = new Date()
      const columns: Date[] = []
      return {
        ganttStart: startOfDay(now),
        ganttEnd: addDays(startOfDay(now), 7),
        columns,
        firstColumnDate: startOfDay(now)
      }
    }

    // Special handling for Month view
    if (viewModeConfig.name === 'Month') {
      // Find earliest and latest dates
      const dates = activities.flatMap(a => [
        new Date(a.start),
        a.end ? new Date(a.end) : new Date(a.start)
      ])
      
      const earliest = min(dates)
      const latest = max(dates)
      
      // Start at the beginning of the earliest month
      const ganttStart = startOfMonth(earliest)
      
      // End at the beginning of the month after the latest + 11 months (total 12 months)
      const ganttEnd = addMonths(startOfMonth(latest), 12)
      
      // Generate exactly 12 month columns
      const columns: Date[] = []
      let current = startOfMonth(earliest)
      for (let i = 0; i < 12; i++) {
        columns.push(current)
        current = addMonths(current, 1)
      }
      
      return { 
        ganttStart, 
        ganttEnd, 
        columns,
        firstColumnDate: columns[0]
      }
    }

    // For Hour and Day views - existing logic
    // Find earliest and latest dates
    const dates = activities.flatMap(a => [
      new Date(a.start),
      a.end ? new Date(a.end) : new Date(a.start)
    ])
    
    const earliest = min(dates)
    const latest = max(dates)
    
    // Start 1 day before earliest (requirement)
    let ganttStart = subDays(startOfDay(earliest), 1)
    
    // Ensure we never start before the 25th of a month (to have buffer before month end) 
    // (so that in Month view we have enough space to show the month properly)
    if (ganttStart.getDate() < 25) {
      // Move back to the 25th of the previous month
      const prevMonth = new Date(ganttStart.getFullYear(), ganttStart.getMonth() - 1, 25)
      ganttStart = prevMonth
    }
    
    // Add padding based on view mode
    const paddedStart = subDays(ganttStart, viewModeConfig.padding)
    let paddedEnd = addDays(latest, viewModeConfig.padding)
    
    // Calculate minimum columns needed to fill viewport
    // Assume viewport is at least 1200px wide (minus 250px for left panel)
    const minViewportWidth = 950
    const minColumns = Math.ceil(minViewportWidth / viewModeConfig.columnWidth)
    
    // Generate column dates
    const columns: Date[] = []
    let current = paddedStart
    while (current <= paddedEnd || columns.length < minColumns) {
      columns.push(current)
      current = new Date(current.getTime() + viewModeConfig.step)
    }
    
    // Update paddedEnd to match actual end
    const finalEnd = columns[columns.length - 1]
    paddedEnd = new Date(finalEnd.getTime() + viewModeConfig.step)
    
    return { 
      ganttStart, 
      ganttEnd: paddedEnd, 
      columns,
      firstColumnDate: columns[0]
    }
  }, [activities, viewModeConfig])
}
