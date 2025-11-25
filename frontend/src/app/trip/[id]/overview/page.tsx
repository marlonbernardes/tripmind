'use client'

import { useMemo, useEffect } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { TripLayout } from '@/components/features/TripLayout'
import { GanttChart } from '@/components/features/GanttChart'
import { useTripContext } from '@/contexts/TripContext'

interface OverviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

function OverviewContent() {
  const { activities, selectedActivity, setSelectedActivity } = useTripContext()

  return (
    <div className="px-6 py-6">
      <div className="max-w-none">
        {activities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No activities yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start planning your trip by adding your first activity to see the overview.
            </p>
          </div>
        ) : (
          <GanttChart
            activities={activities}
            selectedActivityId={selectedActivity?.id}
            onActivitySelect={setSelectedActivity}
          />
        )}
      </div>
    </div>
  )
}

export default function OverviewPage({ params }: OverviewPageProps) {
  const { id: tripId } = React.use(params)
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to overview2 (new custom Gantt implementation)
    router.push(`/trip/${tripId}/overview2`)
  }, [tripId, router])
  
  return (
    <TripLayout tripId={tripId}>
      <OverviewContent />
    </TripLayout>
  )
}
