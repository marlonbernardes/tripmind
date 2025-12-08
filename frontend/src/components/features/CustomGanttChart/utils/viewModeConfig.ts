import { ViewModeConfig } from '../types'

// Re-export ACTIVITY_COLORS from central config for backward compatibility
export { ACTIVITY_COLORS } from '@/lib/activity-config'

export const VIEW_MODES: Record<string, ViewModeConfig> = {
  Day: {
    name: 'Day',
    step: 86400000,          // 1 day in ms
    columnWidth: 45,
    padding: 1,           // 1 day padding before (after padding might be larger as we need to fill the view)
    lowerFormat: 'd',        // 1-31
    upperFormat: 'MMMM',     // January
    snapInterval: 86400000,
    showUpperWhen: (curr, prev) => {
      if (!prev) return true
      // Show if different month AND at least 5 days have passed since last header
      const daysDiff = Math.abs(curr.getDate() - prev.getDate())
      return curr.getMonth() !== prev.getMonth() && (daysDiff >= 5 || curr.getDate() <= 5)
    }
  },
  Month: {
    name: 'Month',
    step: 2592000000,        // ~30 days in ms (approx) - used for initial calculation
    columnWidth: 120,        // Larger columns for month view (will be dynamic)
    padding: 0,              // No padding for month view - show exactly 12 months
    lowerFormat: 'MMM',      // Jan
    upperFormat: 'yyyy',     // 2024
    snapInterval: 86400000,  // snap to days
    showUpperWhen: (curr, prev) => 
      !prev || curr.getFullYear() !== prev.getFullYear()
  }
}
