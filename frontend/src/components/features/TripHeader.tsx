'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTripContext } from '@/contexts/TripContext'

interface Trip {
  id: string
  name: string
  color: string
}

interface TripHeaderProps {
  trip: Trip
  activityCount: number
}

const tripViews = [
  { id: 'timeline', label: 'Timeline', path: 'timeline' },
  { id: 'overview', label: 'Overview', path: 'overview' },
  { id: 'map', label: 'Map', path: 'map' }
]

export function TripHeader({ trip, activityCount }: TripHeaderProps) {
  const pathname = usePathname()
  const { updateTripName } = useTripContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(trip.name)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Extract current view from pathname
  const currentView = tripViews.find(view => pathname.includes(`/${view.path}`))?.id || 'timeline'

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Sync editValue when trip.name changes externally
  useEffect(() => {
    setEditValue(trip.name)
  }, [trip.name])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== trip.name) {
      updateTripName(trimmedValue)
    } else {
      setEditValue(trip.name) // Reset if empty or unchanged
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(trip.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  return (
    <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 outline-none px-0 py-0 min-w-0 w-full sm:min-w-[200px]"
            />
          ) : (
            <h1 
              onClick={handleStartEdit}
              className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 -mx-2 -my-1 rounded transition-colors truncate"
              title="Click to edit trip name"
            >
              {trip.name}
            </h1>
          )}
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: trip.color }}
          />
        </div>
        
        {/* Trip Sub-Navigation */}
        <nav className="flex flex-shrink-0 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tripViews.map((view) => {
            const isActive = currentView === view.id
            return (
              <Link
                key={view.id}
                href={`/trip/${trip.id}/${view.path}`}
                className={cn(
                  'px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {view.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
