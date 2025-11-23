'use client'

import { useMemo } from 'react'
import { TripLayout } from '@/components/features/TripLayout'
import { TimelineDay } from '@/components/features/TimelineDay'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity } from '@/types/simple'
import { getDateFromDateTime } from '@/lib/mock-data'

interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
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
    <div className="px-6 py-6 h-full">
      <div className="w-full">
        {activities.length === 0 ? (
          <div className="text-center py-20">
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
        ) : (
          <div className="space-y-4">
            {activitiesByDate.map(({ date, activities }) => (
              <TimelineDay
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
    </div>
  )
}

export default function TimelinePage({ params }: TimelinePageProps) {
  // For now, we'll use a hardcoded trip ID - in a real app, you'd extract this from params
  const tripId = '1'
  
  return (
    <TripLayout tripId={tripId}>
      <TimelineContent />
    </TripLayout>
  )
}
