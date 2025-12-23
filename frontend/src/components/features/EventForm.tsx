'use client'

import { useState, useEffect } from 'react'
import type { Activity, EventMetadata, ActivityStatus, ActivityContext, GeoLocation } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'
import { PlaceAutocomplete } from '@/components/ui/autocomplete'
import type { PlaceResult } from '@/lib/places-service'

interface EventFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

export function EventForm({ activity, onSave, onCancel, onDelete, defaultDay = 1, initialContext }: EventFormProps) {
  const { trip } = useTripContext()
  
  const [formData, setFormData] = useState({
    title: '',
    placeName: '',
    address: '',
    city: initialContext?.city || '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    status: 'draft' as ActivityStatus
  })
  
  // Track coordinates for map display
  const [eventLocation, setEventLocation] = useState<GeoLocation | undefined>(undefined)

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as EventMetadata || {}
      setFormData({
        title: activity.title,
        placeName: metadata.placeName || '',
        address: activity.address || '',
        city: activity.city || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        status: activity.status
      })
      // Restore location from activity if available
      if (activity.location?.start) {
        setEventLocation(activity.location.start)
      }
    }
  }, [activity])

  const handlePlaceSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setEventLocation({ lat: place.lat, lng: place.lng })
    }
    // Auto-populate place name from selection
    if (place.name) {
      setFormData(prev => ({ 
        ...prev, 
        placeName: place.name,
        city: place.city || prev.city
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || trip?.id || '1',
      type: 'event',
      title: formData.title,
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.city || undefined,
      address: formData.address || undefined,
      status: formData.status,
      location: eventLocation ? { start: eventLocation } : undefined,
      metadata: {
        placeName: formData.placeName || undefined
      } as EventMetadata
    }

    onSave(activityData)
  }

  const inputClass = "w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={inputClass}
          placeholder="Event name"
          required
        />
      </div>

      {/* Place Name (optional) */}
      <div>
        <label className={labelClass}>Place name</label>
        <input
          type="text"
          value={formData.placeName}
          onChange={(e) => setFormData(prev => ({ ...prev, placeName: e.target.value }))}
          className={inputClass}
          placeholder="Restaurant, museum, venue..."
        />
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>Address *</label>
        <PlaceAutocomplete
          value={formData.address}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, address: value }))
            setEventLocation(undefined) // Clear coordinates when typing
          }}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search for address or place"
          required
        />
      </div>

      {/* Start / End */}
      {trip && (
        <div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label className={labelClass}>Start</label>
              <div className="flex gap-1.5">
                <div className="flex-1 min-w-0">
                  <DaySelect
                    trip={trip}
                    value={formData.day}
                    onChange={(day) => setFormData(prev => ({ 
                      ...prev, 
                      day,
                      endDay: prev.endDay && prev.endDay < day ? undefined : prev.endDay
                    }))}
                    required
                  />
                </div>
                <TimePicker
                  value={formData.time}
                  onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>End</label>
              <div className="flex gap-1.5">
                <div className="flex-1 min-w-0">
                  <DaySelect
                    trip={trip}
                    value={formData.endDay ?? formData.day}
                    onChange={(day) => setFormData(prev => ({ 
                      ...prev, 
                      endDay: day === prev.day ? undefined : day
                    }))}
                    minDay={formData.day}
                  />
                </div>
                <TimePicker
                  value={formData.endTime}
                  onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <StatusToggle
          value={formData.status}
          onChange={(status) => setFormData(prev => ({ ...prev, status }))}
        />
      </div>

      {/* Recommendations Section - show for draft activities */}
      {formData.status === 'draft' && (
        <RecommendationsSection
          activity={{
            type: 'event',
            status: formData.status,
            city: formData.city || undefined,
            day: formData.day,
            time: formData.time,
            endDay: formData.endDay,
            endTime: formData.endTime
          }}
        />
      )}

      {/* Action Buttons */}
      <FormActions
        onCancel={onCancel}
        onDelete={onDelete}
        isEditing={!!activity}
      />
    </form>
  )
}
