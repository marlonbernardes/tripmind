'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// ============================================================================
// DatePicker Component
// ============================================================================

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  // Track the displayed month - defaults to selected value or minDate or today
  const [month, setMonth] = React.useState<Date>(value || minDate || new Date())

  // Update displayed month when value changes
  React.useEffect(() => {
    if (value) {
      setMonth(value)
    }
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? format(value, 'EEE, MMM d') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// TimePicker Component
// ============================================================================

interface TimePickerProps {
  value?: string // HH:mm format
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = 'Time',
  disabled = false,
  className,
}: TimePickerProps) {
  return (
    <div className={cn('relative w-[100px]', className)}>
      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 pl-9 pr-1 text-sm border border-input rounded-md',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
        )}
      />
    </div>
  )
}

// ============================================================================
// DateTimePicker Component (Combined)
// ============================================================================

interface DateTimePickerProps {
  date?: Date
  time?: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  datePlaceholder?: string
  timePlaceholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  datePlaceholder,
  timePlaceholder,
  minDate,
  maxDate,
  disabled,
  className,
}: DateTimePickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <DatePicker
        value={date}
        onChange={onDateChange}
        placeholder={datePlaceholder}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
      />
      <TimePicker
        value={time}
        onChange={onTimeChange}
        placeholder={timePlaceholder}
        disabled={disabled}
      />
    </div>
  )
}
