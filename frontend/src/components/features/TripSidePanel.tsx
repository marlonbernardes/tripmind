'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Settings } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { ManageActivityForm } from './ManageActivityForm'
import { SuggestionDetailView } from './SuggestionDetailView'
import { TripConfigTab } from './TripConfigTab'
import { getActivityLabel } from '@/lib/activity-config'
import { ActivityIcon } from '@/components/ui/activity-icon'
import type { ActivityType, ActivityContext } from '@/types/simple'

type TabType = 'details' | 'config'

interface TripSidePanelProps {
  /** External tab control - when this changes to 'config', switches to the Preferences tab */
  externalTabTrigger?: 'config' | null
  /** Callback when external tab trigger is consumed */
  onExternalTabConsumed?: () => void
}

export function TripSidePanel({ 
  externalTabTrigger,
  onExternalTabConsumed 
}: TripSidePanelProps) {
  const { 
    sidePanelState,
    createActivity,
    clearPanel,
    trip
  } = useTripContext()
  
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [creatingActivityType, setCreatingActivityType] = useState<ActivityType | null>(null)

  // Auto-switch to details tab when panel state changes
  useEffect(() => {
    if (sidePanelState.mode !== 'empty') {
      setActiveTab('details')
    }
  }, [sidePanelState])

  // Handle external tab trigger (from TripEditModal "Open Preferences" link)
  useEffect(() => {
    if (externalTabTrigger === 'config') {
      setActiveTab('config')
      onExternalTabConsumed?.()
    }
  }, [externalTabTrigger, onExternalTabConsumed])

  // Reset creating activity type when entering create mode
  useEffect(() => {
    if (sidePanelState.mode === 'creating') {
      // Only reset type if there's no preselected type in context
      if (!sidePanelState.context?.preselectedType) {
        setCreatingActivityType(null)
      } else {
        setCreatingActivityType(sidePanelState.context.preselectedType)
      }
    }
  }, [sidePanelState])

  const handleAddActivity = () => {
    createActivity()
  }

  const handleCreateFromSuggestion = (context: ActivityContext) => {
    createActivity(context)
  }

  // Render content based on sidePanelState.mode
  const renderDetailsContent = () => {
    switch (sidePanelState.mode) {
      case 'empty':
        return <EmptyDetailsState onAddClick={handleAddActivity} />

      case 'creating':
        return (
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
                onClick={clearPanel}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-0">
              <ManageActivityForm
                key={`create-${sidePanelState.context?.day ?? 'no-day'}-${sidePanelState.context?.preselectedType ?? 'no-type'}`}
                mode="create"
                onSave={clearPanel}
                onCancel={clearPanel}
                onTypeChange={setCreatingActivityType}
                initialContext={sidePanelState.context}
              />
            </div>
          </div>
        )

      case 'suggestion':
        if (!trip) return null
        return (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                💡 Suggestion
              </h3>
              <button
                onClick={clearPanel}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SuggestionDetailView
                suggestion={sidePanelState.suggestion}
                trip={trip}
                onCreateActivity={handleCreateFromSuggestion}
              />
            </div>
          </div>
        )

      case 'editing':
        return (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <ActivityIcon type={sidePanelState.activity.type} size={16} className="text-gray-600 dark:text-gray-400" />
                {getActivityLabel(sidePanelState.activity.type)}
              </h3>
              <button
                onClick={clearPanel}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-0">
              <ManageActivityForm
                mode="edit"
                activity={sidePanelState.activity}
                onSave={clearPanel}
                onCancel={clearPanel}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Tab Navigation */}
      <div className="flex items-center px-2 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
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
            {renderDetailsContent()}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="h-full overflow-y-auto">
            <TripConfigTab onClose={() => setActiveTab('details')} />
          </div>
        )}
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
