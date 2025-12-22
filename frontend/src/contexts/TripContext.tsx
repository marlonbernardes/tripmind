'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Activity, Trip, Suggestion } from '@/types/simple'
import { useToast } from '@/components/ui/toast'
import { tripService } from '@/lib/trip-service'
import { suggestionService } from '@/lib/suggestion-service'

interface TripContextType {
  selectedActivity: Activity | null
  setSelectedActivity: (activity: Activity | null) => void
  isCreatingActivity: boolean
  setIsCreatingActivity: (isCreating: boolean) => void
  creatingActivityDay: number | null
  startCreatingActivity: (day?: number) => void
  trip: Trip | null
  setTrip: (trip: Trip | null) => void
  updateTripName: (name: string) => void
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Omit<Activity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  deleteActivityWithUndo: (id: string) => void
  // Suggestions
  suggestions: Suggestion[]
  selectedSuggestion: Suggestion | null
  setSelectedSuggestion: (suggestion: Suggestion | null) => void
  dismissSuggestion: (id: string) => void
  refreshSuggestions: () => void
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
  const [creatingActivityDay, setCreatingActivityDay] = useState<number | null>(null)
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

  // Pending deletion tracking for undo functionality
  const pendingDeletionRef = useRef<{
    activity: Activity
    timeoutId: NodeJS.Timeout
  } | null>(null)

  const { showToast, hideToast } = useToast()

  const deleteActivityWithUndo = useCallback((id: string) => {
    // Find the activity to delete
    const activityToDelete = activities.find(a => a.id === id)
    if (!activityToDelete) return

    // Clear any existing pending deletion
    if (pendingDeletionRef.current) {
      clearTimeout(pendingDeletionRef.current.timeoutId)
      // Commit the previous pending deletion
      tripService.deleteActivity(pendingDeletionRef.current.activity.id)
    }

    // Optimistically remove from UI
    setActivities(prevActivities => 
      prevActivities.filter(activity => activity.id !== id)
    )

    // Clear selected activity if it's the one being deleted
    if (selectedActivity?.id === id) {
      handleActivitySelect(null)
    }

    // Set up the delayed permanent deletion
    const timeoutId = setTimeout(() => {
      // Actually delete from service
      tripService.deleteActivity(id)
      pendingDeletionRef.current = null
    }, 5000)

    pendingDeletionRef.current = {
      activity: activityToDelete,
      timeoutId
    }

    // Show toast with undo action
    showToast({
      message: 'Activity deleted',
      action: {
        label: 'Undo',
        onClick: () => {
          // Cancel the pending deletion
          if (pendingDeletionRef.current?.activity.id === id) {
            clearTimeout(pendingDeletionRef.current.timeoutId)
            // Restore the activity
            setActivities(prev => [...prev, activityToDelete])
            pendingDeletionRef.current = null
          }
        }
      },
      duration: 5000
    })
  }, [activities, selectedActivity, showToast])

  const updateTripName = (name: string) => {
    if (trip) {
      setTrip({ ...trip, name })
    }
  }

  // ==================== SUGGESTIONS ====================
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestionState] = useState<Suggestion | null>(null)

  // Regenerate suggestions when trip or activities change
  const refreshSuggestions = useCallback(async () => {
    if (!trip) {
      setSuggestions([])
      return
    }
    
    const newSuggestions = await suggestionService.getSuggestions(trip.id, trip, activities)
    setSuggestions(newSuggestions)
    
    // Clear selected suggestion if it no longer exists
    if (selectedSuggestion && !newSuggestions.find(s => s.id === selectedSuggestion.id)) {
      setSelectedSuggestionState(null)
    }
  }, [trip, activities, selectedSuggestion])

  // Refresh suggestions when activities change
  useEffect(() => {
    refreshSuggestions()
  }, [activities, trip])

  // Handle suggestion selection (clears activity selection)
  const handleSuggestionSelect = (suggestion: Suggestion | null) => {
    setSelectedSuggestionState(suggestion)
    if (suggestion) {
      // Clear activity selection when a suggestion is selected
      setSelectedActivity(null)
      setIsCreatingActivity(false)
    }
  }

  // Handle activity selection override to clear suggestion and creating mode
  const handleActivitySelectWithSuggestionClear = (activity: Activity | null) => {
    handleActivitySelect(activity)
    if (activity) {
      // Clear suggestion selection and creating mode when an activity is selected
      setSelectedSuggestionState(null)
      setIsCreatingActivity(false)
    }
  }

  // Dismiss a suggestion
  const dismissSuggestion = useCallback(async (id: string) => {
    await suggestionService.dismissSuggestion(id)
    setSuggestions(prev => prev.filter(s => s.id !== id))
    
    // Clear selected suggestion if it's the one being dismissed
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestionState(null)
    }
  }, [selectedSuggestion])

  // Start creating a new activity, optionally with a pre-selected day
  const startCreatingActivity = useCallback((day?: number) => {
    setSelectedActivity(null)
    setSelectedSuggestionState(null)
    setCreatingActivityDay(day ?? null)
    setIsCreatingActivity(true)
  }, [])

  return (
    <TripContext.Provider
      value={{
        selectedActivity,
        setSelectedActivity: handleActivitySelectWithSuggestionClear,
        isCreatingActivity,
        setIsCreatingActivity,
        creatingActivityDay,
        startCreatingActivity,
        trip,
        setTrip,
        updateTripName,
        activities,
        setActivities,
        addActivity,
        updateActivity,
        deleteActivity,
        deleteActivityWithUndo,
        // Suggestions
        suggestions,
        selectedSuggestion,
        setSelectedSuggestion: handleSuggestionSelect,
        dismissSuggestion,
        refreshSuggestions,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}
