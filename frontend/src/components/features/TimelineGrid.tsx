'use client'

import { useMemo, useState } from 'react'
import type { SimpleActivity } from '@/types/simple'
import { getDateFromDateTime } from '@/lib/mock-data'

interface TimelineGridProps {
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
}

const activityTypeColors = {
  flight: '#3B82F6',
  hotel: '#10B981', 
  event: '#8B5CF6',
  transport: '#F59E0B',
  note: '#6B7280',
  task: '#F97316'
}

const activityTypeLabels = {
  flight: 'Flights',
  hotel: 'Hotels', 
  event: 'Events',
  transport: 'Transports',
  note: 'Notes',
  task: 'Tasks'
}

export function TimelineGrid({ activities, selectedActivityId, onActivitySelect }: TimelineGridProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flight', 'transport', 'hotel', 'event', 'task', 'note'])
  )

  // Get date range for grid columns
  const dateRange = useMemo(() => {
    if (activities.length === 0) return []
    
    const dates = [...new Set(activities.map(a => getDateFromDateTime(a.start)))].sort()
    const startDate = new Date(dates[0])
    const endDate = new Date(dates[dates.length - 1])
    
    const range = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      range.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return range
  }, [activities])

  // Group activities by type
  const activitiesByType = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = []
      }
      acc[activity.type].push(activity)
      return acc
    }, {} as Record<string, SimpleActivity[]>)
    
    const typeOrder = ['flight', 'transport', 'hotel', 'event', 'task', 'note']
    return typeOrder
      .filter(type => grouped[type])
      .map(type => ({
        type,
        activities: grouped[type].sort((a, b) => {
          return new Date(a.start).getTime() - new Date(b.start).getTime()
        })
      }))
  }, [activities])

  // Get today's date for indicator
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const showTodayIndicator = dateRange.some(date => 
    date.toISOString().split('T')[0] === todayStr
  )

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

  const formatDate = (date: Date) => {
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    }
  }

  const getActivityPosition = (activity: SimpleActivity, date: Date) => {
    const activityStartDate = getDateFromDateTime(activity.start)
    const dateStr = date.toISOString().split('T')[0]
    
    if (activityStartDate === dateStr) {
      return { show: true, activity }
    }
    
    // Handle multi-day activities with end times
    if (activity.end) {
      const startDate = new Date(getDateFromDateTime(activity.start))
      const endDate = new Date(getDateFromDateTime(activity.end))
      
      if (date >= startDate && date <= endDate) {
        return { show: true, activity, isSpanning: true }
      }
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
          {/* Date Headers */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-48 flex-shrink-0 px-6 py-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Activities
              </span>
            </div>
            {dateRange.map((date, index) => {
              const { month, day } = formatDate(date)
              const isToday = date.toISOString().split('T')[0] === todayStr
              
              return (
                <div 
                  key={index} 
                  className={`flex-1 min-w-[80px] px-3 py-3 text-center border-l border-gray-100 dark:border-gray-800 ${
                    isToday ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {month}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {day}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Activity Rows */}
          {activitiesByType.map(({ type, activities: typeActivities }, categoryIndex) => {
            const isExpanded = expandedCategories.has(type)
            const categoryColor = activityTypeColors[type as keyof typeof activityTypeColors]
            
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
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: categoryColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {activityTypeLabels[type as keyof typeof activityTypeLabels]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {typeActivities.length} items
                      </div>
                    </div>
                  </div>
                  {dateRange.map((date, dateIndex) => (
                    <div 
                      key={dateIndex}
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
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        />
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
                      
                      {dateRange.map((date, dateIndex) => {
                        const position = getActivityPosition(activity, date)
                        const isToday = date.toISOString().split('T')[0] === todayStr
                        
                        return (
                          <div 
                            key={dateIndex}
                            className={`flex-1 min-w-[80px] border-l border-gray-100 dark:border-gray-800 relative py-3 px-2 ${
                              isToday ? 'bg-gray-100/50 dark:bg-gray-700/30' : ''
                            }`}
                          >
                            {position.show && (
                              <div 
                                className="h-6 rounded-md flex items-center justify-center text-xs font-medium text-white shadow-sm border border-black/10"
                                style={{ backgroundColor: categoryColor }}
                                title={`${activity.title} - ${new Date(activity.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}${activity.end ? ` to ${new Date(activity.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}` : ''}`}
                              >
                                <span className="truncate px-2">
                                  {activity.title}
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

        {/* Today indicator line */}
        {showTodayIndicator && (
          <div className="absolute top-0 bottom-0 pointer-events-none">
            {dateRange.map((date, index) => {
              const isToday = date.toISOString().split('T')[0] === todayStr
              if (!isToday) return null
              
              const leftOffset = 192 + (index * 80) + 40 // 192px for left column + index * column width + half column width
              
              return (
                <div
                  key="today-line"
                  className="absolute top-0 bottom-0 w-px bg-gray-800 dark:bg-gray-200 z-10"
                  style={{ left: `${leftOffset}px` }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
