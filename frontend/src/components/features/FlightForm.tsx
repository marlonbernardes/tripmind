'use client'

import { useState, useEffect } from 'react'
import type { Activity, FlightMetadata, ActivityStatus, ActivityContext } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'
import { AirportAutocomplete } from '@/components/ui/autocomplete'

interface FlightFormProps {
  activity?: Activity
  onSave: (activityData: Omit<Activity, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
  defaultDay?: number
  initialContext?: ActivityContext
}

export function FlightForm({ activity, onSave, onCancel, onDelete, defaultDay = 1, initialContext }: FlightFormProps) {
  const { trip } = useTripContext()
  const [formData, setFormData] = useState({
    from: initialContext?.fromCity || '',
    to: initialContext?.toCity || '',
    day: defaultDay,
    time: '',
    endDay: undefined as number | undefined,
    endTime: '',
    flightNumber: '',
    airline: '',
    status: 'draft' as ActivityStatus
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as FlightMetadata || {}
      setFormData({
        from: metadata.from || '',
        to: metadata.to || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        flightNumber: metadata.flightNumber || '',
        airline: metadata.airline || '',
        status: activity.status
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.from && formData.to) {
      let title = `Flight from ${formData.from} to ${formData.to}`
      if (formData.flightNumber) {
        title += ` - ${formData.flightNumber}`
      }
      return title
    }
    return 'Flight'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const activityData: Omit<Activity, 'id'> = {
      tripId: activity?.tripId || '1',
      type: 'flight',
      title: generateTitle(),
      day: formData.day,
      time: formData.time || undefined,
      endDay: formData.endDay,
      endTime: formData.endTime || undefined,
      city: formData.from || undefined,
      status: formData.status,
      metadata: {
        from: formData.from || undefined,
        to: formData.to || undefined,
        flightNumber: formData.flightNumber || undefined,
        airline: formData.airline || undefined
      } as FlightMetadata
    }

    onSave(activityData)
  }

  const inputClass = "w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* From / To */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <label className={labelClass}>From *</label>
          <AirportAutocomplete
            value={formData.from}
            onChange={(value) => setFormData(prev => ({ ...prev, from: value }))}
            placeholder="City or airport code"
            required
          />
        </div>
        <div>
          <label className={labelClass}>To *</label>
          <AirportAutocomplete
            value={formData.to}
            onChange={(value) => setFormData(prev => ({ ...prev, to: value }))}
            placeholder="City or airport code"
            required
          />
        </div>
      </div>

      {/* Departure → Arrival */}
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

      {/* Flight Details */}
      <div>
        <label className={labelClass}>Flight details</label>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          <input
            type="text"
            value={formData.flightNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, flightNumber: e.target.value }))}
            className={inputClass}
            placeholder="Flight #"
          />
          <input
            type="text"
            value={formData.airline}
            onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
            className={inputClass}
            placeholder="Airline"
          />
        </div>
      </div>

      {/* Recommendations Section - show for draft activities */}
      {formData.status === 'draft' && (
        <RecommendationsSection
          activity={{
            type: 'flight',
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
