'use client'

import { useEffect } from 'react'
import { loadGooglePlacesScript } from '@/lib/places-service'

/**
 * Client-side component that loads the Google Places API script
 * Include this component once in your app layout
 */
export function GooglePlacesLoader() {
  useEffect(() => {
    loadGooglePlacesScript().catch((error) => {
      console.warn('Failed to load Google Places API:', error)
    })
  }, [])

  return null
}
