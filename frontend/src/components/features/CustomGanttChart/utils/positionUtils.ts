import { ViewModeConfig } from '../types'

export function calculateBarPosition(
  activityStart: Date,
  activityEnd: Date,
  ganttStart: Date,
  viewModeConfig: ViewModeConfig
): { x: number; width: number } {
  // Calculate milliseconds from gantt start
  const startOffset = activityStart.getTime() - ganttStart.getTime()
  const duration = activityEnd.getTime() - activityStart.getTime()
  
  // Convert to column units
  const startColumn = startOffset / viewModeConfig.step
  const durationColumns = Math.max(0.5, duration / viewModeConfig.step)
  
  // Convert to pixels
  const x = startColumn * viewModeConfig.columnWidth
  const width = durationColumns * viewModeConfig.columnWidth
  
  return { x, width }
}
