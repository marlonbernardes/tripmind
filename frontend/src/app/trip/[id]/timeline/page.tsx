'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TimelineDay } from '@/components/features/TimelineDay'
import { GanttChart } from '@/components/features/GanttChart'
import { mockTrips, mockActivities, getActivitiesForTrip } from '@/lib/mock-data'
import type { SimpleActivity } from '@/types/simple'

interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const [selectedActivity, setSelectedActivity] = useState<SimpleActivity | null>(null)
  const [currentView, setCurrentView] = useState<'timeline' | 'gantt' | 'map'>('timeline')
  
  // For now, we'll use the resolved params synchronously since we're in client mode
  // In a real app, you'd handle the Promise properly
  const tripId = '1' // Hardcoded for demo - would extract from params
  
  const trip = mockTrips.find(t => t.id === tripId)
  const activities = getActivitiesForTrip(tripId)
  
  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      const date = activity.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(activity)
      return acc
    }, {} as Record<string, SimpleActivity[]>)
    
    // Sort dates
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({ date, activities: grouped[date] }))
  }, [activities])

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trip not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The trip you're looking for doesn't exist.
          </p>
          <Link 
            href="/trips"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Timeline Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  href="/trips"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {trip.name}
                </h1>
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: trip.color }}
                />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {currentView === 'timeline' ? 'List view' : currentView === 'gantt' ? 'Gantt view' : 'Map view'} • {activities.length} activities
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentView('timeline')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  currentView === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                List
              </button>
              <button 
                onClick={() => setCurrentView('gantt')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  currentView === 'gantt'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Gantt
              </button>
              <button 
                onClick={() => setCurrentView('map')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  currentView === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Map
              </button>
            </div>
          </div>
          
          {/* Content based on current view */}
          {currentView === 'timeline' && (
            <div className="space-y-2">
              {activitiesByDate.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No activities yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start planning your trip by adding your first activity.
                  </p>
                </div>
              ) : (
                activitiesByDate.map(({ date, activities }) => (
                  <TimelineDay
                    key={date}
                    date={date}
                    activities={activities}
                    selectedActivityId={selectedActivity?.id}
                    onActivitySelect={setSelectedActivity}
                  />
                ))
              )}
            </div>
          )}

          {currentView === 'gantt' && (
            <GanttChart
              activities={activities}
              selectedActivityId={selectedActivity?.id}
              onActivitySelect={setSelectedActivity}
            />
          )}

          {currentView === 'map' && (
            <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Map View Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Interactive map with activity locations will be available in a future update.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="h-full flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedActivity ? 'Activity Details' : 'Activity Details'}
          </h3>
          
          {selectedActivity ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedActivity.title}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><span className="font-medium">Type:</span> {selectedActivity.type}</p>
                  <p><span className="font-medium">Time:</span> {selectedActivity.startTime}{selectedActivity.endTime && ` - ${selectedActivity.endTime}`}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedActivity.date).toLocaleDateString()}</p>
                  {selectedActivity.city && (
                    <p><span className="font-medium">Location:</span> {selectedActivity.city}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Edit Activity
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Select an activity to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
