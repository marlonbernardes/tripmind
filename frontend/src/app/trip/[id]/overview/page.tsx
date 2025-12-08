'use client'

import { useTripContext } from '@/contexts/TripContext'
import { TripLayout } from '@/components/features/TripLayout'
import { CustomGanttChart } from '@/components/features/CustomGanttChart'
import React, { use } from 'react'

function OverviewContent() {
  const { activities, selectedActivity, setSelectedActivity, updateActivity } = useTripContext()
  
  const handleActivityUpdate = (activityId: string, newDates: { start: string; end?: string }) => {
    const activity = activities.find(a => a.id === activityId)
    if (activity) {
      updateActivity(activityId, {
        ...activity,
        start: newDates.start,
        end: newDates.end
      })
    }
  }
  
  return (
    <div className="h-full p-6">
      <CustomGanttChart
        activities={activities}
        selectedActivityId={selectedActivity?.id}
        onActivitySelect={setSelectedActivity}
        onActivityUpdate={handleActivityUpdate}
      />
    </div>
  )
}

export default function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params)
  
  return (
    <TripLayout tripId={tripId}>
      <OverviewContent />
    </TripLayout>
  )
}
