'use client'

import { useState, useEffect } from 'react'
import type { Activity, TransportMetadata, ActivityStatus, ActivityContext, GeoLocation } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'
import { PlaceAutocomplete } from '@/components/ui/autocomplete'
import type { PlaceResult } from '@/lib/places-service'

interface TransportFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

export function TransportForm({ activity, onSave, onCancel, onDelete, defaultDay = 1, initialContext }: TransportFormProps) {
  const { trip } = useTripContext()
  const [formData, setFormData] = useState({
    from: initialContext?.fromCity || '',
    to: initialContext?.toCity || '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    vehicleType: '',
    status: 'draft' as ActivityStatus
  })
  
  // Track coordinates for map display
  const [fromLocation, setFromLocation] = useState<GeoLocation | undefined>(undefined)
  const [toLocation, setToLocation] = useState<GeoLocation | undefined>(undefined)

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as TransportMetadata || {}
      setFormData({
        from: metadata.from || '',
        to: metadata.to || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        vehicleType: metadata.vehicleType || '',
        status: activity.status
      })
      // Restore locations from activity if available
      if (activity.location?.start) {
        setFromLocation(activity.location.start)
      }
      if (activity.location?.end) {
        setToLocation(activity.location.end)
      }
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.from && formData.to) {
      let title = `${formData.from} → ${formData.to}`
      if (formData.vehicleType) {
        title = `${formData.vehicleType}: ${title}`
      }
      return title
    }
    if (formData.vehicleType) {
      return formData.vehicleType
    }
    return 'Transport'
  }

  const handleFromPlaceSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setFromLocation({ lat: place.lat, lng: place.lng })
    }
  }

  const handleToPlaceSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setToLocation({ lat: place.lat, lng: place.lng })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || '1',
      type: 'transport',
      title: generateTitle(),
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.from || undefined,
      status: formData.status,
      location: (fromLocation || toLocation) ? {
        start: fromLocation || toLocation!,
        end: toLocation
      } : undefined,
      metadata: {
        from: formData.from || undefined,
        to: formData.to || undefined,
        vehicleType: formData.vehicleType || undefined
      } as TransportMetadata
    }

    onSave(activityData)
  }

  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* From / To */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <label className={labelClass}>From *</label>
          <PlaceAutocomplete
            value={formData.from}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, from: value }))
              setFromLocation(undefined) // Clear coordinates when typing
            }}
            onPlaceSelect={handleFromPlaceSelect}
            placeholder="Where from?"
            required
          />
        </div>
        <div>
          <label className={labelClass}>To *</label>
          <PlaceAutocomplete
            value={formData.to}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, to: value }))
              setToLocation(undefined) // Clear coordinates when typing
            }}
            onPlaceSelect={handleToPlaceSelect}
            placeholder="Where to?"
            required
          />
        </div>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className={labelClass}>Vehicle type</label>
        <input
          type="text"
          value={formData.vehicleType}
          onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
          className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="Train, Bus, Taxi, etc."
        />
      </div>

      {/* Departure / Arrival */}
      {trip && (
        <div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label className={labelClass}>Departure</label>
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
              <label className={labelClass}>Arrival</label>
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
            type: 'transport',
            status: formData.status,
            city: formData.from && formData.to ? `${formData.from} to ${formData.to}` : undefined,
            day: formData.day
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
