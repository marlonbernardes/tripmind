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
  const dynamicMarkerRef = useRef<mapboxgl.Marker | null>(null)
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
  const locatedActivities: LocationMarker[] = useMemo(() => activities
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

  // Create dynamic marker with smooth CSS transitions
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    // Create dynamic marker element with CSS transition
    const el = document.createElement('div')
    el.className = 'dynamic-marker'
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background: #EF4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(0,0,0,0.3);
      display: none;
      transition: opacity 0.3s ease;
    `
    
    dynamicMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([0, 0])
      .addTo(map.current)
    
    return () => {
      dynamicMarkerRef.current?.remove()
      dynamicMarkerRef.current = null
    }
  }, [isMapLoaded])

  // Update markers when activities change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    locatedActivities.forEach(({ activity, coordinates, order }) => {
      const el = document.createElement('div')
      el.className = 'trip-marker'
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${getActivityColor(activity.type)};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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
        paint: { 'line-color': '#3B82F6', 'line-width': 2, 'line-opacity': 0.5, 'line-dasharray': [2, 2] }
      })
      
      const bounds = new mapboxgl.LngLatBounds()
      coords.forEach(c => bounds.extend(c))
      map.current.fitBounds(bounds, { padding: 60 })
    }
  }, [locatedActivities, isMapLoaded, setSelectedActivity])

  // Find current activity and calculate interpolated position
  const getCurrentPosition = useCallback((time: number): { 
    activityIndex: number, 
    position: [number, number],
    isTransit: boolean 
  } | null => {
    for (let i = 0; i < locatedActivities.length; i++) {
      const curr = locatedActivities[i]
      
      // During this activity
      if (time >= curr.startTime && time <= curr.endTime) {
        const isTransit = curr.activity.type === 'flight' || curr.activity.type === 'transport'
        
        if (isTransit && i < locatedActivities.length - 1) {
          // Interpolate position during transit
          const next = locatedActivities[i + 1]
          const progress = (time - curr.startTime) / (curr.endTime - curr.startTime)
          const lng = curr.coordinates[0] + (next.coordinates[0] - curr.coordinates[0]) * progress
          const lat = curr.coordinates[1] + (next.coordinates[1] - curr.coordinates[1]) * progress
          return { activityIndex: i, position: [lng, lat], isTransit: true }
        }
        
        return { activityIndex: i, position: curr.coordinates, isTransit: false }
      }
    }
    return null
  }, [locatedActivities])

  // Update dynamic marker and focus - with throttling for smooth animation
  const lastUpdateTime = useRef(0)
  const lastMapMoveTime = useRef(0)
  
  const updatePosition = useCallback((time: number) => {
    const now = Date.now()
    const result = getCurrentPosition(time)
    
    if (result && dynamicMarkerRef.current && map.current) {
      // Show and update dynamic marker
      const el = dynamicMarkerRef.current.getElement()
      el.style.display = 'block'
      el.style.opacity = '1'
      dynamicMarkerRef.current.setLngLat(result.position)
      
      // Only update activity index when it changes
      if (result.activityIndex !== currentActivityIndex) {
        setCurrentActivityIndex(result.activityIndex)
      }
      
      // Throttle map movement to prevent flickering (max once per 500ms for flyTo, 200ms for easeTo)
      if (result.activityIndex !== lastFocusedIndex.current) {
        // New activity - fly to it
        if (now - lastMapMoveTime.current > 500) {
          lastFocusedIndex.current = result.activityIndex
          lastMapMoveTime.current = now
          const zoom = result.isTransit ? 4 : 10
          map.current.flyTo({ center: result.position, zoom, duration: 1500, essential: true })
        }
      } else if (result.isTransit) {
        // During transit - smooth pan (throttled)
        if (now - lastMapMoveTime.current > 300) {
          lastMapMoveTime.current = now
          map.current.easeTo({ center: result.position, duration: 400 })
        }
      }
      
      // Update static marker highlights (throttled)
      if (now - lastUpdateTime.current > 200) {
        lastUpdateTime.current = now
        markersRef.current.forEach((m, i) => {
          const markerEl = m.getElement()
          if (i === result.activityIndex) {
            markerEl.style.transform = 'scale(1.3)'
            markerEl.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.5), 0 4px 10px rgba(0,0,0,0.4)'
          } else {
            markerEl.style.transform = 'scale(1)'
            markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
          }
        })
      }
    } else if (dynamicMarkerRef.current) {
      // Hide dynamic marker when not in an activity
      const el = dynamicMarkerRef.current.getElement()
      el.style.opacity = '0'
      setTimeout(() => { el.style.display = 'none' }, 300)
      if (currentActivityIndex !== -1) {
        setCurrentActivityIndex(-1)
      }
    }
  }, [getCurrentPosition, currentActivityIndex])

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

  // Update position when time changes
  useEffect(() => {
    if (simulatedTime === null) return
    updatePosition(simulatedTime)
  }, [simulatedTime, updatePosition])

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
    
    if (dynamicMarkerRef.current) {
      dynamicMarkerRef.current.getElement().style.display = 'none'
    }
    
    markersRef.current.forEach(m => {
      const el = m.getElement()
      el.style.transform = 'scale(1)'
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
    })
    
    if (locatedActivities.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
      locatedActivities.forEach(l => bounds.extend(l.coordinates))
      map.current.fitBounds(bounds, { padding: 60 })
    }
  }

  const formatTime = (ms: number) => {
    const d = new Date(ms)
    return d.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric',
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
    <div className={cn("flex flex-col gap-0", className)}>
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-[500px] rounded-t-xl overflow-hidden border border-b-0 border-gray-200 dark:border-gray-700"
        />
        
        {/* Compact Legend */}
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5">
          <div className="flex items-center gap-3 text-xs">
            {allActivityTypes.slice(0, 4).map(type => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activityTypeConfig[type].color }} />
                <span className="text-gray-600 dark:text-gray-300">{activityTypeConfig[type].label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* No activities message */}
        {locatedActivities.length === 0 && isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
              <p className="text-gray-600 dark:text-gray-300">No activities with location data.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Compact Controls Bar - Below Map */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={locatedActivities.length === 0}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
              locatedActivities.length === 0
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : isPlaying 
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Reset"
          >
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Progress Bar with Time */}
          <div className="flex-1 relative">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            {simulatedTime !== null && (
              <div 
                className="absolute -top-6 transform -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                style={{ left: `${Math.min(90, Math.max(10, progress))}%` }}
              >
                {formatTime(simulatedTime)}
              </div>
            )}
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-1">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={cn(
                  "px-1.5 py-0.5 text-xs font-medium rounded transition-colors",
                  playbackSpeed === s
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Current Activity */}
          {currentActivityIndex >= 0 && locatedActivities[currentActivityIndex] && (
            <div className="flex items-center gap-1.5 text-xs border-l border-gray-200 dark:border-gray-700 pl-3 ml-1">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getActivityColor(locatedActivities[currentActivityIndex].activity.type) }}
              />
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {locatedActivities[currentActivityIndex].activity.title}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
