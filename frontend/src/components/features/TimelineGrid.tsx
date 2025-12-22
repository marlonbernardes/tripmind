'use client'

import { useMemo, useState } from 'react'
import type { Activity, ActivityType, Trip } from '@/types/simple'
import { getActivityLabel, getActivityColor } from '@/lib/activity-config'
import { ActivityIcon } from '@/components/ui/activity-icon'
import { getTripDuration, formatDayHeader, compareActivities } from '@/lib/date-service'
import { useTripContext } from '@/contexts/TripContext'

interface TimelineGridProps {
  activities: Activity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: Activity) => void
}

export function TimelineGrid({ activities, selectedActivityId, onActivitySelect }: TimelineGridProps) {
  const { trip } = useTripContext()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flight', 'transport', 'stay', 'event'])
  )

  // Get day range for grid columns based on trip duration
  const dayRange = useMemo(() => {
    if (!trip) {
      // Fallback: calculate from activities
      if (activities.length === 0) return []
      const maxDay = Math.max(...activities.map(a => a.endDay ?? a.day))
      return Array.from({ length: maxDay }, (_, i) => i + 1)
    }
    const duration = getTripDuration(trip)
    return Array.from({ length: duration }, (_, i) => i + 1)
  }, [trip, activities])

  // Group activities by type
  const activitiesByType = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = []
      }
      acc[activity.type].push(activity)
      return acc
    }, {} as Record<string, Activity[]>)
    
    const typeOrder: ActivityType[] = ['flight', 'transport', 'stay', 'event']
    return typeOrder
      .filter(type => grouped[type])
      .map(type => ({
        type,
        activities: grouped[type].sort(compareActivities)
      }))
  }, [activities])

  const toggleCategory = (categoryType: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryType)) {
        newSet.delete(categoryType)
      } else {
        newSet.add(categoryType)
      }
      return newSet
    })
  }

  const formatDayColumn = (day: number) => {
    if (!trip) return { label: `Day ${day}`, subLabel: '' }
    const header = formatDayHeader(trip, day)
    // For fixed trips, header is like "Mon, Jan 8" - split it
    const parts = header.split(', ')
    if (parts.length === 2) {
      return { label: parts[1], subLabel: parts[0] } // "Jan 8", "Mon"
    }
    return { label: header, subLabel: '' }
  }

  const getActivityPosition = (activity: Activity, day: number) => {
    const startDay = activity.day
    const endDay = activity.endDay ?? activity.day
    
    if (day >= startDay && day <= endDay) {
      return { show: true, activity, isSpanning: day !== startDay }
    }
    
    return { show: false }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start planning your trip by adding your first activity.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Timeline Overview
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activities.length} activities
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative overflow-x-auto">
        <div className="min-w-full">
          {/* Day Headers */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-48 flex-shrink-0 px-6 py-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Activities
              </span>
            </div>
            {dayRange.map((day) => {
              const { label, subLabel } = formatDayColumn(day)
              
              return (
                <div 
                  key={day} 
                  className="flex-1 min-w-[80px] px-3 py-3 text-center border-l border-gray-100 dark:border-gray-800"
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {label}
                  </div>
                  {subLabel && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {subLabel}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Activity Rows */}
          {activitiesByType.map(({ type, activities: typeActivities }, categoryIndex) => {
            const isExpanded = expandedCategories.has(type)
            const categoryColor = getActivityColor(type as ActivityType)
            
            return (
              <div key={type}>
                {/* Category Header Row */}
                <div className={`flex border-b border-gray-100 dark:border-gray-800 ${
                  categoryIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/30'
                }`}>
                  <div className="w-48 flex-shrink-0 px-6 py-3 flex items-center gap-3">
                    <button
                      onClick={() => toggleCategory(type)}
                      className="w-4 h-4 flex-shrink-0 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <svg 
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ActivityIcon type={type as ActivityType} size={14} colored />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getActivityLabel(type as ActivityType)}s
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {typeActivities.length} items
                      </div>
                    </div>
                  </div>
                  {dayRange.map((day) => (
                    <div 
                      key={day}
                      className="flex-1 min-w-[80px] border-l border-gray-100 dark:border-gray-800 relative"
                    />
                  ))}
                </div>

                {/* Activity Rows (if expanded) */}
                {isExpanded && typeActivities.map((activity, activityIndex) => {
                  const isSelected = selectedActivityId === activity.id
                  const rowBg = (categoryIndex + activityIndex + 1) % 2 === 0 
                    ? 'bg-gray-50 dark:bg-gray-800/30' 
                    : 'bg-white dark:bg-gray-900'
                  
                  return (
                    <div 
                      key={activity.id} 
                      className={`flex border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${rowBg} ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => onActivitySelect?.(activity)}
                    >
                      <div className="w-48 flex-shrink-0 px-6 py-3 pl-12 flex items-center gap-3">
                        <ActivityIcon type={activity.type} size={12} colored className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            {activity.city && ` • ${activity.city}`}
                          </div>
                        </div>
                      </div>
                      
                      {dayRange.map((day) => {
                        const position = getActivityPosition(activity, day)
                        
                        return (
                          <div 
                            key={day}
                            className="flex-1 min-w-[80px] border-l border-gray-100 dark:border-gray-800 relative py-3 px-2"
                          >
                            {position.show && (
                              <div 
                                className="h-6 rounded-md flex items-center justify-center text-xs font-medium text-white shadow-sm border border-black/10"
                                style={{ backgroundColor: categoryColor }}
                                title={`${activity.title}${activity.time ? ` - ${activity.time}` : ''}${activity.endTime ? ` to ${activity.endTime}` : ''}`}
                              >
                                <span className="truncate px-2">
                                  {position.isSpanning ? '' : activity.title}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
