'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Activity, Trip, Suggestion, SidePanelState, ActivityContext } from '@/types/simple'
import { useToast } from '@/components/ui/toast'
import { tripService } from '@/lib/trip-service'
import { suggestionService } from '@/lib/suggestion-service'

interface TripContextType {
  // Side panel state - single source of truth
  sidePanelState: SidePanelState
  
  // Transition functions (simplified: no view mode, always edit)
  selectActivity: (activity: Activity) => void
  createActivity: (context?: ActivityContext) => void
  viewSuggestion: (suggestion: Suggestion) => void
  clearPanel: () => void
  
  // Trip data
  trip: Trip | null
  setTrip: (trip: Trip | null) => void
  updateTripName: (name: string) => void
  
  // Activities
  activities: Activity[]
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Omit<Activity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  deleteActivityWithUndo: (id: string) => void
  
  // Suggestions
  suggestions: Suggestion[]
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
  // ==================== SIDE PANEL STATE ====================
  const [sidePanelState, setSidePanelState] = useState<SidePanelState>({ mode: 'empty' })
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  
  // One-time URL initialization flag
  const hasInitializedFromUrl = useRef(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // ==================== URL SYNC (Write-only) ====================
  // URL reflects state but doesn't control it (except on initial load)
  
  const updateUrlWithActivity = useCallback((activityId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('activity', activityId)
    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }, [searchParams, pathname, router])

  const clearActivityFromUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('activity')
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [searchParams, pathname, router])

  // One-time initialization from URL on first load
  useEffect(() => {
    if (hasInitializedFromUrl.current) return
    if (activities.length === 0) return
    
    const activityId = searchParams.get('activity')
    if (activityId) {
      const activity = activities.find(a => a.id === activityId)
      if (activity) {
        setSidePanelState({ mode: 'editing', activity })
      }
    }
    hasInitializedFromUrl.current = true
  }, [activities, searchParams])

  // ==================== TRANSITION FUNCTIONS ====================
  
  // Simplified: always go to edit mode (no read-only view)
  const selectActivity = useCallback((activity: Activity) => {
    updateUrlWithActivity(activity.id)
    setSidePanelState({ mode: 'editing', activity })
  }, [updateUrlWithActivity])

  const createActivity = useCallback((context?: ActivityContext) => {
    clearActivityFromUrl()
    setSidePanelState({ mode: 'creating', context })
  }, [clearActivityFromUrl])

  const viewSuggestion = useCallback((suggestion: Suggestion) => {
    clearActivityFromUrl()
    setSidePanelState({ mode: 'suggestion', suggestion })
  }, [clearActivityFromUrl])

  const clearPanel = useCallback(() => {
    clearActivityFromUrl()
    setSidePanelState({ mode: 'empty' })
  }, [clearActivityFromUrl])

  // ==================== ACTIVITY CRUD ====================

  const addActivity = useCallback((activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setActivities(prevActivities => [...prevActivities, newActivity])
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prevActivities => 
      prevActivities.map(activity => 
        activity.id === id 
          ? { ...activity, ...updates }
          : activity
      )
    )
    
    // Update side panel if editing this activity
    setSidePanelState(prev => {
      if (prev.mode === 'editing' && prev.activity.id === id) {
        return { ...prev, activity: { ...prev.activity, ...updates } }
      }
      return prev
    })
  }, [])

  const deleteActivity = useCallback((id: string) => {
    setActivities(prevActivities => 
      prevActivities.filter(activity => activity.id !== id)
    )
    
    // Clear panel if editing deleted activity
    setSidePanelState(prev => {
      if (prev.mode === 'editing' && prev.activity.id === id) {
        return { mode: 'empty' }
      }
      return prev
    })
  }, [])

  // Pending deletion tracking for undo functionality
  const pendingDeletionRef = useRef<{
    activity: Activity
    timeoutId: NodeJS.Timeout
  } | null>(null)

  const { showToast } = useToast()

  const deleteActivityWithUndo = useCallback((id: string) => {
    const activityToDelete = activities.find(a => a.id === id)
    if (!activityToDelete) return

    // Clear any existing pending deletion
    if (pendingDeletionRef.current) {
      clearTimeout(pendingDeletionRef.current.timeoutId)
      tripService.deleteActivity(pendingDeletionRef.current.activity.id)
    }

    // Optimistically remove from UI
    setActivities(prevActivities => 
      prevActivities.filter(activity => activity.id !== id)
    )

    // Clear panel if editing deleted activity
    setSidePanelState(prev => {
      if (prev.mode === 'editing' && prev.activity.id === id) {
        clearActivityFromUrl()
        return { mode: 'empty' }
      }
      return prev
    })

    // Set up the delayed permanent deletion
    const timeoutId = setTimeout(() => {
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
          if (pendingDeletionRef.current?.activity.id === id) {
            clearTimeout(pendingDeletionRef.current.timeoutId)
            setActivities(prev => [...prev, activityToDelete])
            pendingDeletionRef.current = null
          }
        }
      },
      duration: 5000
    })
  }, [activities, showToast, clearActivityFromUrl])

  const updateTripName = useCallback((name: string) => {
    if (trip) {
      setTrip({ ...trip, name })
    }
  }, [trip])

  // ==================== SUGGESTIONS ====================

  const refreshSuggestions = useCallback(async () => {
    if (!trip) {
      setSuggestions([])
      return
    }
    
    const newSuggestions = await suggestionService.getSuggestions(trip.id, trip, activities)
    setSuggestions(newSuggestions)
    
    // Clear selected suggestion if it no longer exists
    if (sidePanelState.mode === 'suggestion') {
      const stillExists = newSuggestions.find(s => s.id === sidePanelState.suggestion.id)
      if (!stillExists) {
        setSidePanelState({ mode: 'empty' })
      }
    }
  }, [trip, activities, sidePanelState])

  // Refresh suggestions when activities change
  useEffect(() => {
    refreshSuggestions()
  }, [activities, trip])

  const dismissSuggestion = useCallback(async (id: string) => {
    await suggestionService.dismissSuggestion(id)
    setSuggestions(prev => prev.filter(s => s.id !== id))
    
    // Clear panel if viewing dismissed suggestion
    if (sidePanelState.mode === 'suggestion' && sidePanelState.suggestion.id === id) {
      setSidePanelState({ mode: 'empty' })
    }
  }, [sidePanelState])

  // ==================== CONTEXT VALUE ====================

  return (
    <TripContext.Provider
      value={{
        // Side panel state
        sidePanelState,
        selectActivity,
        createActivity,
        viewSuggestion,
        clearPanel,
        
        // Trip data
        trip,
        setTrip,
        updateTripName,
        
        // Activities
        activities,
        setActivities,
        addActivity,
        updateActivity,
        deleteActivity,
        deleteActivityWithUndo,
        
        // Suggestions
        suggestions,
        dismissSuggestion,
        refreshSuggestions,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}
