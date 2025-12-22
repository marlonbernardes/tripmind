'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings, Calendar, Clock, AlertTriangle, Check, Target, Timer } from 'lucide-react'
import type { Trip, TripPacing, TripInterest } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { useTripContext } from '@/contexts/TripContext'
import { getTripDuration, MAX_TRIP_DURATION } from '@/lib/date-service'
import { tripService } from '@/lib/trip-service'
import { INTERESTS, PACING_OPTIONS } from '@/lib/interests-config'

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

// Helper to create initial form data from a trip
function createInitialFormData(trip: Trip | null) {
  if (!trip) {
    return {
      dateMode: 'fixed' as 'fixed' | 'flexible',
      startDate: '',
      endDate: '',
      duration: 7,
      interests: [] as TripInterest[],
      pacing: 'moderate' as TripPacing,
    }
  }
  
  if (isFixedTrip(trip)) {
    return {
      dateMode: trip.dateMode,
      startDate: trip.startDate,
      endDate: trip.endDate,
      duration: getTripDuration(trip),
      interests: trip.interests,
      pacing: trip.pacing,
    }
  } else {
    return {
      dateMode: trip.dateMode,
      startDate: '',
      endDate: '',
      duration: trip.duration,
      interests: trip.interests,
      pacing: trip.pacing,
    }
  }
}

export function TripConfigTab({ onClose }: TripConfigTabProps) {
  const { trip, setTrip, activities, clearPanel } = useTripContext()
  
  // Initialize form data from trip immediately to prevent flicker
  const [formData, setFormData] = useState(() => createInitialFormData(trip))
  
  // Track if we've initialized from the trip
  const [initialized, setInitialized] = useState(!!trip)

  // Calculate minimum duration based on activities
  const minDuration = useMemo(() => getMinAllowedDuration(activities), [activities])
  
  // Check if current duration is below minimum
  const currentFormDuration = formData.dateMode === 'fixed' && formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : formData.duration
  
  // Duration is invalid only if it's LESS than minDuration (not equal)
  const isDurationInvalid = currentFormDuration < minDuration

  // Re-initialize form if trip changes (e.g., navigating to different trip)
  useEffect(() => {
    if (trip && !initialized) {
      setFormData(createInitialFormData(trip))
      setInitialized(true)
    }
  }, [trip, initialized])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!trip) return
    
    // Prevent saving if duration is invalid
    if (isDurationInvalid) return

    setIsSaving(true)
    try {
      const updatedTrip = await tripService.updateTrip(trip.id, {
        dateMode: formData.dateMode,
        ...(formData.dateMode === 'fixed'
          ? { startDate: formData.startDate, endDate: formData.endDate }
          : { duration: formData.duration }
        ),
        interests: formData.interests,
        pacing: formData.pacing,
      })

      setTrip(updatedTrip)
      clearPanel() // Clear any selected activity to prevent stale data
      onClose?.()
    } catch (error) {
      console.error('Failed to save trip:', error)
      // In a real app, show error toast here
    } finally {
      setIsSaving(false)
    }
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

  const toggleInterest = (id: TripInterest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }))
  }

  const handlePacingChange = (pacing: TripPacing) => {
    setFormData(prev => ({ ...prev, pacing }))
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

      {/* Interests Section */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
          <Target className="w-3 h-3" />
          Interests
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Used to suggest relevant activities
        </p>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map(interest => {
            const Icon = interest.icon
            const isSelected = formData.interests.includes(interest.id)
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`relative inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{interest.name}</span>
                {isSelected && (
                  <Check className="w-3 h-3 ml-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pacing Section */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Pacing
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Controls activity suggestion density
        </p>
        <div className="flex gap-2">
          {PACING_OPTIONS.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePacingChange(option.id)}
                className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formData.pacing === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{option.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isDurationInvalid || isSaving}
          className={`w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
            isDurationInvalid || isSaving
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
