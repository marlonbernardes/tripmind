'use client'

import { useState, useEffect } from 'react'
import type { Activity, StayMetadata, ActivityStatus, ActivityContext } from '@/types/simple'
import { RecommendationsSection } from './RecommendationsSection'
import { useTripContext } from '@/contexts/TripContext'
import { DaySelect } from '@/components/ui/day-select'
import { TimePicker } from '@/components/ui/date-time-picker'
import { StatusToggle } from '@/components/ui/status-toggle'
import { FormActions } from '@/components/ui/form-actions'

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
    city: initialContext?.city || '',
    day: defaultDay,
    time: '',
    endDay: initialContext?.checkOutDay as number | undefined,
    endTime: '',
    confirmationCode: '',
    status: 'draft' as ActivityStatus
  })

  useEffect(() => {
    if (activity) {
      const metadata = activity.metadata as StayMetadata || {}
      setFormData({
        propertyName: activity.title || '',
        city: activity.city || '',
        day: activity.day,
        time: activity.time || '',
        endDay: activity.endDay,
        endTime: activity.endTime || '',
        confirmationCode: metadata.confirmationCode || '',
        status: activity.status
      })
    }
  }, [activity])

  const generateTitle = () => {
    if (formData.propertyName) {
      return formData.propertyName
    }
    return 'Accommodation'
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
      status: formData.status,
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
        <input
          type="text"
          value={formData.propertyName}
          onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
          className={inputClass}
          placeholder="Hotel or accommodation name"
          required
        />
      </div>

      {/* City */}
      <div>
        <label className={labelClass}>City *</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          className={inputClass}
          placeholder="City"
          required
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
