'use client'

import { useState, useCallback } from 'react'
import { useTripContext } from '@/contexts/TripContext'
import type { Activity, ActivityType } from '@/types/simple'
import { FlightForm } from './FlightForm'
import { StayForm } from './HotelForm'
import { EventForm } from './EventForm'
import { TransportForm } from './TransportForm'
import { allActivityTypes, getActivityLabel, getActivityDescription } from '@/lib/activity-config'
import { ActivityIcon } from '@/components/ui/activity-icon'

interface ManageActivityFormProps {
  mode: 'create' | 'edit'
  activity?: Activity
  initialDay?: number // For create mode, pre-populate the day
  onSave?: () => void
  onCancel?: () => void
  onTypeChange?: (type: ActivityType | null) => void // Callback when type selection changes
}

export function ManageActivityForm({ 
  mode, 
  activity, 
  initialDay = 1,
  onSave, 
  onCancel,
  onTypeChange
}: ManageActivityFormProps) {
  const { addActivity, updateActivity, deleteActivityWithUndo } = useTripContext()
  // For create mode, track type selection in state
  // For edit mode, derive type from the activity prop to react to type changes
  const [createModeType, setCreateModeType] = useState<ActivityType | null>(null)
  const selectedType = mode === 'edit' && activity ? activity.type : createModeType
  
  const setSelectedType = (type: ActivityType | null) => {
    setCreateModeType(type)
    onTypeChange?.(type)
  }

  const handleActivitySave = (activityData: Omit<Activity, 'id'>) => {
    try {
      if (mode === 'create') {
        addActivity(activityData)
      } else if (mode === 'edit' && activity) {
        updateActivity(activity.id, activityData)
      }
      onSave?.()
    } catch (error) {
      console.error('Error saving activity:', error)
    }
  }

  const handleActivityDelete = useCallback(() => {
    if (activity) {
      deleteActivityWithUndo(activity.id)
      onCancel?.() // Close the panel after delete
    }
  }, [activity, deleteActivityWithUndo, onCancel])

  // If editing, skip type selection and go straight to the form
  if (mode === 'edit' && activity && selectedType) {
    const FormComponent = getFormComponent(selectedType)
    return (
      <FormComponent
        activity={activity}
        onSave={handleActivitySave}
        onCancel={onCancel || (() => {})}
        onDelete={handleActivityDelete}
        defaultDay={initialDay}
      />
    )
  }

  // Type selection step
  if (!selectedType) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose the type of activity
        </p>

        <div className="grid grid-cols-2 gap-2">
          {allActivityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <ActivityIcon type={type} size={24} className="flex-shrink-0 group-hover:scale-110 transition-transform" colored />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {getActivityLabel(type)}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {getActivityDescription(type)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 left-0 right-0 pt-3 pb-1 mt-4 -mx-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Form step - show the specific form for the selected type
  const FormComponent = getFormComponent(selectedType)
  
  return (
    <FormComponent
      activity={activity}
      onSave={handleActivitySave}
      onCancel={onCancel || (() => {})}
      onDelete={activity ? handleActivityDelete : undefined}
      defaultDay={initialDay}
    />
  )
}

// Helper function to get the appropriate form component
function getFormComponent(type: ActivityType) {
  switch (type) {
    case 'flight':
      return FlightForm
    case 'stay':
      return StayForm
    case 'transport':
      return TransportForm
    case 'event':
    default:
      return EventForm
  }
}
