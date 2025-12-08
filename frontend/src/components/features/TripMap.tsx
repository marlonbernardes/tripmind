'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity } from '@/types/simple'
import { cn } from '@/lib/utils'

// Mock coordinates for cities (in production, use a geocoding API)
const cityCoordinates: Record<string, [number, number]> = {
  // Ireland
  'Dublin': [-6.2603, 53.3498],
  'Dublin Airport (DUB)': [-6.2499, 53.4264],
  
  // Asia
  'Beijing': [116.4074, 39.9042],
  'Bangkok': [100.5018, 13.7563],
  'Suvarnabhumi Airport (BKK)': [100.7501, 13.6900],
  'Phuket': [98.3923, 7.8804],
  'Maldives': [73.2207, 3.2028],
  
  // UK
  'London': [-0.1278, 51.5074],
  'London Bridge': [-0.0863, 51.5055],
  'Bloomsbury': [-0.1246, 51.5226],
  
  // France
  'Paris': [2.3522, 48.8566],
  'Le Marais': [2.3615, 48.8566],
  'Champ de Mars': [2.2945, 48.8584],
  '1st Arrondissement': [2.3387, 48.8606],
  
  // Test
  'Test City': [-6.2603, 53.3498],
}

// Activity type colors
const activityColors: Record<string, string> = {
  flight: '#3B82F6',    // Blue
  hotel: '#10B981',     // Green
  event: '#F59E0B',     // Amber
  transport: '#8B5CF6', // Purple
  note: '#6B7280',      // Gray
  task: '#EF4444',      // Red
}

interface TripMapProps {
  className?: string
}

interface LocationMarker {
  activity: SimpleActivity
  coordinates: [number, number]
  order: number
}

export function TripMap({ className }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const animationRef = useRef<number | null>(null)
  const routeLayerId = 'route-line'
  
  const { activities, setSelectedActivity } = useTripContext()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  
  // Get activities with valid coordinates, sorted by start time
  const locatedActivities: LocationMarker[] = activities
    .filter(a => {
      const city = a.city || a.metadata?.from || a.metadata?.to
      return city && cityCoordinates[city]
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .map((activity, index) => {
      const city = activity.city || activity.metadata?.from || activity.metadata?.to
      return {
        activity,
        coordinates: cityCoordinates[city!],
        order: index
      }
    })

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    // Check for Mapbox token
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.warn('Mapbox token not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN in environment.')
      return
    }
    
    mapboxgl.accessToken = token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
    })
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    map.current.on('load', () => {
      setIsMapLoaded(true)
    })
    
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers and routes when activities change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Add new markers
    locatedActivities.forEach(({ activity, coordinates, order }) => {
      const el = document.createElement('div')
      el.className = 'trip-marker'
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background: ${activityColors[activity.type] || '#6B7280'};
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
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      })
      el.addEventListener('click', () => {
        setSelectedActivity(activity)
      })
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 4px;">
                <strong>${activity.title}</strong>
                <br/>
                <span style="color: #666; font-size: 12px;">${activity.city || ''}</span>
              </div>
            `)
        )
        .addTo(map.current!)
      
      markersRef.current.push(marker)
    })
    
    // Draw route line
    if (locatedActivities.length > 1) {
      const coordinates = locatedActivities.map(l => l.coordinates)
      
      // Remove existing route layer if it exists
      if (map.current.getLayer(routeLayerId)) {
        map.current.removeLayer(routeLayerId)
      }
      if (map.current.getSource(routeLayerId)) {
        map.current.removeSource(routeLayerId)
      }
      
      // Add route line
      map.current.addSource(routeLayerId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      })
      
      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeLayerId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      })
      
      // Fit bounds to show all markers
      const bounds = new mapboxgl.LngLatBounds()
      coordinates.forEach(coord => bounds.extend(coord))
      map.current.fitBounds(bounds, { padding: 80 })
    } else if (locatedActivities.length === 1) {
      map.current.flyTo({
        center: locatedActivities[0].coordinates,
        zoom: 10
      })
    }
  }, [locatedActivities, isMapLoaded, setSelectedActivity])

  // Animation logic
  const animateToNext = useCallback(() => {
    if (!map.current || currentIndex >= locatedActivities.length - 1) {
      setIsPlaying(false)
      return
    }
    
    const nextIndex = currentIndex + 1
    const nextLocation = locatedActivities[nextIndex]
    
    // Fly to next location
    map.current.flyTo({
      center: nextLocation.coordinates,
      zoom: 8,
      duration: 2000 / playbackSpeed,
      essential: true
    })
    
    // Highlight the marker
    setSelectedActivity(nextLocation.activity)
    setCurrentIndex(nextIndex)
  }, [currentIndex, locatedActivities, playbackSpeed, setSelectedActivity])

  // Playback effect
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      return
    }
    
    const interval = 3000 / playbackSpeed // Time between locations
    animationRef.current = window.setTimeout(animateToNext, interval)
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [isPlaying, animateToNext, playbackSpeed])

  const handlePlayPause = () => {
    if (currentIndex >= locatedActivities.length - 1) {
      // Reset to beginning
      setCurrentIndex(0)
      if (locatedActivities.length > 0 && map.current) {
        map.current.flyTo({
          center: locatedActivities[0].coordinates,
          zoom: 8,
          duration: 1000
        })
      }
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    if (locatedActivities.length > 0 && map.current) {
      // Fit all markers
      const bounds = new mapboxgl.LngLatBounds()
      locatedActivities.forEach(l => bounds.extend(l.coordinates))
      map.current.fitBounds(bounds, { padding: 80 })
    }
  }

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!hasMapboxToken) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Map Not Configured
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Set <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment to enable the map.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      />
      
      {/* Playback Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-4">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Reset"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={locatedActivities.length < 2}
          className={cn(
            "p-3 rounded-full transition-colors",
            locatedActivities.length < 2
              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        
        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          {[1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={cn(
                "px-2 py-1 text-sm font-medium rounded transition-colors",
                playbackSpeed === speed
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>
        
        {/* Progress Indicator */}
        <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[60px] text-center">
          {currentIndex + 1} / {locatedActivities.length}
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Activity Types</div>
        <div className="space-y-1">
          {Object.entries(activityColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700 dark:text-gray-300 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* No locations message */}
      {locatedActivities.length === 0 && isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <p className="text-gray-600 dark:text-gray-300">
              No activities with known locations found.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
