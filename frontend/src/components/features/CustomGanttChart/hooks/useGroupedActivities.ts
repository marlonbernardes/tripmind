import { useMemo } from 'react'
import type { SimpleActivity } from '@/types/simple'
import type { GroupedActivities } from '../types'

export function useGroupedActivities(
  activities: SimpleActivity[],
  expandedCategories: Set<string>
): GroupedActivities[] {
  return useMemo(() => {
    // Group activities by type
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = []
      }
      acc[activity.type].push(activity)
      return acc
    }, {} as Record<string, SimpleActivity[]>)

    // Sort by type priority
    const typeOrder = ['flight', 'transport', 'hotel', 'event', 'task', 'note']
    
    return typeOrder
      .filter(type => grouped[type])
      .map(type => ({
        type,
        // Only include activities if category is expanded, otherwise empty array
        activities: expandedCategories.has(type) ? grouped[type] : [],
        // Keep all activities for collapsed view rendering
        allActivities: grouped[type]
      }))
  }, [activities, expandedCategories])
}
