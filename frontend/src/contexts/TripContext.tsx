'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { SimpleActivity, SimpleTrip } from '@/types/simple'

interface TripContextType {
  selectedActivity: SimpleActivity | null
  setSelectedActivity: (activity: SimpleActivity | null) => void
  trip: SimpleTrip | null
  setTrip: (trip: SimpleTrip | null) => void
  activities: SimpleActivity[]
  setActivities: (activities: SimpleActivity[]) => void
}

const TripContext = createContext<TripContextType | undefined>(undefined)

export function useTripContext() {
  const context = useContext(TripContext)
  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider')
  }
  return context
}

interface TripProviderProps {
  children: ReactNode
}

export function TripProvider({ children }: TripProviderProps) {
  const [selectedActivity, setSelectedActivity] = useState<SimpleActivity | null>(null)
  const [trip, setTrip] = useState<SimpleTrip | null>(null)
  const [activities, setActivities] = useState<SimpleActivity[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Handle URL-based activity selection
  useEffect(() => {
    const activityId = searchParams.get('activity')
    if (activityId && activities.length > 0) {
      const activity = activities.find(a => a.id === activityId)
      if (activity && activity.id !== selectedActivity?.id) {
        setSelectedActivity(activity)
      }
    }
  }, [searchParams, activities, selectedActivity?.id])

  // Update URL when activity selection changes
  const handleActivitySelect = (activity: SimpleActivity | null) => {
    setSelectedActivity(activity)
    
    const params = new URLSearchParams(searchParams.toString())
    if (activity) {
      params.set('activity', activity.id)
    } else {
      params.delete('activity')
    }
    
    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  return (
    <TripContext.Provider
      value={{
        selectedActivity,
        setSelectedActivity: handleActivitySelect,
        trip,
        setTrip,
        activities,
        setActivities,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}
