'use client'

import { useState, useEffect } from 'react'
import type { Activity, FlightMetadata, ActivityStatus } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { FormActions } from '@/components/ui/form-actions'

interface FlightFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
}

export function FlightForm({ activity, onSave, onCancel, onDelete, defaultDay = 1 }: FlightFormProps) {
  const { trip } = useTripContext()
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    flightNumber: '',
    airline: '',
    status: 'draft' as ActivityStatus,
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as FlightMetadata || {}
      setFormData({
        from: metadata.from || '',
        to: metadata.to || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        flightNumber: metadata.flightNumber || '',
        airline: metadata.airline || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.from && formData.to) {
      let title = `Flight from ${formData.from} to ${formData.to}`
      if (formData.flightNumber) {
        title += ` - ${formData.flightNumber}`
      }
      return title
    }
    return 'Flight'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || '1',
      type: 'flight',
      title: generateTitle(),
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.from || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {
        from: formData.from || undefined,
        to: formData.to || undefined,
        flightNumber: formData.flightNumber || undefined,
        airline: formData.airline || undefined
      } as FlightMetadata
    }

    onSave(activityData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* From/To Fields */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            From *
          </label>
          <input
            type="text"
            value={formData.from}
            onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Departure city"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            To *
          </label>
          <input
            type="text"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Arrival city"
            required
          />
        </div>
      </div>

      {/* Departure Day and Time - always on same line */}
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
            label="Departure Day"
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Departure Time
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

      {/* Arrival Day and Time - on same line */}
      {trip && (
        <div className="grid grid-cols-2 gap-2">
          <DaySelect
            trip={trip}
            value={formData.endDay ?? formData.day}
            onChange={(day) => setFormData(prev => ({ 
              ...prev, 
              endDay: day === prev.day ? undefined : day
            }))}
            label="Arrival Day"
            minDay={formData.day}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arrival Time
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

      {/* Flight Number & Airline */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Flight Number
          </label>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, flightNumber: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g. AA123"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Airline
          </label>
          <input
            type="text"
            value={formData.airline}
            onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g. American Airlines"
          />
        </div>
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

      {/* Recommendations Section - only show if draft and we have enough data */}
      {formData.status === 'draft' && formData.from && formData.to && (
        <RecommendationsSection
          activity={{
            type: 'flight',
            status: formData.status,
            city: `${formData.from} to ${formData.to}`,
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
