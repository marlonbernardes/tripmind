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
import { Train, Bus, Car, Ship } from 'lucide-react'

// Vehicle type options with icons
const VEHICLE_TYPES = [
  { id: 'train', label: 'Train', icon: Train },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'taxi', label: 'Taxi', icon: Car },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'ferry', label: 'Ferry', icon: Ship },
] as const

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
    fromAddress: '',
    toAddress: '',
    fromCity: initialContext?.fromCity || '',
    toCity: initialContext?.toCity || '',
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
        fromAddress: metadata.fromAddress || metadata.from || '',
        toAddress: metadata.toAddress || metadata.to || '',
        fromCity: metadata.from || '',
        toCity: metadata.to || '',
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
    const from = formData.fromCity || formData.fromAddress
    const to = formData.toCity || formData.toAddress
    if (from && to) {
      let title = `${from} → ${to}`
      if (formData.vehicleType) {
        const vehicleLabel = VEHICLE_TYPES.find(v => v.id === formData.vehicleType)?.label || formData.vehicleType
        title = `${vehicleLabel}: ${title}`
      }
      return title
    }
    if (formData.vehicleType) {
      return VEHICLE_TYPES.find(v => v.id === formData.vehicleType)?.label || formData.vehicleType
    }
    return 'Transport'
  }

  const handleFromPlaceSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setFromLocation({ lat: place.lat, lng: place.lng })
    }
    // Extract city from place
    if (place.city) {
      setFormData(prev => ({ ...prev, fromCity: place.city! }))
    }
  }

  const handleToPlaceSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setToLocation({ lat: place.lat, lng: place.lng })
    }
    // Extract city from place
    if (place.city) {
      setFormData(prev => ({ ...prev, toCity: place.city! }))
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
      city: formData.fromCity || undefined,
      address: formData.fromAddress || undefined,
      status: formData.status,
      location: (fromLocation || toLocation) ? {
        start: fromLocation || toLocation!,
        end: toLocation
      } : undefined,
      metadata: {
        from: formData.fromCity || undefined,
        to: formData.toCity || undefined,
        fromAddress: formData.fromAddress || undefined,
        toAddress: formData.toAddress || undefined,
        vehicleType: formData.vehicleType || undefined
      } as TransportMetadata
    }

    onSave(activityData)
  }

  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Vehicle Type Pills */}
      <div>
        <label className={labelClass}>Vehicle type</label>
        <div className="flex flex-wrap gap-1.5">
          {VEHICLE_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.vehicleType === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  vehicleType: prev.vehicleType === type.id ? '' : type.id 
                }))}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* From / To Addresses */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <label className={labelClass}>From *</label>
          <PlaceAutocomplete
            value={formData.fromAddress}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, fromAddress: value }))
              setFromLocation(undefined) // Clear coordinates when typing
            }}
            onPlaceSelect={handleFromPlaceSelect}
            placeholder="Departure address"
            required
          />
        </div>
        <div>
          <label className={labelClass}>To *</label>
          <PlaceAutocomplete
            value={formData.toAddress}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, toAddress: value }))
              setToLocation(undefined) // Clear coordinates when typing
            }}
            onPlaceSelect={handleToPlaceSelect}
            placeholder="Arrival address"
            required
          />
        </div>
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
            city: formData.fromCity && formData.toCity ? `${formData.fromCity} to ${formData.toCity}` : undefined,
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
