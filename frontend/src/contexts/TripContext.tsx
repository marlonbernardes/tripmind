'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { SimpleActivity, SimpleTrip } from '@/types/simple'

interface TripContextType {
  selectedActivity: SimpleActivity | null
  setSelectedActivity: (activity: SimpleActivity | null) => void
  isCreatingActivity: boolean
  setIsCreatingActivity: (isCreating: boolean) => void
  trip: SimpleTrip | null
  setTrip: (trip: SimpleTrip | null) => void
  activities: SimpleActivity[]
  setActivities: (activities: SimpleActivity[]) => void
  addActivity: (activity: Omit<SimpleActivity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<SimpleActivity>) => void
  deleteActivity: (id: string) => void
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
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
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

  // CRUD methods for activities
  const addActivity = (activityData: Omit<SimpleActivity, 'id'>) => {
    const newActivity: SimpleActivity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setActivities(prevActivities => [...prevActivities, newActivity])
  }

  const updateActivity = (id: string, updates: Partial<SimpleActivity>) => {
    setActivities(prevActivities => 
      prevActivities.map(activity => 
        activity.id === id 
          ? { ...activity, ...updates }
          : activity
      )
    )
    
    // Update selected activity if it's the one being edited
    if (selectedActivity?.id === id) {
      setSelectedActivity(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteActivity = (id: string) => {
    setActivities(prevActivities => 
      prevActivities.filter(activity => activity.id !== id)
    )
    
    // Clear selected activity if it's the one being deleted
    if (selectedActivity?.id === id) {
      setSelectedActivity(null)
    }
  }

  return (
    <TripContext.Provider
      value={{
        selectedActivity,
        setSelectedActivity: handleActivitySelect,
        isCreatingActivity,
        setIsCreatingActivity,
        trip,
        setTrip,
        activities,
        setActivities,
        addActivity,
        updateActivity,
        deleteActivity,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}
