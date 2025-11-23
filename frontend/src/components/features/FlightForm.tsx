'use client'

import { useState, useEffect } from 'react'
import type { SimpleActivity, FlightMetadata } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'

interface FlightFormProps {
  activity?: SimpleActivity
  onSave: (activityData: Omit<SimpleActivity, 'id'>) => void
  onCancel: () => void
}

export function FlightForm({ activity, onSave, onCancel }: FlightFormProps) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    start: '',
    end: '',
    flightNumberOutbound: '',
    flightNumberInbound: '',
    airline: '',
    status: 'planned' as 'planned' | 'booked',
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as FlightMetadata || {}
      setFormData({
        from: metadata.from || '',
        to: metadata.to || '',
        start: activity.start,
        end: activity.end || '',
        flightNumberOutbound: metadata.flightNumberOutbound || '',
        flightNumberInbound: metadata.flightNumberInbound || '',
        airline: metadata.airline || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.from && formData.to) {
      let title = `Flight from ${formData.from} to ${formData.to}`
      if (formData.flightNumberOutbound) {
        title += ` - ${formData.flightNumberOutbound}`
      }
      return title
    }
    return 'Flight'
  }

  const inferLocation = () => {
    return formData.from || ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<SimpleActivity, 'id'> = {
      tripId: activity?.tripId || '1', // Default trip ID for now
      type: 'flight',
      title: generateTitle(),
      start: formData.start,
      end: formData.end || undefined,
      city: inferLocation(),
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {
        from: formData.from,
        to: formData.to,
        flightNumberOutbound: formData.flightNumberOutbound || undefined,
        flightNumberInbound: formData.flightNumberInbound || undefined,
        airline: formData.airline || undefined
      }
    }

    onSave(activityData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* From/To Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From *
          </label>
          <input
            type="text"
            value={formData.from}
            onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Departure city"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To *
          </label>
          <input
            type="text"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Arrival city"
            required
          />
        </div>
      </div>

      {/* Departure/Arrival Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Departure *
          </label>
          <input
            type="datetime-local"
            value={formData.start}
            onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arrival
          </label>
          <input
            type="datetime-local"
            value={formData.end}
            onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Flight Numbers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Outbound Flight #
          </label>
          <input
            type="text"
            value={formData.flightNumberOutbound}
            onChange={(e) => setFormData(prev => ({ ...prev, flightNumberOutbound: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g. AA123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Return Flight #
          </label>
          <input
            type="text"
            value={formData.flightNumberInbound}
            onChange={(e) => setFormData(prev => ({ ...prev, flightNumberInbound: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g. AA456"
          />
        </div>
      </div>

      {/* Airline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Airline
        </label>
        <input
          type="text"
          value={formData.airline}
          onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. American Airlines"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="planned"
              checked={formData.status === 'planned'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'planned' | 'booked' }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Planned</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="booked"
              checked={formData.status === 'booked'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'planned' | 'booked' }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      {/* Recommendations Section - only show if planned and we have enough data */}
      {formData.status === 'planned' && formData.from && formData.to && formData.start && (
        <RecommendationsSection
          activity={{
            type: 'flight',
            status: formData.status,
            city: `${formData.from} to ${formData.to}`,
            start: formData.start,
            end: formData.end
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save Flight
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
