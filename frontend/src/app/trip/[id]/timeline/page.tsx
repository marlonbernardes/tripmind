'use client'

import { useMemo } from 'react'
import React from 'react'
import { TripLayout } from '@/components/features/TripLayout'
import { TimelineRightPanel } from '@/components/features/TimelineRightPanel'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity } from '@/types/simple'
import { getDateFromDateTime, getTimeFromDateTime } from '@/lib/mock-data'
import { getActivityColor } from '@/lib/activity-config'

interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Condensed Activity Row Component
function CompactActivityRow({ 
  activity, 
  isSelected, 
  onClick 
}: { 
  activity: SimpleActivity
  isSelected: boolean
  onClick: () => void 
}) {
  const activityColor = getActivityColor(activity.type)
  const startTime = getTimeFromDateTime(activity.start)
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${activity.status === 'planned' ? 'opacity-75' : ''}`}
    >
      {/* Color dot */}
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: activityColor }}
      />
      
      {/* Time */}
      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-10 flex-shrink-0">
        {startTime}
      </span>
      
      {/* Title */}
      <span className="text-xs text-gray-900 dark:text-white truncate flex-1">
        {activity.title}
      </span>
      
      {/* Status badge */}
      {activity.status === 'planned' && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
          PLANNED
        </span>
      )}
      
      {/* City */}
      {activity.city && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-20 flex-shrink-0">
          {activity.city}
        </span>
      )}
    </div>
  )
}

// Condensed Day Section Component
function CompactDaySection({ 
  date, 
  activities,
  selectedActivityId,
  onActivitySelect
}: { 
  date: string
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect: (activity: SimpleActivity) => void
}) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { dayName, monthDay }
  }

  const { dayName, monthDay } = formatDate(date)
  
  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })

  // Get unique cities for the day
  const cities = [...new Set(activities.filter(a => a.city).map(a => a.city))]

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Day Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {dayName}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {monthDay}
          </span>
        </div>
        {cities.length > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            • {cities.join(', ')}
          </span>
        )}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">
          {activities.length}
        </span>
      </div>
      
      {/* Activities */}
      <div className="px-1 py-1">
        {sortedActivities.map((activity) => (
          <CompactActivityRow
            key={activity.id}
            activity={activity}
            isSelected={selectedActivityId === activity.id}
            onClick={() => onActivitySelect(activity)}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineContent() {
  const { activities, selectedActivity, setSelectedActivity } = useTripContext()
  
  // Group activities by date, including multi-day activities on all relevant days
  const activitiesByDate = useMemo(() => {
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
    
    // Sort dates
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({ date, activities: grouped[date] }))
  }, [activities])

  return (
    <div className="h-full flex">
      {/* Left Panel - Timeline (60%) */}
      <div className="w-[60%] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No activities yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add your first activity to get started
              </p>
            </div>
          </div>
        ) : (
          <div>
            {activitiesByDate.map(({ date, activities }) => (
              <CompactDaySection
                key={date}
                date={date}
                activities={activities}
                selectedActivityId={selectedActivity?.id}
                onActivitySelect={setSelectedActivity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Details/Recommendations/AI Chat (40%) */}
      <div className="w-[40%] h-full">
        <TimelineRightPanel />
      </div>
    </div>
  )
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { id: tripId } = React.use(params)
  
  return (
    <TripLayout tripId={tripId} hideSidePanel>
      <TimelineContent />
    </TripLayout>
  )
}
