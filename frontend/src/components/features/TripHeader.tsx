'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

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
  
  // Extract current view from pathname
  const currentView = tripViews.find(view => pathname.includes(`/${view.path}`))?.id || 'timeline'
  
  return (
    <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {trip.name}
            </h1>
            <div 
