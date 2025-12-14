'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Activity, Trip } from '@/types/simple'

interface TripContextType {
  selectedActivity: Activity | null
  setSelectedActivity: (activity: Activity | null) => void
  isCreatingActivity: boolean
  setIsCreatingActivity: (isCreating: boolean) => void
  trip: Trip | null
  setTrip: (trip: Trip | null) => void
  updateTripName: (name: string) => void
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Omit<Activity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isInternalNavigation, setIsInternalNavigation] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Handle URL-based activity selection (only for external URL changes, not internal navigation)
  useEffect(() => {
    // Skip if this is an internal navigation (user clicking within the app)
    if (isInternalNavigation) {
      setIsInternalNavigation(false)
      return
    }
    
    const activityId = searchParams.get('activity')
    if (activityId && activities.length > 0) {
      const activity = activities.find(a => a.id === activityId)
      if (activity && activity.id !== selectedActivity?.id) {
        setSelectedActivity(activity)
      }
    }
  }, [searchParams, activities])

  // Update URL when activity selection changes
  const handleActivitySelect = (activity: Activity | null) => {
    // Mark this as internal navigation to prevent the useEffect from re-selecting
    setIsInternalNavigation(true)
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
  const addActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setActivities(prevActivities => [...prevActivities, newActivity])
  }

  const updateActivity = (id: string, updates: Partial<Activity>) => {
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

  const updateTripName = (name: string) => {
    if (trip) {
      setTrip({ ...trip, name })
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
        updateTripName,
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
