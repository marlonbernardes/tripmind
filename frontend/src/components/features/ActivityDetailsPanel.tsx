'use client'

import { useTripContext } from '@/contexts/TripContext'
import { getDateFromDateTime, getTimeFromDateTime } from '@/lib/mock-data'

export function ActivityDetailsPanel() {
  const { selectedActivity, setSelectedActivity } = useTripContext()
  
  if (!selectedActivity) {
    return null
  }

  const handleClose = () => {
    setSelectedActivity(null)
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-80 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-[9999] flex flex-col">
      {/* Header with close button */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Activity Details
        </h3>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
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
                    {new Date(getDateFromDateTime(selectedActivity.start)).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Time</span>
                <div className="font-medium text-gray-900 dark:text-white mt-1">
                  {getTimeFromDateTime(selectedActivity.start)}
                  {selectedActivity.end && ` – ${getTimeFromDateTime(selectedActivity.end)}`}
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
