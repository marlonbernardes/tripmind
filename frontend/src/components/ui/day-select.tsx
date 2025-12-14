'use client'

import { useMemo } from 'react'
import type { Trip } from '@/types/simple'
import { isFixedTrip } from '@/types/simple'
import { getTripDuration, getDateForDay } from '@/lib/date-service'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DaySelectProps {
  trip: Trip
  value: number
  onChange: (day: number) => void
  label?: string
  minDay?: number
  required?: boolean
  className?: string
}

/**
 * DaySelect component - renders different UI based on trip type:
 * - Flexible trips: shadcn Select dropdown (Day 1, Day 2, Day 3...)
 * - Fixed trips: native date picker showing actual dates
 */
export function DaySelect({ 
  trip, 
  value, 
  onChange, 
  label,
  minDay = 1,
  required = false,
  className = ''
}: DaySelectProps) {
  const duration = getTripDuration(trip)
  const days = useMemo(() => 
    Array.from({ length: duration }, (_, i) => i + 1).filter(d => d >= minDay),
    [duration, minDay]
  )

  if (isFixedTrip(trip)) {
    // Fixed trip: show date picker
    const selectedDate = getDateForDay(trip, value)
    const minDate = minDay > 1 ? getDateForDay(trip, minDay) : new Date(trip.startDate)
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = new Date(e.target.value)
      const startDate = new Date(trip.startDate)
      const diffTime = selectedDate.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const day = diffDays + 1
      if (day >= minDay && day <= duration) {
        onChange(day)
      }
    }

    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && '*'}
          </label>
        )}
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          min={minDate.toISOString().split('T')[0]}
          max={trip.endDate}
          onChange={handleDateChange}
          required={required}
          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>
    )
  }

  // Flexible trip: show shadcn Select dropdown
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && '*'}
        </label>
      )}
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select day" />
        </SelectTrigger>
        <SelectContent>
          {days.map(day => (
            <SelectItem key={day} value={day.toString()}>
              Day {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface DayRangeSelectProps {
  trip: Trip
  startDay: number
  endDay?: number
  onStartDayChange: (day: number) => void
  onEndDayChange: (day: number | undefined) => void
  startLabel?: string
  endLabel?: string
  required?: boolean
  className?: string
}

/**
 * DayRangeSelect - for selecting a range of days (e.g., hotel check-in/check-out)
 */
export function DayRangeSelect({
  trip,
  startDay,
  endDay,
  onStartDayChange,
  onEndDayChange,
  startLabel = 'Start Day',
  endLabel = 'End Day',
  required = false,
  className = ''
}: DayRangeSelectProps) {
  const duration = getTripDuration(trip)

  if (isFixedTrip(trip)) {
    // Fixed trip: show two date pickers
    const startDate = getDateForDay(trip, startDay)
    const endDate = endDay ? getDateForDay(trip, endDay) : undefined

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = new Date(e.target.value)
      const tripStart = new Date(trip.startDate)
      const diffTime = selectedDate.getTime() - tripStart.getTime()
      const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      if (day >= 1 && day <= duration) {
        onStartDayChange(day)
        if (endDay && endDay < day) {
          onEndDayChange(undefined)
        }
      }
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        onEndDayChange(undefined)
        return
      }
      const selectedDate = new Date(e.target.value)
      const tripStart = new Date(trip.startDate)
      const diffTime = selectedDate.getTime() - tripStart.getTime()
      const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      if (day >= startDay && day <= duration) {
        onEndDayChange(day)
      }
    }

    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {startLabel} {required && '*'}
          </label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            min={trip.startDate}
            max={trip.endDate}
            onChange={handleStartDateChange}
            required={required}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {endLabel}
          </label>
          <input
            type="date"
            value={endDate?.toISOString().split('T')[0] || ''}
            min={startDate.toISOString().split('T')[0]}
            max={trip.endDate}
            onChange={handleEndDateChange}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    )
  }

  // Flexible trip: show two Select dropdowns
  const startDays = Array.from({ length: duration }, (_, i) => i + 1)
  const endDays = Array.from({ length: duration - startDay + 1 }, (_, i) => startDay + i)

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {startLabel} {required && '*'}
        </label>
        <Select
          value={startDay.toString()}
          onValueChange={(val) => {
            const day = parseInt(val)
            onStartDayChange(day)
            if (endDay && endDay < day) {
              onEndDayChange(undefined)
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {startDays.map(day => (
              <SelectItem key={day} value={day.toString()}>
                Day {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {endLabel}
        </label>
        <Select
          value={endDay?.toString() || ''}
          onValueChange={(val) => onEndDayChange(val ? parseInt(val) : undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Same day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Same day</SelectItem>
            {endDays.map(day => (
              <SelectItem key={day} value={day.toString()}>
                Day {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
