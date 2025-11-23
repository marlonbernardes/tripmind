'use client'

import { useTripContext } from '@/contexts/TripContext'

export function ActivityDetailsPanel() {
  const { selectedActivity } = useTripContext()
  
  if (!selectedActivity) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Activity Details
          </h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600">
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
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Activity Details
        </h3>
      </div>
      
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {selectedActivity.title}
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type</span>
                  <div className="font-medium text-gray-900 dark:text-white capitalize mt-1">
                    {selectedActivity.type}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <div className="font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(selectedActivity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Time</span>
                <div className="font-medium text-gray-900 dark:text-white mt-1">
                  {selectedActivity.startTime}
                  {selectedActivity.endTime && ` – ${selectedActivity.endTime}`}
                </div>
              </div>
              
              {selectedActivity.city && (
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Location</span>
                  <div className="font-medium text-gray-900 dark:text-white mt-1">
                    {selectedActivity.city}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium">
              Edit Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
