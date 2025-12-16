'use client'

import { useState, useEffect } from 'react'
import type { Activity, StayMetadata, ActivityStatus } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { FormActions } from '@/components/ui/form-actions'

interface StayFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
}

// Exported as both StayForm and HotelForm for backward compatibility
export function StayForm({ activity, onSave, onCancel, onDelete, defaultDay = 1 }: StayFormProps) {
  const { trip } = useTripContext()
  const [formData, setFormData] = useState({
    propertyName: '',
    city: '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    confirmationCode: '',
    status: 'draft' as ActivityStatus,
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as StayMetadata || {}
      setFormData({
        propertyName: metadata.propertyName || '',
        city: activity.city || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        confirmationCode: metadata.confirmationCode || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.propertyName) {
      return formData.propertyName
    }
    return 'Accommodation'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || '1',
      type: 'stay',
      title: generateTitle(),
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.city || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {
        propertyName: formData.propertyName || undefined,
        confirmationCode: formData.confirmationCode || undefined
      } as StayMetadata
    }

    onSave(activityData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Property Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Property Name *
        </label>
        <input
          type="text"
          value={formData.propertyName}
          onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Marriott Downtown"
          required
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          City *
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. New York"
          required
        />
      </div>

      {/* Check-in Day and Time - always on same line */}
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
            label="Check-in Day"
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Check-in Time
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

      {/* Check-out Day and Time - on same line */}
      {trip && (
        <div className="grid grid-cols-2 gap-2">
          <DaySelect
            trip={trip}
            value={formData.endDay ?? formData.day}
            onChange={(day) => setFormData(prev => ({ 
              ...prev, 
              endDay: day === prev.day ? undefined : day
            }))}
            label="Check-out Day"
            minDay={formData.day}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Check-out Time
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

      {/* Confirmation Code */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirmation Code
        </label>
        <input
          type="text"
          value={formData.confirmationCode}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmationCode: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. ABC123456"
        />
      </div>

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
            type: 'stay',
            status: formData.status,
            city: formData.city || undefined,
            day: formData.day
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

// Backward compatibility alias
export const HotelForm = StayForm
