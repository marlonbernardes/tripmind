'use client'

import { useState, useEffect } from 'react'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity } from '@/types/simple'
import { FlightForm } from './FlightForm'
import { HotelForm } from './HotelForm'
import { EventForm } from './EventForm'

interface ManageActivityFormProps {
  mode: 'create' | 'edit'
  activity?: SimpleActivity
  initialDate?: string // For create mode, pre-populate the date
  onSave?: () => void
  onCancel?: () => void
}

const activityTypes: { 
  value: SimpleActivity['type']
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
    value: 'hotel', 
    label: 'Hotel', 
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
  initialDate,
  onSave, 
  onCancel 
}: ManageActivityFormProps) {
  const { addActivity, updateActivity } = useTripContext()
  const [selectedType, setSelectedType] = useState<SimpleActivity['type'] | null>(
    mode === 'edit' && activity ? activity.type : null
  )

  const handleActivitySave = (activityData: Omit<SimpleActivity, 'id'>) => {
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(selectedType)}</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit {getTypeLabel(selectedType)}
          </h3>
        </div>
        <FormComponent
          activity={activity}
          onSave={handleActivitySave}
          onCancel={onCancel || (() => {})}
        />
      </div>
    )
  }

  // Type selection step
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {mode === 'create' ? 'Add New Activity' : 'Edit Activity'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the type of activity you want to add
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {activityTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {type.icon}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(selectedType)}</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Add {getTypeLabel(selectedType)}
          </h3>
        </div>
        <button
          onClick={() => setSelectedType(null)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          ← Change Type
        </button>
      </div>
      
      <FormComponent
        activity={activity}
        onSave={handleActivitySave}
        onCancel={onCancel || (() => {})}
      />
    </div>
  )
}

// Helper functions
function getFormComponent(type: SimpleActivity['type']) {
  switch (type) {
    case 'flight':
      return FlightForm
    case 'hotel':
      return HotelForm
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

function getTypeIcon(type: SimpleActivity['type']): string {
  const typeInfo = activityTypes.find(t => t.value === type)
  return typeInfo?.icon || '📝'
}

function getTypeLabel(type: SimpleActivity['type']): string {
  const typeInfo = activityTypes.find(t => t.value === type)
  return typeInfo?.label || 'Activity'
}
