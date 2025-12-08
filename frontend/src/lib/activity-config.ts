import type { ActivityType } from '@/types/simple'

// Activity type display configuration
// Colors work well in both light and dark mode (mid-range saturation)
export interface ActivityTypeConfig {
  color: string       // Hex color for use in JS (maps, charts, etc.)
  bgClass: string     // Tailwind background class
  textClass: string   // Tailwind text class
  label: string
}

export const activityTypeConfig: Record<ActivityType, ActivityTypeConfig> = {
  flight: {
    color: '#3B82F6',  // blue-500
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-500',
    label: 'Flight',
  },
  hotel: {
    color: '#10B981',  // emerald-500
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
    label: 'Hotel',
  },
  event: {
    color: '#8B5CF6',  // violet-500
    bgClass: 'bg-violet-500',
    textClass: 'text-violet-500',
    label: 'Event',
  },
  transport: {
    color: '#F59E0B',  // amber-500
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-500',
    label: 'Transport',
  },
  note: {
    color: '#6B7280',  // gray-500
    bgClass: 'bg-gray-500',
    textClass: 'text-gray-500',
    label: 'Note',
  },
  task: {
    color: '#F97316',  // orange-500
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-500',
    label: 'Task',
  },
}

// Legacy: Simple color mapping for backward compatibility
export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  flight: '#3B82F6',
  hotel: '#10B981',
  event: '#8B5CF6',
  transport: '#F59E0B',
  note: '#6B7280',
  task: '#F97316',
}

// Helper to get color for activity type
export function getActivityColor(type: ActivityType): string {
  return activityTypeConfig[type]?.color || '#6B7280'
}

// Helper to get label for activity type
export function getActivityLabel(type: ActivityType): string {
  return activityTypeConfig[type]?.label || type
}

// Helper to get Tailwind bg class for activity type
export function getActivityBgClass(type: ActivityType): string {
  return activityTypeConfig[type]?.bgClass || 'bg-gray-500'
}

// Helper to get Tailwind text class for activity type
export function getActivityTextClass(type: ActivityType): string {
  return activityTypeConfig[type]?.textClass || 'text-gray-500'
}

// All activity types
export const allActivityTypes: ActivityType[] = ['flight', 'hotel', 'event', 'transport', 'note', 'task']
