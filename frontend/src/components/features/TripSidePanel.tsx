'use client'

import { useState, useEffect } from 'react'
import { FileText, Lightbulb, MessageSquare, Plus } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { ManageActivityForm } from './ManageActivityForm'
import { RecommendationsSection } from './RecommendationsSection'
import { TripAIChat } from './TripAIChat'

type TabType = 'details' | 'recommend' | 'assistant'

export function TripSidePanel() {
  const { selectedActivity, setSelectedActivity, isCreatingActivity, setIsCreatingActivity } = useTripContext()
  const [activeTab, setActiveTab] = useState<TabType>('details')

  // Auto-switch to details tab when an activity is selected
  useEffect(() => {
    if (selectedActivity) {
      setActiveTab('details')
    }
  }, [selectedActivity])

  const handleClose = () => {
    setSelectedActivity(null)
    setIsCreatingActivity(false)
  }

  const handleSave = () => {
    setSelectedActivity(null)
    setIsCreatingActivity(false)
  }

  const handleCancel = () => {
    setSelectedActivity(null)
    if (isCreatingActivity) {
      setIsCreatingActivity(false)
    }
  }

  const handleAddActivity = () => {
    setSelectedActivity(null)
    setIsCreatingActivity(true)
    setActiveTab('details')
  }

  const hasContent = selectedActivity || isCreatingActivity

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Tabs and Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tab Navigation */}
        <div className="flex items-center px-2 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-3 h-3" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('recommend')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'recommend'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              Recommend
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'assistant'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Assistant
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'details' && (
            <div className="p-3">
              {isCreatingActivity ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      New Activity
                    </h3>
                    <button
                      onClick={handleClose}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                  <ManageActivityForm
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </div>
              ) : selectedActivity ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Edit Activity
                    </h3>
                    <button
                      onClick={handleClose}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <ManageActivityForm
                    mode="edit"
                    activity={selectedActivity}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </div>
              ) : (
                <EmptyDetailsState onAddClick={handleAddActivity} />
              )}
            </div>
          )}

          {activeTab === 'recommend' && (
            <div className="p-3">
              {selectedActivity ? (
                <RecommendationsSection activity={selectedActivity} />
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select an activity to see recommendations
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="h-full">
              <TripAIChat />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Empty State Component
function EmptyDetailsState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Select an activity to view details
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add Activity
      </button>
    </div>
  )
}
