'use client'

import { useState, useEffect, useCallback } from 'react'
import type { 
  Activity, 
  ActivityType, 
  ActivityStatus, 
  ActivityContext, 
  GeoLocation,
  FlightMetadata,
  StayMetadata,
  EventMetadata,
  TransportMetadata
} from '@/types/simple'
import { 
  ACTIVITY_FIELD_CONFIGS, 
  FIELD_LAYOUT, 
  DATE_TIME_LABELS,
  TITLE_GENERATORS,
  getFieldById,
  isLocationField,
  type FormFieldConfig,
  type FormData
} from '@/lib/activity-form-config'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'
import { 
  AirportAutocomplete, 
  HotelAutocomplete, 
  PlaceAutocomplete 
} from '@/components/ui/autocomplete'
import type { Airport } from '@/lib/airport-service'
import type { HotelResult, PlaceResult } from '@/lib/places-service'

interface ActivityFormProps {
  type: ActivityType
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

// Form state type
interface FormState extends FormData {
  day: number
  time: string
  endDay: number | undefined
  endTime: string
  status: ActivityStatus
  city: string
  fromCity: string
  toCity: string
}

export function ActivityForm({ 
  type, 
  activity, 
  onSave, 
  onCancel, 
  onDelete, 
  defaultDay = 1, 
  initialContext 
}: ActivityFormProps) {
  const { trip } = useTripContext()
  const fields = ACTIVITY_FIELD_CONFIGS[type]
  const layout = FIELD_LAYOUT[type]
  const dateTimeLabels = DATE_TIME_LABELS[type]
  
  // Initialize form state
  const [formData, setFormData] = useState<FormState>(() => {
    const initial: FormState = {
      day: defaultDay,
      time: '',
      endDay: initialContext?.checkOutDay,
      endTime: '',
      status: 'draft',
      city: initialContext?.city || '',
      fromCity: initialContext?.fromCity || '',
      toCity: initialContext?.toCity || '',
    }
    
    // Initialize all field values to empty strings
    fields.forEach(field => {
      initial[field.id] = ''
    })
    
    // Pre-populate from initialContext
    if (initialContext?.fromCity && type === 'flight') {
      initial.from = initialContext.fromCity
    }
    if (initialContext?.toCity && type === 'flight') {
      initial.to = initialContext.toCity
    }
    
    return initial
  })
  
  // Track locations separately
  const [startLocation, setStartLocation] = useState<GeoLocation | undefined>(
    activity?.location?.start
  )
  const [endLocation, setEndLocation] = useState<GeoLocation | undefined>(
    activity?.location?.end
  )
  
  // Track if address was auto-populated from hotel selection (for stay type)
  const [addressFromHotel, setAddressFromHotel] = useState(false)

  // Load existing activity data
  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata || {}
      
      const loaded: Partial<FormState> = {
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        status: activity.status,
        city: activity.city || '',
      }
      
      // Load field values from activity and metadata
      fields.forEach(field => {
        field.mapTo.forEach(mapping => {
          if (mapping.target === 'activity') {
            const value = (activity as unknown as Record<string, unknown>)[mapping.property]
            if (value !== undefined) {
              loaded[field.id] = value as string
            }
          } else if (mapping.target === 'metadata') {
            const value = (metadata as Record<string, unknown>)[mapping.property]
            if (value !== undefined) {
              loaded[field.id] = value as string
            }
          }
        })
      })
      
      // Load transport-specific city fields
      if (type === 'transport' && metadata) {
        const transportMeta = metadata as TransportMetadata
        loaded.fromCity = transportMeta.from || ''
        loaded.toCity = transportMeta.to || ''
      }
      
      setFormData(prev => ({ ...prev, ...loaded }))
      setStartLocation(activity.location?.start)
      setEndLocation(activity.location?.end)
      
      // If stay has address, assume it was from hotel
      if (type === 'stay' && activity.address) {
        setAddressFromHotel(true)
      }
    }
  }, [activity, fields, type])

  // Update a form field
  const updateField = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }, [])

  // Handle location selection from autocomplete
  const handleLocationSelect = useCallback((
    fieldId: string, 
    location: GeoLocation | undefined, 
    city?: string,
    derivesCity?: 'city' | 'fromCity' | 'toCity'
  ) => {
    const field = getFieldById(type, fieldId)
    if (field && isLocationField(field)) {
      if (field.locationField === 'start') {
        setStartLocation(location)
      } else {
        setEndLocation(location)
      }
      
      // Update city field if specified
      const cityField = derivesCity || field.derivesCity
      if (city && cityField) {
        setFormData(prev => ({ ...prev, [cityField]: city }))
      }
    }
  }, [type])

  // Handle airport selection
  const handleAirportSelect = useCallback((fieldId: string, airport: Airport) => {
    const field = getFieldById(type, fieldId)
    if (field && isLocationField(field)) {
      if (field.locationField === 'start') {
        setStartLocation({ lat: airport.lat, lng: airport.lng })
      } else {
        setEndLocation({ lat: airport.lat, lng: airport.lng })
      }
    }
  }, [type])

  // Handle hotel selection
  const handleHotelSelect = useCallback((hotel: HotelResult) => {
    if (hotel.lat && hotel.lng) {
      setStartLocation({ lat: hotel.lat, lng: hotel.lng })
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
      setFormData(prev => ({ ...prev, city: hotel.city! }))
    }
  }, [])

  // Handle place selection
  const handlePlaceSelect = useCallback((fieldId: string, place: PlaceResult) => {
    const field = getFieldById(type, fieldId)
    if (!field) return
    
    // Set location
    if (isLocationField(field)) {
      if (place.lat !== undefined && place.lng !== undefined) {
        const loc = { lat: place.lat, lng: place.lng }
        if (field.locationField === 'start') {
          setStartLocation(loc)
        } else {
          setEndLocation(loc)
        }
      }
      
      // Update city field
      if (place.city && field.derivesCity) {
        setFormData(prev => ({ ...prev, [field.derivesCity!]: place.city! }))
      }
    }
    
    // For events, auto-populate place name
    if (type === 'event' && fieldId === 'address' && place.name) {
      setFormData(prev => ({ 
        ...prev, 
        placeName: prev.placeName || place.name,
        city: place.city || prev.city
      }))
    }
  }, [type])

  // Generate title based on form data
  const generateTitle = useCallback(() => {
    return TITLE_GENERATORS[type](formData)
  }, [type, formData])

  // Build activity data for submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build metadata object
    const metadata: Record<string, string | undefined> = {}
    fields.forEach(field => {
      field.mapTo.forEach(mapping => {
        if (mapping.target === 'metadata' && formData[field.id]) {
          metadata[mapping.property] = formData[field.id] as string
        }
      })
    })
    
    // Add transport-specific city fields to metadata
    if (type === 'transport') {
      if (formData.fromCity) metadata.from = formData.fromCity
      if (formData.toCity) metadata.to = formData.toCity
    }
    
    // Determine title - use activity.title mapping if exists, otherwise generate
    let title = generateTitle()
    const titleField = fields.find(f => f.mapTo.some(m => m.target === 'activity' && m.property === 'title'))
    if (titleField && formData[titleField.id]) {
      title = formData[titleField.id] as string
    }
    
    // Determine address
    let address: string | undefined
    const addressField = fields.find(f => f.mapTo.some(m => m.target === 'activity' && m.property === 'address'))
    if (addressField && formData[addressField.id]) {
      address = formData[addressField.id] as string
    }
    
    // Build location object
    let location: Activity['location'] | undefined
    if (startLocation) {
      location = { start: startLocation }
      if (endLocation) {
        location.end = endLocation
      }
    }
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || trip?.id || '1',
      type,
      title,
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.city || (type === 'flight' ? (formData.from as string) : undefined) || (type === 'transport' ? formData.fromCity : undefined),
      address,
      status: formData.status,
      location,
      metadata: metadata as FlightMetadata | StayMetadata | EventMetadata | TransportMetadata,
    }

    onSave(activityData)
  }

  // Render a single field
  const renderField = (field: FormFieldConfig) => {
    const value = (formData[field.id] || '') as string
    const labelClass = "block text-xs font-medium text-muted-foreground mb-1"
    const inputClass = "w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    
    // Don't render confirmation field if status is draft
    if (field.type === 'confirmation' && formData.status !== 'confirmed') {
      return null
    }
    
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id}>
            <label className={labelClass}>
              {field.label}{field.required && ' *'}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={inputClass}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )
        
      case 'airport':
        return (
          <div key={field.id}>
            <label className={labelClass}>
              {field.label}{field.required && ' *'}
            </label>
            <AirportAutocomplete
              value={value}
              onChange={(v) => {
                updateField(field.id, v)
                // Clear coordinates when typing
                if (isLocationField(field)) {
                  if (field.locationField === 'start') {
                    setStartLocation(undefined)
                  } else {
                    setEndLocation(undefined)
                  }
                }
              }}
              onAirportSelect={(airport) => handleAirportSelect(field.id, airport)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )
        
      case 'hotel':
        return (
          <div key={field.id}>
            <label className={labelClass}>
              {field.label}{field.required && ' *'}
            </label>
            <HotelAutocomplete
              value={value}
              onChange={(v) => {
                updateField(field.id, v)
                // Clear coordinates and unlock address when typing
                setStartLocation(undefined)
                setAddressFromHotel(false)
              }}
              onHotelSelect={handleHotelSelect}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )
        
      case 'address':
        // For stay type, address may be locked from hotel selection
        const isLocked = type === 'stay' && field.id === 'address' && addressFromHotel
        return (
          <div key={field.id}>
            <label className={labelClass}>
              {field.label}{field.required && ' *'}
              {isLocked && (
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(from property)</span>
              )}
            </label>
            <PlaceAutocomplete
              value={value}
              onChange={(v) => {
                updateField(field.id, v)
                // Clear coordinates when typing
                if (isLocationField(field)) {
                  if (field.locationField === 'start') {
                    setStartLocation(undefined)
                  } else {
                    setEndLocation(undefined)
                  }
                }
              }}
              onPlaceSelect={(place) => handlePlaceSelect(field.id, place)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isLocked}
            />
          </div>
        )
        
      case 'pills':
        if (!field.options) return null
        return (
          <div key={field.id}>
            <label className={labelClass}>{field.label}</label>
            <div className="flex flex-wrap gap-1.5">
              {field.options.map((option) => {
                const Icon = option.icon
                const isSelected = value === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateField(field.id, isSelected ? '' : option.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
        
      case 'confirmation':
        return (
          <div key={field.id}>
            <label className={labelClass}>{field.label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={inputClass}
              placeholder={field.placeholder}
            />
          </div>
        )
        
      default:
        return null
    }
  }

  // Render fields according to layout
  const renderFieldGroups = () => {
    return layout.map(group => {
      const renderedFields = group.fieldIds
        .map(id => getFieldById(type, id))
        .filter((f): f is FormFieldConfig => f !== undefined)
        .map(renderField)
        .filter(Boolean)
      
      if (renderedFields.length === 0) return null
      
      if (group.type === 'row') {
        return (
          <div 
            key={group.id} 
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          >
            {renderedFields}
          </div>
        )
      }
      
      return <div key={group.id}>{renderedFields}</div>
    })
  }

  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type-specific fields */}
      {renderFieldGroups()}

      {/* Date/Time Section */}
      {trip && (
        <div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div>
              <label className={labelClass}>{dateTimeLabels.startLabel}</label>
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
              <label className={labelClass}>{dateTimeLabels.endLabel}</label>
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
            type,
            status: formData.status,
            city: type === 'flight' 
              ? (formData.from && formData.to ? `${formData.from} to ${formData.to}` : undefined)
              : type === 'transport'
                ? (formData.fromCity && formData.toCity ? `${formData.fromCity} to ${formData.toCity}` : undefined)
                : formData.city || undefined,
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
