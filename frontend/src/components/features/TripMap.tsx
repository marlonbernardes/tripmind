'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTripContext } from '@/contexts/TripContext'
import type { Activity, Trip } from '@/types/simple'
import { cn } from '@/lib/utils'
import { getActivityColor, getActivityIcon, activityTypeConfig, allActivityTypes } from '@/lib/activity-config'
import { formatDayHeader, formatActivityTime } from '@/lib/date-service'

interface TripMapProps {
  className?: string
}

// MapPoint flag definitions (bit flags)
const MapPointFlags = {
  DEPARTURE: 1,      // 0b000001 - Departure point of a range
  ARRIVAL: 2,        // 0b000010 - Arrival point of a range
  OVERNIGHT: 4,      // 0b000100 - Overnight stay
  TRANSFER: 8,       // 0b001000 - Transfer point
  CONFIRMED: 16,     // 0b010000 - Activity is confirmed
  HIGHLIGHT: 32,     // 0b100000 - Special highlight
} as const

// Flag display configuration
const flagConfig: Record<number, { label: string; color: string; bgColor: string }> = {
  [MapPointFlags.DEPARTURE]: { label: 'Departure', color: '#0284c7', bgColor: '#e0f2fe' },
  [MapPointFlags.ARRIVAL]: { label: 'Arrival', color: '#059669', bgColor: '#d1fae5' },
  [MapPointFlags.OVERNIGHT]: { label: 'Overnight', color: '#7c3aed', bgColor: '#ede9fe' },
  [MapPointFlags.TRANSFER]: { label: 'Transfer', color: '#ea580c', bgColor: '#ffedd5' },
  [MapPointFlags.CONFIRMED]: { label: 'Confirmed', color: '#16a34a', bgColor: '#dcfce7' },
  [MapPointFlags.HIGHLIGHT]: { label: 'Highlight', color: '#dc2626', bgColor: '#fee2e2' },
}

// Helper to decode flags into array of active flag values
function decodeFlags(flags: number): number[] {
  const activeFlags: number[] = []
  Object.values(MapPointFlags).forEach(flag => {
    if (flags & flag) activeFlags.push(flag)
  })
  return activeFlags
}

// A map point represents a single location on the map
// Activities with location.end generate 2 points (start + end)
interface MapPoint {
  index: number           // 1-based sequential number
  activityId: string      // Activity ID for URL sync
  activity: Activity
  coord: [number, number]
  day: number             // The day number for this point
  time?: string           // The specific time for this point
  flags: number           // Bit flags for features (DEPARTURE, ARRIVAL, CONFIRMED, etc.)
  pairedIndex?: number    // Index of paired point (for ranges)
  rangeTotal?: number     // Total points in range (1 or 2)
  rangePosition?: number  // Position in range (1 or 2)
}

// Calculate distance between two coordinates in km (Haversine formula)
function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371 // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function TripMap({ className }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const routeLayerId = 'route-line'
  const nextRouteLayerId = 'next-route-line'
  const initializedFromUrl = useRef(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const { trip, activities, setSelectedActivity, setIsCreatingActivity } = useTripContext()
  
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Create flat list of map points from activities
  const mapPoints: MapPoint[] = useMemo(() => {
    const sortedActivities = activities
      .filter(a => a.location)
      .sort((a, b) => {
        // Sort by day first, then by time
        if (a.day !== b.day) return a.day - b.day
        const aTime = a.time ?? '00:00'
        const bTime = b.time ?? '00:00'
        return aTime.localeCompare(bTime)
      })
    
    const points: MapPoint[] = []
    let pointIndex = 1
    
    sortedActivities.forEach(activity => {
      if (!activity.location) return
      
      // Calculate base flags
      const baseFlags = activity.status === 'confirmed' ? MapPointFlags.CONFIRMED : 0
      
      if (activity.location.end) {
        // Activity with range (e.g., flight): create 2 points
        const startIdx = pointIndex
        const endIdx = pointIndex + 1
        
        // Departure point
        points.push({
          index: startIdx,
          activityId: activity.id,
          activity,
          coord: [activity.location.start.lng, activity.location.start.lat],
          day: activity.day,
          time: activity.time,
          flags: baseFlags | MapPointFlags.DEPARTURE,
          pairedIndex: endIdx,
          rangeTotal: 2,
          rangePosition: 1
        })
        
        // Arrival point
        points.push({
          index: endIdx,
          activityId: activity.id,
          activity,
          coord: [activity.location.end.lng, activity.location.end.lat],
          day: activity.endDay ?? activity.day,
          time: activity.endTime,
          flags: baseFlags | MapPointFlags.ARRIVAL,
          pairedIndex: startIdx,
          rangeTotal: 2,
          rangePosition: 2
        })
        
        pointIndex += 2
      } else {
        // Single location activity
        points.push({
          index: pointIndex,
          activityId: activity.id,
          activity,
          coord: [activity.location.start.lng, activity.location.start.lat],
          day: activity.day,
          time: activity.time,
          flags: baseFlags,
          rangeTotal: 1,
          rangePosition: 1
        })
        pointIndex++
      }
    })
    
    return points
  }, [activities])

  const currentPoint = mapPoints[currentIndex]
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < mapPoints.length - 1

  // Initialize from URL params on first load
  useEffect(() => {
    if (initializedFromUrl.current || mapPoints.length === 0) return
    
    const urlActivityId = searchParams.get('a')
    const urlDeparture = searchParams.get('d')
    
    if (urlActivityId) {
      // Find map point matching activityId and departure flag
      const targetIndex = mapPoints.findIndex(point => {
        if (point.activityId !== urlActivityId) return false
        
        // If d=1 in URL, look for DEPARTURE point; otherwise any matching point
        if (urlDeparture === '1') {
          return (point.flags & MapPointFlags.DEPARTURE) !== 0
        }
        // For non-departure or d not specified, prefer first match (could be single point or arrival)
        return true
      })
      
      if (targetIndex !== -1) {
        setCurrentIndex(targetIndex)
      }
    }
    
    initializedFromUrl.current = true
  }, [mapPoints, searchParams])

  // Update URL when currentIndex changes
  useEffect(() => {
    if (!initializedFromUrl.current || !currentPoint) return
    
    const isDeparture = (currentPoint.flags & MapPointFlags.DEPARTURE) !== 0
    const params = new URLSearchParams()
    params.set('a', currentPoint.activityId)
    if (isDeparture) {
      params.set('d', '1')
    }
    
    // Update URL without navigation (shallow)
    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }, [currentIndex, currentPoint, pathname, router])

  // Determine which points should be visible based on current point
  // Note: Paired points are NOT shown - they're only used for zoom calculation
  const visiblePointIndices = useMemo(() => {
    if (!currentPoint) return new Set<number>()
    
    const visible = new Set<number>()
    visible.add(currentPoint.index)
    
    // For DEPARTURE points (flights/transport), only show current marker - no nearby points
    const isDeparture = (currentPoint.flags & MapPointFlags.DEPARTURE) !== 0
    if (isDeparture) {
      return visible
    }
    
    // For other points: add markers within 50km (but NOT the paired point)
    mapPoints.forEach(point => {
      if (point.index === currentPoint.index) return
      if (point.index === currentPoint.pairedIndex) return // Skip paired point
      const distance = getDistanceKm(currentPoint.coord, point.coord)
      if (distance <= 50) {
        visible.add(point.index)
      }
    })
    
    return visible
  }, [currentPoint, mapPoints])

  // Detect dark mode from document class (set by ThemeProvider)
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const mapStyle = isDarkMode
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/light-v11'

  // Initialize map (component remounts on theme change via key prop in parent)
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return
    
    mapboxgl.accessToken = token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [0, 20],
      zoom: 1.5,
    })
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    map.current.on('load', () => setIsMapLoaded(true))
    
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [mapStyle])

  // Focus map on current point
  // For range activities, calculate zoom based on distance but center on current point
  const focusOnPoint = useCallback((pointIdx: number) => {
    if (!map.current) return
    
    const point = mapPoints[pointIdx]
    if (!point) return
    
    // If this point has a paired point (part of range), calculate appropriate zoom
    if (point.pairedIndex !== undefined) {
      const pairedPoint = mapPoints.find(p => p.index === point.pairedIndex)
      if (pairedPoint) {
        // Calculate distance between the two points
        const distance = getDistanceKm(point.coord, pairedPoint.coord)
        
        // Calculate zoom based on distance (more zoomed in than showing both)
        // These are approximate values - adjust as needed
        let zoom: number
        if (distance > 5000) zoom = 3        // Intercontinental
        else if (distance > 2000) zoom = 4   // Continental
        else if (distance > 1000) zoom = 5   // Large country
        else if (distance > 500) zoom = 6    // Medium distance
        else if (distance > 200) zoom = 7    // Regional
        else if (distance > 100) zoom = 8    // ~100-200km
        else if (distance > 50) zoom = 9     // ~50-100km
        else if (distance > 20) zoom = 10    // ~20-50km
        else zoom = 12                       // Close range
        
        // Center on current point with calculated zoom
        map.current.easeTo({ center: point.coord, zoom, duration: 800 })
        return
      }
    }
    
    // Single point: zoom in more
    map.current.easeTo({ center: point.coord, zoom: 14, duration: 800 })
  }, [mapPoints])

  // Create/update markers based on visibility
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    // Remove all existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()
    
    // Create markers for visible points only
    mapPoints.forEach((point, arrayIdx) => {
      if (!visiblePointIndices.has(point.index)) return
      
      const isActive = arrayIdx === currentIndex
      
      const el = document.createElement('div')
      el.className = 'trip-marker'
      el.style.cssText = `
        width: ${isActive ? '32px' : '24px'};
        height: ${isActive ? '32px' : '24px'};
        background: ${getActivityColor(point.activity.type)};
        border: ${isActive ? '3px' : '2px'} solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isActive ? '11px' : '9px'};
        font-weight: bold;
        color: white;
        box-shadow: ${isActive 
          ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 12px rgba(0,0,0,0.3)' 
          : '0 2px 4px rgba(0,0,0,0.3)'};
        opacity: ${isActive ? '1' : '0.7'};
        transition: all 0.2s ease;
        z-index: ${isActive ? '10' : '1'};
      `
      el.textContent = String(point.index)
      el.addEventListener('click', () => {
        setCurrentIndex(arrayIdx)
        setSelectedActivity(point.activity)
      })
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(point.coord)
        .addTo(map.current!)
      
      markersRef.current.set(point.index, marker)
    })
    
    // Focus on current point
    focusOnPoint(currentIndex)
  }, [mapPoints, isMapLoaded, visiblePointIndices, currentIndex, setSelectedActivity, focusOnPoint])

  // Update route lines: current route (for ranges) and next route (preview)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    // Remove existing routes
    if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId)
    if (map.current.getSource(routeLayerId)) map.current.removeSource(routeLayerId)
    if (map.current.getLayer(nextRouteLayerId)) map.current.removeLayer(nextRouteLayerId)
    if (map.current.getSource(nextRouteLayerId)) map.current.removeSource(nextRouteLayerId)
    
    const point = mapPoints[currentIndex]
    if (!point) return
    
    // Draw current route (for range activities - between paired points)
    if (point.pairedIndex !== undefined) {
      const pairedPoint = mapPoints.find(p => p.index === point.pairedIndex)
      if (pairedPoint) {
        const isDeparture = (point.flags & MapPointFlags.DEPARTURE) !== 0
        const startCoord = isDeparture ? point.coord : pairedPoint.coord
        const endCoord = isDeparture ? pairedPoint.coord : point.coord
        
        map.current.addSource(routeLayerId, {
          type: 'geojson',
          data: { 
            type: 'Feature', 
            properties: {}, 
            geometry: { 
              type: 'LineString', 
              coordinates: [startCoord, endCoord] 
            } 
          }
        })
        
        map.current.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeLayerId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 
            'line-color': getActivityColor(point.activity.type), 
            'line-width': 3, 
            'line-opacity': 0.7, 
            'line-dasharray': [2, 2] 
          }
        })
      }
    }
    
    // Draw next route (preview to next point)
    const nextPoint = mapPoints[currentIndex + 1]
    if (nextPoint) {
      map.current.addSource(nextRouteLayerId, {
        type: 'geojson',
        data: { 
          type: 'Feature', 
          properties: {}, 
          geometry: { 
            type: 'LineString', 
            coordinates: [point.coord, nextPoint.coord] 
          } 
        }
      })
      
      map.current.addLayer({
        id: nextRouteLayerId,
        type: 'line',
        source: nextRouteLayerId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 
          'line-color': '#9ca3af',  // Gray color for preview
          'line-width': 2, 
          'line-opacity': 0.5, 
          'line-dasharray': [4, 4]  // More spaced out dashes
        }
      })
    }
  }, [currentIndex, mapPoints, isMapLoaded])

  const handlePrev = () => {
    if (canGoPrev) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      const point = mapPoints[newIndex]
      if (point) {
        setSelectedActivity(point.activity)
      }
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      const point = mapPoints[newIndex]
      if (point) {
        setSelectedActivity(point.activity)
      }
    }
  }

  // Get active flag pills for a point
  const getFlagPills = (point: MapPoint | undefined) => {
    if (!point) return []
    return decodeFlags(point.flags)
      .filter(flag => flagConfig[flag])
      .map(flag => flagConfig[flag])
  }

  // Format time from MapPoint
  const formatPointTime = (point: MapPoint) => {
    return point.time ?? ''
  }

  // Format date from MapPoint
  const formatPointDate = (point: MapPoint) => {
    if (!trip) return `Day ${point.day}`
    return formatDayHeader(trip, point.day)
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={cn("relative h-full", className)}>
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Map Not Configured</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Set <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-rows-[1fr_auto] overflow-hidden", className)}>
      {/* Map - fills available space (1fr) */}
      <div className="relative overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Point counter badge */}
        {mapPoints.length > 0 && (
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentPoint?.index || 0} / {mapPoints.length}
            </span>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {allActivityTypes.slice(0, 4).map(type => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activityTypeConfig[type].color }} />
                <span className="text-gray-600 dark:text-gray-300">{activityTypeConfig[type].label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {mapPoints.length === 0 && isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
              <p className="text-gray-600 dark:text-gray-300">No activities with location data.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Bar - auto height, pinned at bottom */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        
        {/* Mobile Layout (< md) - Two rows */}
        <div className="md:hidden">
          {/* Row 1: Activity Info - separate background, fixed structure */}
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            {currentPoint ? (
              <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${getActivityColor(currentPoint.activity.type)}20` }}
                >
                  {getActivityIcon(currentPoint.activity.type)}
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ color: getActivityColor(currentPoint.activity.type) }}
                >
                  {currentPoint.index}.
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate min-w-0 flex-1">
                  {currentPoint.activity.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {formatPointTime(currentPoint)}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {mapPoints.length === 0 ? 'No activities with locations' : 'Select an activity'}
              </div>
            )}
          </div>
          
          {/* Row 2: Controls - full height, no padding */}
          <div className="flex h-12">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={cn(
                "flex items-center justify-center w-12 border-r border-gray-200 dark:border-gray-700 transition-colors",
                canGoPrev
                  ? "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                "flex items-center justify-center w-12 border-r border-gray-200 dark:border-gray-700 transition-colors",
                canGoNext
                  ? "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Spacer */}
            <div className="flex-1 bg-white dark:bg-gray-800" />
            
            {/* Single Add button */}
            <button
              onClick={() => setIsCreatingActivity(true)}
              className="flex items-center gap-1.5 px-4 border-l border-gray-200 dark:border-gray-700 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <span>+</span>
              <span>Add</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Layout (>= md) - Single row, full width with internal padding */}
        <div className="hidden md:block">
          <div className="px-4 py-3">
            <div className="flex h-12 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Navigation buttons */}
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={cn(
                  "flex items-center justify-center w-12 border-r border-gray-200 dark:border-gray-700 transition-colors",
                  canGoPrev
                    ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                )}
                title="Previous point"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={cn(
                  "flex items-center justify-center w-12 border-r border-gray-200 dark:border-gray-700 transition-colors",
                  canGoNext
                    ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                )}
                title="Next point"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Activity Info - center */}
              <div className="flex-1 flex items-center px-4 min-w-0 bg-white dark:bg-gray-800">
                {currentPoint ? (
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ backgroundColor: `${getActivityColor(currentPoint.activity.type)}20` }}
                    >
                      {getActivityIcon(currentPoint.activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          <span 
                            className="text-sm font-bold mr-1.5"
                            style={{ color: getActivityColor(currentPoint.activity.type) }}
                          >
                            {currentPoint.index}.
                          </span>
                          {currentPoint.activity.title}
                        </h3>
                        {getFlagPills(currentPoint).map((flagInfo, idx) => (
                          <span 
                            key={idx}
                            className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ backgroundColor: flagInfo.bgColor, color: flagInfo.color }}
                          >
                            {flagInfo.label}
                          </span>
                        ))}
                        <span 
                          className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${getActivityColor(currentPoint.activity.type)}20`,
                            color: getActivityColor(currentPoint.activity.type)
                          }}
                        >
                          {activityTypeConfig[currentPoint.activity.type]?.label || currentPoint.activity.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatPointDate(currentPoint)}</span>
                        {formatPointTime(currentPoint) && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{formatPointTime(currentPoint)}</span>
                          </>
                        )}
                        {currentPoint.activity.city && (
                          <>
                            <span>•</span>
                            <span className="truncate">{currentPoint.activity.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {mapPoints.length === 0 ? 'No activities with locations' : 'Select an activity'}
                  </div>
                )}
              </div>
              
            
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
