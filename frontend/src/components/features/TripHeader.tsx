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
    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full max-w-full overflow-hidden">
      {/* Mobile Layout - 2 rows */}
      <div className="md:hidden">
        {/* Row 1: Centered Trip Name */}
        <div className="flex items-center justify-center gap-2 px-3 py-2">
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: trip.color }}
          />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 outline-none px-0 py-0 text-center max-w-[200px]"
            />
          ) : (
            <h1 
              onClick={handleStartEdit}
              className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 py-0.5 rounded transition-colors truncate max-w-[200px]"
              title="Click to edit trip name"
            >
              {trip.name}
            </h1>
          )}
        </div>
        
        {/* Row 2: Full-width Navigation */}
        <nav className="flex w-full bg-gray-100 dark:bg-gray-800">
          {tripViews.map((view) => {
            const isActive = currentView === view.id
            return (
              <Link
                key={view.id}
                href={`/trip/${trip.id}/${view.path}`}
                className={cn(
                  'flex-1 text-center py-2 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {view.label}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Desktop Layout - Single row */}
      <div className="hidden md:block px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: trip.color }}
            />
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="text-base font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 outline-none px-0 py-0 min-w-[180px]"
              />
            ) : (
              <h1 
                onClick={handleStartEdit}
                className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded transition-colors truncate"
                title="Click to edit trip name"
              >
                {trip.name}
              </h1>
            )}
          </div>
          
          {/* Trip Sub-Navigation */}
          <nav className="flex flex-shrink-0 gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
            {tripViews.map((view) => {
              const isActive = currentView === view.id
              return (
                <Link
                  key={view.id}
                  href={`/trip/${trip.id}/${view.path}`}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap',
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
    </div>
  )
}
