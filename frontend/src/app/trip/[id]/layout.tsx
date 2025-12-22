'use client'

import { ReactNode, useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GripVertical } from 'lucide-react'
import { TripProvider, useTripContext } from '@/contexts/TripContext'
import { TripHeader } from '@/components/features/TripHeader'
import { TripSidePanel } from '@/components/features/TripSidePanel'
import { tripService } from '@/lib/trip-service'

// Constants for panel sizing
const MIN_PANEL_WIDTH = 320
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 400
const STORAGE_KEY = 'tripmind-side-panel-width'

function TripLayoutContent({ children }: { children: ReactNode }) {
  const params = useParams()
  const tripId = params.id as string
  
  const { trip, setTrip, activities, setActivities } = useTripContext()
  const [isLoading, setIsLoading] = useState(true)
  
  // Panel width state with localStorage persistence
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // External tab trigger for side panel (used by TripHeader -> Preferences link)
  const [externalTabTrigger, setExternalTabTrigger] = useState<'config' | null>(null)

  // Load trip and activities data from service
  useEffect(() => {
    async function loadTripData() {
      setIsLoading(true)
      try {
        const [tripData, activitiesData] = await Promise.all([
          tripService.getTrip(tripId),
          tripService.getActivities(tripId)
        ])
        
        if (tripData) {
          setTrip(tripData)
          setActivities(activitiesData)
        } else {
          setTrip(null)
          setActivities([])
        }
      } catch (error) {
        console.error('Failed to load trip:', error)
        setTrip(null)
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTripData()
  }, [tripId, setTrip, setActivities])
  
  // Load saved width from localStorage on mount and track viewport
  useEffect(() => {
    // Load saved width
    const savedWidth = localStorage.getItem(STORAGE_KEY)
    if (savedWidth) {
      const width = parseInt(savedWidth, 10)
      if (width >= MIN_PANEL_WIDTH && width <= MAX_PANEL_WIDTH) {
        setPanelWidth(width)
      }
    }
    
    // Track viewport for responsive behavior
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])
  
  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])
  
  // Handle resize movement and release
  useEffect(() => {
    if (!isResizing) return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX
      const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth))
      setPanelWidth(clampedWidth)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, panelWidth.toString())
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    // Add cursor style to body during resize
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, panelWidth])
  
  // Handle open preferences - called from TripHeader
  const handleOpenPreferences = useCallback(() => {
    setExternalTabTrigger('config')
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Trip not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            The trip you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Link 
            href="/trips"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Trips
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-full bg-white dark:bg-gray-950">
      {/* Trip Header with Sub-Navigation - auto height */}
      <TripHeader trip={trip} activityCount={activities.length} onOpenPreferences={handleOpenPreferences} />

      {/* Content Area with Side Panel - fills remaining space (1fr) */}
      <div ref={containerRef} className="overflow-hidden flex flex-row">
        {/* Left Panel - Main Content (flexible width) */}
        <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>

        {/* Resize Handle - Desktop only */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex w-1 h-full cursor-col-resize bg-gray-200 dark:bg-gray-800 hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors flex-shrink-0 items-center justify-center group"
        >
          <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right Panel - Side Panel (resizable width on desktop, full width on mobile) */}
        <div 
          className="h-full flex-shrink-0"
          style={{ width: isDesktop ? `${panelWidth}px` : '100%' }}
        >
          <TripSidePanel 
            externalTabTrigger={externalTabTrigger}
            onExternalTabConsumed={() => setExternalTabTrigger(null)}
          />
        </div>
      </div>
    </div>
  )
}

export default function TripIdLayout({ children }: { children: ReactNode }) {
  return (
    <TripProvider>
      <TripLayoutContent>
        {children}
      </TripLayoutContent>
    </TripProvider>
  )
}
