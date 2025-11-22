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
  const [currentView, setCurrentView] = useState<'timeline' | 'gantt' | 'map'>('gantt') // Default to Gantt view
  
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
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Trip not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            The trip you're looking for doesn't exist or may have been removed.
          </p>
          <Link 
            href="/trips"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header - Clean and Spacious */}
        <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="px-12 py-8">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {trip.name}
                  </h1>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: trip.color }}
                  />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {currentView === 'timeline' ? 'Timeline View' : currentView === 'gantt' ? 'Gantt Chart' : 'Map View'} • {activities.length} activities
                </p>
              </div>
              
              <div className="flex gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
                <button 
                  onClick={() => setCurrentView('timeline')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    currentView === 'timeline'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Timeline
                </button>
                <button 
                  onClick={() => setCurrentView('gantt')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    currentView === 'gantt'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Gantt
                </button>
                <button 
                  onClick={() => setCurrentView('map')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    currentView === 'map'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Spacious and Centered */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-12 py-8">
            {/* Content based on current view */}
            {currentView === 'timeline' && (
              <div>
                {activitiesByDate.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      No activities yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      Start planning your trip by adding your first activity.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
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
            )}

            {currentView === 'gantt' && (
              <GanttChart
                activities={activities}
                selectedActivityId={selectedActivity?.id}
                onActivitySelect={setSelectedActivity}
              />
            )}

            {currentView === 'map' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Map View Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      Interactive map with activity locations will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Activity Inspector */}
      <div className="w-96 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Details
          </h3>
        </div>
        
        <div className="flex-1 p-8">
          {selectedActivity ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedActivity.title}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedActivity.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedActivity.startTime}{selectedActivity.endTime && ` - ${selectedActivity.endTime}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedActivity.date).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedActivity.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Location</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedActivity.city}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <button className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium">
                  Edit Activity
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
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
