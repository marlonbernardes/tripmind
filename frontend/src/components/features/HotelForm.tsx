'use client'

import { useState, useEffect } from 'react'
import type { SimpleActivity, HotelMetadata } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'

interface HotelFormProps {
  activity?: SimpleActivity
  onSave: (activityData: Omit<SimpleActivity, 'id'>) => void
  onCancel: () => void
}

export function HotelForm({ activity, onSave, onCancel }: HotelFormProps) {
  const [formData, setFormData] = useState({
    hotelName: '',
    city: '',
    checkIn: '',
    checkOut: '',
    hotelLink: '',
    roomType: '',
    confirmationCode: '',
    status: 'planned' as 'planned' | 'booked',
    notes: ''
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as HotelMetadata || {}
      setFormData({
        hotelName: metadata.hotelName || '',
        city: activity.city || '',
        checkIn: activity.start,
        checkOut: activity.end || '',
        hotelLink: metadata.hotelLink || '',
        roomType: metadata.roomType || '',
        confirmationCode: metadata.confirmationCode || '',
        status: activity.status,
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.hotelName) {
      return `Hotel: ${formData.hotelName}`
    }
    return 'Hotel Stay'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<SimpleActivity, 'id'> = {
      tripId: activity?.tripId || '1', // Default trip ID for now
      type: 'hotel',
      title: generateTitle(),
      start: formData.checkIn,
      end: formData.checkOut || undefined,
      city: formData.city,
      status: formData.status,
      notes: formData.notes || undefined,
      metadata: {
        hotelName: formData.hotelName,
        hotelLink: formData.hotelLink || undefined,
        roomType: formData.roomType || undefined,
        confirmationCode: formData.confirmationCode || undefined
      }
    }

    onSave(activityData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hotel Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hotel Name *
        </label>
        <input
          type="text"
          value={formData.hotelName}
          onChange={(e) => setFormData(prev => ({ ...prev, hotelName: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Marriott Downtown"
          required
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          City *
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. New York"
          required
        />
      </div>

      {/* Check-in/Check-out */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-in *
          </label>
          <input
            type="datetime-local"
            value={formData.checkIn}
            onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-out
          </label>
          <input
            type="datetime-local"
            value={formData.checkOut}
            onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Room Type
        </label>
        <input
          type="text"
          value={formData.roomType}
          onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. Deluxe King Room"
        />
      </div>

      {/* Hotel Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hotel Website
        </label>
        <input
          type="url"
          value={formData.hotelLink}
          onChange={(e) => setFormData(prev => ({ ...prev, hotelLink: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="https://hotel-website.com"
        />
      </div>

      {/* Confirmation Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirmation Code
        </label>
        <input
          type="text"
          value={formData.confirmationCode}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmationCode: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g. ABC123456"
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
      {formData.status === 'planned' && formData.city && formData.checkIn && (
        <RecommendationsSection
          activity={{
            type: 'hotel',
            status: formData.status,
            city: formData.city,
            start: formData.checkIn,
            end: formData.checkOut
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save Hotel
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
