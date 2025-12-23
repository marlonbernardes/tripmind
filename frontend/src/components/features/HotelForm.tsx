'use client'

import { useState, useEffect } from 'react'
import type { Activity, StayMetadata, ActivityStatus, ActivityContext, GeoLocation } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'
import { HotelAutocomplete, PlaceAutocomplete } from '@/components/ui/autocomplete'
import type { HotelResult, PlaceResult } from '@/lib/places-service'

interface StayFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

export function StayForm({ activity, onSave, onCancel, onDelete, defaultDay = 1, initialContext }: StayFormProps) {
  const { trip } = useTripContext()
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: initialContext?.city || '',
    day: defaultDay,
    time: '',
    endDay: initialContext?.checkOutDay as number | undefined,
    endTime: '',
    confirmationCode: '',
    status: 'draft' as ActivityStatus
  })
  
  // Track hotel coordinates
  const [hotelLocation, setHotelLocation] = useState<GeoLocation | undefined>(
    activity?.location?.start
  )
  // Track if address was auto-populated from hotel selection
  const [addressFromHotel, setAddressFromHotel] = useState(false)

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as StayMetadata || {}
      setFormData({
        propertyName: activity.title || '',
        address: activity.address || '',
        city: activity.city || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        confirmationCode: metadata.confirmationCode || '',
        status: activity.status
      })
      // Set location from existing activity
      setHotelLocation(activity.location?.start)
      // If activity has address, assume it was from hotel
      if (activity.address) {
        setAddressFromHotel(true)
      }
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.propertyName) {
      return formData.propertyName
    }
    return 'Accommodation'
  }

  // Handle hotel selection from autocomplete
  const handleHotelSelect = (hotel: HotelResult) => {
    // Set coordinates
    if (hotel.lat && hotel.lng) {
      setHotelLocation({ lat: hotel.lat, lng: hotel.lng })
    }
    // Auto-populate address from hotel
    if (hotel.address) {
      setFormData(prev => ({ 
        ...prev, 
        address: hotel.address!,
        city: hotel.city || prev.city
      }))
      setAddressFromHotel(true)
    } else if (hotel.city) {
      // Fallback: use city as address if no address
      setFormData(prev => ({ ...prev, city: hotel.city! }))
    }
  }

  // Handle manual address selection (when hotel not found)
  const handleAddressSelect = (place: PlaceResult) => {
    if (place.lat !== undefined && place.lng !== undefined) {
      setHotelLocation({ lat: place.lat, lng: place.lng })
    }
    // Extract city from place
    if (place.city) {
      setFormData(prev => ({ ...prev, city: place.city! }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || '1',
      type: 'stay',
      title: generateTitle(),
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.city || undefined,
      address: formData.address || undefined,
      status: formData.status,
      // Include location with coordinates if available
      location: hotelLocation ? {
        start: hotelLocation
      } : undefined,
      metadata: {
        propertyName: formData.propertyName || undefined,
        confirmationCode: formData.confirmationCode || undefined
      } as StayMetadata
    }

    onSave(activityData)
  }

  const inputClass = "w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Property Name */}
      <div>
        <label className={labelClass}>Property *</label>
        <HotelAutocomplete
          value={formData.propertyName}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, propertyName: value }))
            // Clear coordinates and unlock address when typing
            setHotelLocation(undefined)
            setAddressFromHotel(false)
          }}
          onHotelSelect={handleHotelSelect}
          placeholder="Hotel or accommodation name"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>
          Address
          {addressFromHotel && (
            <span className="ml-1 text-[10px] text-muted-foreground font-normal">(from property)</span>
          )}
        </label>
        <PlaceAutocomplete
          value={formData.address}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, address: value }))
            // Clear coordinates when typing manually
            if (!addressFromHotel) {
              setHotelLocation(undefined)
            }
          }}
          onPlaceSelect={handleAddressSelect}
          placeholder="Enter address if property not found"
          disabled={addressFromHotel}
        />
      </div>

      {/* Check-in / Check-out */}
      {trip && (
        <div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label className={labelClass}>Check-in</label>
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
              <label className={labelClass}>Check-out</label>
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

      {/* Confirmation Code - only show when confirmed */}
      {formData.status === 'confirmed' && (
        <div>
          <label className={labelClass}>Confirmation code</label>
          <input
            type="text"
            value={formData.confirmationCode}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmationCode: e.target.value }))}
            className={inputClass}
            placeholder="Booking reference"
          />
        </div>
      )}

      {/* Recommendations Section - show for draft activities */}
      {formData.status === 'draft' && (
        <RecommendationsSection
          activity={{
            type: 'stay',
            status: formData.status,
            city: formData.city || undefined,
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

// Backward compatibility alias
export const HotelForm = StayForm
