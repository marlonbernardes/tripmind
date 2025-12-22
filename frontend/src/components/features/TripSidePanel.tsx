'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Plus, Settings } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { ManageActivityForm } from './ManageActivityForm'
import { ActivityReadView } from './ActivityReadView'
import { SuggestionDetailView } from './SuggestionDetailView'
import { TripConfigTab } from './TripConfigTab'
import { getActivityLabel } from '@/lib/activity-config'
import { ActivityIcon } from '@/components/ui/activity-icon'
import type { ActivityType } from '@/types/simple'

type TabType = 'details' | 'config'
type ViewMode = 'view' | 'edit'

interface TripSidePanelProps {
  /** If true, starts in view mode and allows switching to edit. If false, goes directly to edit mode */
  defaultViewMode?: boolean
}

export function TripSidePanel({ defaultViewMode = false }: TripSidePanelProps) {
  const { 
    selectedActivity, 
    setSelectedActivity, 
    isCreatingActivity, 
    setIsCreatingActivity,
    trip,
    selectedSuggestion,
    setSelectedSuggestion
  } = useTripContext()
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode ? 'view' : 'edit')
  const [creatingActivityType, setCreatingActivityType] = useState<ActivityType | null>(null)
  const previousActivityId = useRef<string | null>(null)

  // Auto-switch to details tab when an activity or suggestion is selected
  useEffect(() => {
    if (selectedActivity) {
      setActiveTab('details')
      
      // If activity changed and we're in defaultViewMode, reset to view mode
      if (defaultViewMode && selectedActivity.id !== previousActivityId.current) {
        setViewMode('view')
      }
      previousActivityId.current = selectedActivity.id
    }
  }, [selectedActivity, defaultViewMode])

  // Auto-switch to details tab when a suggestion is selected
  useEffect(() => {
    if (selectedSuggestion) {
      setActiveTab('details')
    }
  }, [selectedSuggestion])

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
    setCreatingActivityType(null) // Reset type when starting fresh
    setIsCreatingActivity(true)
    setActiveTab('details')
  }

  const handleCreateCancel = () => {
    setCreatingActivityType(null)
    setIsCreatingActivity(false)
  }

  const handleCreateSave = () => {
    setCreatingActivityType(null)
    setSelectedActivity(null)
    setIsCreatingActivity(false)
  }

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
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'config'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="w-3 h-3" />
              Preferences
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'details' && (
            <div className="h-full">
              {isCreatingActivity ? (
                <div className="flex flex-col h-full">
                  <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {creatingActivityType ? (
                        <>
                          <ActivityIcon type={creatingActivityType} size={16} className="text-gray-600 dark:text-gray-400" />
                          Add {getActivityLabel(creatingActivityType)}
                        </>
                      ) : (
                        'What would you like to add?'
                      )}
                    </h3>
                    <button
                      onClick={handleCreateCancel}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 pb-0">
                    <ManageActivityForm
                      mode="create"
                      onSave={handleCreateSave}
                      onCancel={handleCreateCancel}
                      onTypeChange={setCreatingActivityType}
                    />
                  </div>
                </div>
              ) : selectedSuggestion && trip ? (
                /* Suggestion view - shows suggestion details with booking links */
                <div className="flex flex-col h-full">
                  <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      💡 Suggestion
                    </h3>
                    <button
                      onClick={() => setSelectedSuggestion(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <SuggestionDetailView
                      suggestion={selectedSuggestion}
                      trip={trip}
                      onCreateActivity={() => {
                        // TODO: Pre-fill activity form with suggestion data
                        setSelectedSuggestion(null)
                        setIsCreatingActivity(true)
                      }}
                    />
                  </div>
                </div>
              ) : selectedActivity ? (
                viewMode === 'view' && defaultViewMode ? (
                  /* View mode - shows activity details with Edit button */
                  <div className="flex flex-col h-full">
                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <ActivityIcon type={selectedActivity.type} size={16} className="text-gray-600 dark:text-gray-400" />
                      {getActivityLabel(selectedActivity.type)}
                    </h3>
                      <button
                        onClick={handleClose}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <ActivityReadView
                        activity={selectedActivity}
                        onEdit={() => setViewMode('edit')}
                      />
                    </div>
                  </div>
                ) : (
                  /* Edit mode */
                  <div className="flex flex-col h-full">
                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <ActivityIcon type={selectedActivity.type} size={16} className="text-gray-600 dark:text-gray-400" />
                        Edit {getActivityLabel(selectedActivity.type)}
                      </h3>
                      <button
                        onClick={() => {
                          if (defaultViewMode) {
                            setViewMode('view')
                          } else {
                            handleClose()
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {defaultViewMode ? '← Back' : '✕'}
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-0">
                      <ManageActivityForm
                        mode="edit"
                        activity={selectedActivity}
                        onSave={() => {
                          if (defaultViewMode) {
                            setViewMode('view')
                          } else {
                            handleSave()
                          }
                        }}
                        onCancel={() => {
                          if (defaultViewMode) {
                            setViewMode('view')
                          } else {
                            handleCancel()
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              ) : (
                <EmptyDetailsState onAddClick={handleAddActivity} />
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="h-full overflow-y-auto">
              <TripConfigTab onClose={() => setActiveTab('details')} />
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
