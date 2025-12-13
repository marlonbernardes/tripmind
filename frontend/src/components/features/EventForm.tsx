'use client'

import { useState, useEffect } from 'react'
import type { SimpleActivity, EventMetadata } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'

interface EventFormProps {
  activity?: SimpleActivity
  onSave: (activityData: Omit<SimpleActivity, 'id'>) => void
  onCancel: () => void
}

export function EventForm({ activity, onSave, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    venue: '',
    ticketLink: '',
    organizer: '',
    status: 'planned' as 'planned' | 'booked',
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as EventMetadata || {}
      setFormData({
        title: activity.title,
        start: activity.start,
        end: activity.end || '',
        location: activity.city || '',
        venue: metadata.venue || '',
        ticketLink: metadata.ticketLink || '',
        organizer: metadata.organizer || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<SimpleActivity, 'id'> = {
      tripId: activity?.tripId || '1', // Default trip ID for now
      type: 'event',
      title: formData.title,
      start: formData.start,
      end: formData.end || undefined,
      city: formData.location,
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {
        venue: formData.venue || undefined,
        ticketLink: formData.ticketLink || undefined,
        organizer: formData.organizer || undefined
      }
    }

    onSave(activityData)
  }

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

      {/* Start/End Times */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start *
          </label>
          <input
            type="datetime-local"
            value={formData.start}
            onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            End
          </label>
          <input
            type="datetime-local"
            value={formData.end}
            onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Venue
        </label>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Madison Square Garden"
        />
      </div>

      {/* Organizer */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Organizer
        </label>
        <input
          type="text"
          value={formData.organizer}
          onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Live Nation"
        />
      </div>

      {/* Ticket Link */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ticket Link
        </label>
        <input
          type="url"
          value={formData.ticketLink}
          onChange={(e) => setFormData(prev => ({ ...prev, ticketLink: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="https://ticketmaster.com/..."
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
              value="planned"
              checked={formData.status === 'planned'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'planned' | 'booked' }))}
              className="mr-1.5"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Planned</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="booked"
              checked={formData.status === 'booked'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'planned' | 'booked' }))}
              className="mr-1.5"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Booked</span>
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

      {/* Recommendations Section - only show if planned and we have enough data */}
      {formData.status === 'planned' && formData.location && formData.start && (
        <RecommendationsSection
          activity={{
            type: 'event',
            status: formData.status,
            city: formData.location,
            start: formData.start,
            end: formData.end
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3">
        <button
          type="submit"
          className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
