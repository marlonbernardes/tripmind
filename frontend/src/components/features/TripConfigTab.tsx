'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings, Calendar, Clock, Palette, AlertTriangle } from 'lucide-react'
import type { Trip, FixedTrip, FlexibleTrip } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { useTripContext } from '@/contexts/TripContext'
import { getTripDuration, MAX_TRIP_DURATION } from '@/lib/date-service'

// Preset trip colors
const TRIP_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
]

interface TripConfigTabProps {
  onClose?: () => void
}

/**
 * Calculate the minimum allowed duration based on activities
 * Returns the highest day number used by any activity
 */
function getMinAllowedDuration(activities: { day: number; endDay?: number }[]): number {
  if (activities.length === 0) return 1
  
  return Math.max(
    ...activities.map(a => Math.max(a.day, a.endDay || 0))
  )
}

export function TripConfigTab({ onClose }: TripConfigTabProps) {
  const { trip, setTrip, activities, setSelectedActivity } = useTripContext()
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    dateMode: 'flexible' as 'fixed' | 'flexible',
    // Fixed trip fields
    startDate: '',
    endDate: '',
    // Flexible trip fields
    duration: 7,
  })

  // Calculate minimum duration based on activities
  const minDuration = useMemo(() => getMinAllowedDuration(activities), [activities])
  
  // Check if current duration is below minimum
  const currentFormDuration = formData.dateMode === 'fixed' && formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : formData.duration
  
  // Duration is invalid only if it's LESS than minDuration (not equal)
  const isDurationInvalid = currentFormDuration < minDuration

  // Initialize form from trip
  useEffect(() => {
    if (trip) {
      const baseData = {
        name: trip.name,
        color: trip.color,
        dateMode: trip.dateMode,
      }
      
      if (isFixedTrip(trip)) {
        setFormData({
          ...baseData,
          startDate: trip.startDate,
          endDate: trip.endDate,
          duration: getTripDuration(trip),
        })
      } else {
        setFormData({
          ...baseData,
          startDate: '',
          endDate: '',
          duration: trip.duration,
        })
      }
    }
  }, [trip])

  const handleSave = () => {
    if (!trip) return
    
    // Prevent saving if duration is invalid
    if (isDurationInvalid) return

    let updatedTrip: Trip
    
    if (formData.dateMode === 'fixed') {
      updatedTrip = {
        id: trip.id,
        name: formData.name,
        color: formData.color,
        dateMode: 'fixed',
        startDate: formData.startDate,
        endDate: formData.endDate,
      } as FixedTrip
    } else {
      updatedTrip = {
        id: trip.id,
        name: formData.name,
        color: formData.color,
        dateMode: 'flexible',
        duration: formData.duration,
      } as FlexibleTrip
    }

    setTrip(updatedTrip)
    setSelectedActivity(null) // Clear any selected activity to prevent stale data
    onClose?.()
  }

  const handleDateModeChange = (mode: 'fixed' | 'flexible') => {
    setFormData(prev => ({
      ...prev,
      dateMode: mode,
      // Set reasonable defaults when switching modes
      ...(mode === 'fixed' && !prev.startDate ? {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (prev.duration - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      } : {}),
    }))
  }

  const handleDurationChange = (newDuration: number) => {
    // Allow any value - validation happens at save time
    setFormData(prev => ({ ...prev, duration: newDuration }))
  }

  const handleEndDateChange = (endDate: string) => {
    // Allow any end date - validation happens at save time
    setFormData(prev => ({ ...prev, endDate }))
  }

  const handleStartDateChange = (startDate: string) => {
    setFormData(prev => ({ ...prev, startDate }))
  }

  if (!trip) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No trip selected</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Trip Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Trip Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="My Trip"
        />
      </div>

      {/* Trip Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          <Palette className="w-3 h-3 inline mr-1" />
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {TRIP_COLORS.map(color => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
              className={`w-7 h-7 rounded-full transition-all ${
                formData.color === color.value
                  ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Date Mode Toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          <Calendar className="w-3 h-3 inline mr-1" />
          Trip Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDateModeChange('flexible')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              formData.dateMode === 'flexible'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Flexible
          </button>
          <button
            type="button"
            onClick={() => handleDateModeChange('fixed')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              formData.dateMode === 'fixed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Fixed Dates
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.dateMode === 'flexible' 
            ? 'Plan by days without specific dates' 
            : 'Set exact travel dates'}
        </p>
      </div>

      {/* Date Mode Specific Fields */}
      {formData.dateMode === 'fixed' ? (
        /* Fixed Date Fields */
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          {formData.startDate && formData.endDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
            </p>
          )}
        </div>
      ) : (
        /* Flexible Date Fields */
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={MAX_TRIP_DURATION}
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-center">
                {formData.duration}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Callout - shown above save button when duration is invalid */}
      {isDurationInvalid && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Activities exist on Day {minDuration}. Remove or reschedule them before reducing the trip to {currentFormDuration} {currentFormDuration === 1 ? 'day' : 'days'}.
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isDurationInvalid}
          className={`w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
            isDurationInvalid
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
