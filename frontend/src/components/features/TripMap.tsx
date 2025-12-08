'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity } from '@/types/simple'
import { cn } from '@/lib/utils'
import { getActivityColor, activityTypeConfig, allActivityTypes } from '@/lib/activity-config'

interface TripMapProps {
  className?: string
}

interface LocationMarker {
  activity: SimpleActivity
  coordinates: [number, number]
  order: number
  startTime: number
  endTime: number
}

export function TripMap({ className }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const routeLayerId = 'route-line'
  
  const { activities, setSelectedActivity } = useTripContext()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [simulatedTime, setSimulatedTime] = useState<number | null>(null)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(-1)
  const lastFocusedIndex = useRef(-1)
  
  // Get activities with valid location coordinates, sorted by start time (memoized)
  const locatedActivities: LocationMarker[] = React.useMemo(() => activities
    .filter(a => a.location?.lat && a.location?.lng)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map((activity, index) => {
      const startTime = new Date(activity.start).getTime()
      const endTime = activity.end 
        ? new Date(activity.end).getTime() 
        : startTime + 60 * 60 * 1000
      return {
        activity,
        coordinates: [activity.location!.lng, activity.location!.lat] as [number, number],
        order: index,
        startTime,
        endTime
      }
    }), [activities])

  // Trip time range (memoized)
  const tripStart = useMemo(() => locatedActivities.length > 0 
    ? locatedActivities[0].startTime - 30 * 60 * 1000
    : Date.now(), [locatedActivities])
  const tripEnd = useMemo(() => locatedActivities.length > 0
    ? Math.max(...locatedActivities.map(a => a.endTime)) + 30 * 60 * 1000
    : Date.now(), [locatedActivities])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    
    mapboxgl.accessToken = token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
    })
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    
    map.current.on('load', () => {
      setIsMapLoaded(true)
    })
    
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when activities change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    locatedActivities.forEach(({ activity, coordinates, order }) => {
      const el = document.createElement('div')
      el.className = 'trip-marker'
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background: ${getActivityColor(activity.type)};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      `
      el.textContent = String(order + 1)
      
      el.addEventListener('click', () => setSelectedActivity(activity))
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${activity.title}</strong><br/><span style="color:#666;font-size:12px">${activity.city || ''}</span>`
        ))
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    })
    
    // Draw route
    if (locatedActivities.length > 1) {
      const coords = locatedActivities.map(l => l.coordinates)
      
      if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId)
      if (map.current.getSource(routeLayerId)) map.current.removeSource(routeLayerId)
      
      map.current.addSource(routeLayerId, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
      })
      
      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeLayerId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3B82F6', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }
      })
      
      const bounds = new mapboxgl.LngLatBounds()
      coords.forEach(c => bounds.extend(c))
      map.current.fitBounds(bounds, { padding: 80 })
    }
  }, [locatedActivities, isMapLoaded, setSelectedActivity])

  // Find ONLY the current activity (must be within its time range)
  const findCurrentActivity = useCallback((time: number): number => {
    for (let i = 0; i < locatedActivities.length; i++) {
      const { startTime, endTime } = locatedActivities[i]
      if (time >= startTime && time <= endTime) return i
    }
    return -1 // No current activity
  }, [locatedActivities])

  // Focus map on activity - stable reference
  const focusOnActivityRef = useRef((index: number) => {})
  
  focusOnActivityRef.current = (index: number) => {
    if (!map.current || index < 0 || index >= locatedActivities.length) return
    if (index === lastFocusedIndex.current) return
    
    lastFocusedIndex.current = index
    const loc = locatedActivities[index]
    const zoom = loc.activity.type === 'flight' ? 5 : loc.activity.type === 'transport' ? 7 : 12
    
    console.log('Flying to:', loc.activity.title, loc.coordinates, 'zoom:', zoom)
    
    map.current.flyTo({ center: loc.coordinates, zoom, duration: 1500, essential: true })
    
    // Update marker highlights
    markersRef.current.forEach((m, i) => {
      const el = m.getElement()
      if (i === index) {
        el.style.transform = 'scale(1.4)'
        el.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.5), 0 4px 12px rgba(0,0,0,0.4)'
      } else {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      }
    })
  }

  // Playback interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (!isPlaying || simulatedTime === null) return
    
    intervalRef.current = setInterval(() => {
      setSimulatedTime(prev => {
        if (prev === null) return null
        const advance = playbackSpeed * 60 * 60 * 1000 * 0.1
        const newTime = prev + advance
        if (newTime >= tripEnd) {
          setIsPlaying(false)
          return tripEnd
        }
        return newTime
      })
    }, 100)
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, playbackSpeed, tripEnd, simulatedTime])

  // Update current activity when time changes
  useEffect(() => {
    if (simulatedTime === null) return
    const newIndex = findCurrentActivity(simulatedTime)
    setCurrentActivityIndex(newIndex)
    if (newIndex >= 0) {
      focusOnActivityRef.current(newIndex)
    }
  }, [simulatedTime, findCurrentActivity])

  const handlePlay = () => {
    if (locatedActivities.length === 0) return
    
    if (simulatedTime === null || simulatedTime >= tripEnd) {
      setSimulatedTime(tripStart)
      setCurrentActivityIndex(-1)
      lastFocusedIndex.current = -1
    }
    setIsPlaying(true)
  }

  const handlePause = () => setIsPlaying(false)

  const handleReset = () => {
    setIsPlaying(false)
    setSimulatedTime(null)
    setCurrentActivityIndex(-1)
    lastFocusedIndex.current = -1
    
    markersRef.current.forEach(m => {
      const el = m.getElement()
      el.style.transform = 'scale(1)'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    })
    
    if (locatedActivities.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
      locatedActivities.forEach(l => bounds.extend(l.coordinates))
      map.current.fitBounds(bounds, { padding: 80 })
    }
  }

  const formatTime = (ms: number) => {
    const d = new Date(ms)
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false 
    })
  }

  const progress = simulatedTime !== null 
    ? Math.min(100, Math.max(0, ((simulatedTime - tripStart) / (tripEnd - tripStart)) * 100))
    : 0

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!hasMapboxToken) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Map Not Configured</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Set <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Play/Pause/Reset */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                disabled={locatedActivities.length === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  locatedActivities.length === 0
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Trip
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Speed:</span>
            {[1, 2, 4, 8].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded transition-colors",
                  playbackSpeed === s
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Current Activity Display */}
          {currentActivityIndex >= 0 && locatedActivities[currentActivityIndex] && (
            <div className="flex items-center gap-2 ml-auto text-sm">
              <div className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getActivityColor(locatedActivities[currentActivityIndex].activity.type) }}
              />
              <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                {locatedActivities[currentActivityIndex].activity.title}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar with Time Bubble */}
        {simulatedTime !== null && (
          <div className="mt-4 relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Time bubble that follows progress */}
            <div 
              className="absolute -bottom-8 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap"
              style={{ left: `${progress}%` }}
            >
              {formatTime(simulatedTime)}
              {/* Arrow pointing up */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className="relative" style={{ marginTop: simulatedTime !== null ? '16px' : 0 }}>
        <div 
          ref={mapContainer} 
          className="w-full h-[450px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        />
        
        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Activity Types</div>
          <div className="space-y-1">
            {allActivityTypes.map(type => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activityTypeConfig[type].color }} />
                <span className="text-gray-700 dark:text-gray-300">{activityTypeConfig[type].label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* No activities message */}
        {locatedActivities.length === 0 && isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
              <p className="text-gray-600 dark:text-gray-300">No activities with location data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
