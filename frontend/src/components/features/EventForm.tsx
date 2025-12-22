'use client'

import { useState, useEffect } from 'react'
import type { Activity, EventMetadata, ActivityStatus, ActivityContext } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { getTripDuration } from '@/lib/date-service'
import { DaySelect } from '@/components/ui/day-select'
import { FormActions } from '@/components/ui/form-actions'

interface EventFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

export function EventForm({ activity, onSave, onCancel, onDelete, defaultDay = 1, initialContext }: EventFormProps) {
  const { trip } = useTripContext()
  
  const [formData, setFormData] = useState({
    title: '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    location: initialContext?.city || '',
    status: 'draft' as ActivityStatus,
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        location: activity.city || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || trip?.id || '1',
      type: 'event',
      title: formData.title,
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.location,
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {} as EventMetadata
    }

    onSave(activityData)
  }

  const tripDuration = trip ? getTripDuration(trip) : 14

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Concert at Madison Square Garden"
          required
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. New York"
          required
        />
      </div>

      {/* Day and Time - always on same line */}
      {trip && (
        <div className="grid grid-cols-2 gap-2">
          <DaySelect
            trip={trip}
            value={formData.day}
            onChange={(day) => setFormData(prev => ({ 
              ...prev, 
              day,
              endDay: prev.endDay && prev.endDay < day ? undefined : prev.endDay
            }))}
            label="Day"
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* End Day and Time - on same line */}
      {trip && (
        <div className="grid grid-cols-2 gap-2">
          <DaySelect
            trip={trip}
            value={formData.endDay ?? formData.day}
            onChange={(day) => setFormData(prev => ({ 
              ...prev, 
              endDay: day === prev.day ? undefined : day
            }))}
            label="End Day"
            minDay={formData.day}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ActivityStatus }))}
              className="mr-1.5"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Draft</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="confirmed"
              checked={formData.status === 'confirmed'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ActivityStatus }))}
              className="mr-1.5"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Confirmed</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          rows={2}
          placeholder="Additional notes..."
        />
      </div>

      {/* Recommendations Section - show for draft activities */}
      {formData.status === 'draft' && (
        <RecommendationsSection
          activity={{
            type: 'event',
            status: formData.status,
            city: formData.location || undefined,
            day: formData.day,
            time: formData.time,
            endDay: formData.endDay,
            endTime: formData.endTime
          }}
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onCancel={onCancel}
        onDelete={onDelete}
        isEditing={!!activity}
      />
    </form>
  )
}
