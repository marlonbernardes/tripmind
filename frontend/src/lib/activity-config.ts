import type { ActivityType } from '@/types/simple'

export interface ActivityTypeConfig {
  label: string
  color: string
  description: string
  defaultCollapsed?: boolean  // For Gantt chart and similar views
}

// Activity type configuration - colors, labels, descriptions
export const activityTypeConfig: Record<ActivityType, ActivityTypeConfig> = {
  flight: {
    label: 'Flight',
    color: '#3B82F6', // blue-500
    description: 'Air travel between destinations',
  defaultCollapsed: true
  },
  stay: {
    label: 'Stay',
    color: '#8B5CF6', // violet-500
    description: 'Accommodation and lodging',
    defaultCollapsed: true
  },
  event: {
    label: 'Event',
    color: '#F59E0B', // amber-500
    description: 'Attractions, shows, concerts, tours'
  },
  transport: {
    label: 'Transport',
    color: '#10B981', // emerald-500
    description: 'Local transportation'
  }
}

// Ordered list of activity types (for UI display order)
export const allActivityTypes: ActivityType[] = [
  'flight',
  'stay',
  'event',
  'transport'
]

// Helper function to get activity color
export function getActivityColor(type: ActivityType): string {
  return activityTypeConfig[type]?.color ?? '#6B7280'
}

// Helper function to get activity label
export function getActivityLabel(type: ActivityType): string {
  return activityTypeConfig[type]?.label ?? type
}

// Helper function to check if activity type should be collapsed by default
export function isDefaultCollapsed(type: ActivityType): boolean {
  return activityTypeConfig[type]?.defaultCollapsed ?? false
}

// Helper function to get activity description
export function getActivityDescription(type: ActivityType): string {
  return activityTypeConfig[type]?.description ?? ''
}
