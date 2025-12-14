'use client'

import { useState } from 'react'
import { useTripContext } from '@/contexts/TripContext'
import type { Activity, ActivityType } from '@/types/simple'
import { FlightForm } from './FlightForm'
import { StayForm } from './HotelForm'
import { EventForm } from './EventForm'

interface ManageActivityFormProps {
  mode: 'create' | 'edit'
  activity?: Activity
  initialDay?: number // For create mode, pre-populate the day
  onSave?: () => void
  onCancel?: () => void
}

const activityTypes: { 
  value: ActivityType
  label: string
  icon: string
  description: string
}[] = [
  { 
    value: 'flight', 
    label: 'Flight', 
    icon: '✈️',
    description: 'Air travel between destinations'
  },
  { 
    value: 'stay', 
    label: 'Stay', 
    icon: '🏨',
    description: 'Accommodation and lodging'
  },
  { 
    value: 'event', 
    label: 'Event', 
    icon: '🎫',
    description: 'Shows, concerts, attractions'
  },
  { 
    value: 'transport', 
    label: 'Transport', 
    icon: '🚗',
    description: 'Local transportation'
  },
  { 
    value: 'note', 
    label: 'Note', 
    icon: '📝',
    description: 'General notes and reminders'
  },
  { 
    value: 'task', 
    label: 'Task', 
    icon: '✅',
    description: 'To-do items and tasks'
  },
]

export function ManageActivityForm({ 
  mode, 
  activity, 
  initialDay = 1,
  onSave, 
  onCancel 
}: ManageActivityFormProps) {
  const { addActivity, updateActivity } = useTripContext()
  const [selectedType, setSelectedType] = useState<ActivityType | null>(
    mode === 'edit' && activity ? activity.type : null
  )

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

  // If editing, skip type selection and go straight to the form
  if (mode === 'edit' && activity && selectedType) {
    const FormComponent = getFormComponent(selectedType)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon(selectedType)}</span>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Edit {getTypeLabel(selectedType)}
          </h3>
        </div>
        <FormComponent
          activity={activity}
          onSave={handleActivitySave}
          onCancel={onCancel || (() => {})}
          defaultDay={initialDay}
        />
      </div>
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
          {activityTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {type.icon}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{getTypeIcon(selectedType)}</span>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {getTypeLabel(selectedType)}
        </h3>
      </div>
      
      <FormComponent
        activity={activity}
        onSave={handleActivitySave}
        onCancel={onCancel || (() => {})}
        defaultDay={initialDay}
      />
    </div>
  )
}

// Helper functions
function getFormComponent(type: ActivityType) {
  switch (type) {
    case 'flight':
      return FlightForm
    case 'stay':
      return StayForm
    case 'event':
      return EventForm
    case 'transport':
    case 'note':
    case 'task':
    default:
      // For now, fallback to EventForm for other types
      return EventForm
  }
}

function getTypeIcon(type: ActivityType): string {
  const typeInfo = activityTypes.find(t => t.value === type)
  return typeInfo?.icon || '📝'
}

function getTypeLabel(type: ActivityType): string {
  const typeInfo = activityTypes.find(t => t.value === type)
  return typeInfo?.label || 'Activity'
}
