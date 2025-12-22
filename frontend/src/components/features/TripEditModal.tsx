'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Palette } from 'lucide-react'
import type { Trip } from '@/types/simple'
import { tripService } from '@/lib/trip-service'
import { useTripContext } from '@/contexts/TripContext'

// Preset trip colors (same as TripConfigTab)
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

interface TripEditModalProps {
  trip: Trip
  isOpen: boolean
  onClose: () => void
}

export function TripEditModal({ trip, isOpen, onClose }: TripEditModalProps) {
  const { setTrip } = useTripContext()
  const [name, setName] = useState(trip.name)
  const [color, setColor] = useState(trip.color)
  const [isSaving, setIsSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens with new trip data
  useEffect(() => {
    if (isOpen) {
      setName(trip.name)
      setColor(trip.color)
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, trip.name, trip.color])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSave = async () => {
    if (!name.trim()) return
    
    setIsSaving(true)
    try {
      const updatedTrip = await tripService.updateTrip(trip.id, {
        name: name.trim(),
        color,
      })
      setTrip(updatedTrip)
      onClose()
    } catch (error) {
      console.error('Failed to save trip:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Edit Trip
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Trip Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trip Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="My Trip"
            />
          </div>

          {/* Trip Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Palette className="w-3 h-3 inline mr-1" />
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {TRIP_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              !name.trim() || isSaving
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
