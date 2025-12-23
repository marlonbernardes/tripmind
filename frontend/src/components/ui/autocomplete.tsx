'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Generic option type
export interface AutocompleteOption {
  value: string
  label: string
  sublabel?: string
}

export interface AutocompleteProps {
  /** Placeholder text for the input */
  placeholder?: string
  /** Currently selected value (controlled) */
  value: string
  /** Called when value changes */
  onChange: (value: string) => void
  /** Async function to search for options */
  onSearch: (query: string) => Promise<AutocompleteOption[]>
  /** Minimum characters before searching */
  minChars?: number
  /** Debounce delay in ms */
  debounceMs?: number
  /** Allow custom values not in the list */
  allowCustom?: boolean
  /** Custom placeholder when no results found */
  emptyMessage?: string
  /** Custom class name for the trigger button */
  className?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input is required */
  required?: boolean
  /** Render custom option content */
  renderOption?: (option: AutocompleteOption) => React.ReactNode
  /** Icon to display in the input */
  icon?: React.ReactNode
}

export function Autocomplete({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  minChars = 2,
  debounceMs = 300,
  allowCustom = true,
  emptyMessage = 'No results found.',
  className,
  disabled = false,
  required = false,
  renderOption,
  icon,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value with input
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounced search
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < minChars) {
        setOptions([])
        return
      }

      setIsLoading(true)
      try {
        const results = await onSearch(query)
        setOptions(results)
      } catch (error) {
        console.error('Autocomplete search error:', error)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    },
    [onSearch, minChars]
  )

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(newValue)
    }, debounceMs)

    // If allowing custom values, update immediately
    if (allowCustom) {
      onChange(newValue)
    }
  }

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label)
    onChange(option.value)
    setOpen(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setOptions([])
    inputRef.current?.focus()
  }

  const handleBlur = () => {
    // If custom values not allowed and input doesn't match any option, clear it
    if (!allowCustom && inputValue) {
      const match = options.find(
        o => o.label.toLowerCase() === inputValue.toLowerCase()
      )
      if (!match) {
        setInputValue(value) // Reset to last valid value
      }
    }
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleFocus = () => {
    setOpen(true)
    if (inputValue.length >= minChars) {
      performSearch(inputValue)
    }
  }

  const handleBlurWithDelay = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      setOpen(false)
      handleBlur()
    }, 200)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlurWithDelay}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            inputValue && 'pr-8'
          )}
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClear()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md">
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && options.length === 0 && inputValue.length >= minChars && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              {!isLoading && options.length === 0 && inputValue.length < minChars && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least {minChars} characters to search
                </div>
              )}
              {!isLoading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option, index) => (
                    <CommandItem
                      key={`${option.value}-${index}`}
                      value={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelect(option)
                      }}
                      className="cursor-pointer"
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.sublabel && (
                            <span className="text-xs text-muted-foreground">
                              {option.sublabel}
                            </span>
                          )}
                        </div>
                      )}
                      {value === option.value && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}

// ==================== Specialized Autocomplete Components ====================

import { searchAirports, formatAirport, getAirportByCode, type Airport } from '@/lib/airport-service'
import { searchHotels, searchCities, searchEstablishments, type HotelResult, type CityResult, type PlaceResult } from '@/lib/places-service'

/**
 * Airport Autocomplete
 * Searches airports by IATA code, city, or name
 */
export interface AirportAutocompleteProps {
  value: string
  onChange: (value: string) => void
  /** Called when user selects an airport from the list (provides full airport data including coordinates) */
  onAirportSelect?: (airport: Airport) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function AirportAutocomplete({
  value,
  onChange,
  onAirportSelect,
  placeholder = 'Search airports...',
  className,
  disabled,
  required,
}: AirportAutocompleteProps) {
  // Store airport data keyed by formatted display value
  const airportMapRef = React.useRef<Map<string, Airport>>(new Map())

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    const airports = await searchAirports(query)
    // Store airport data for lookup when selected
    airports.forEach(airport => {
      airportMapRef.current.set(formatAirport(airport), airport)
    })
    return airports.map((airport) => ({
      value: formatAirport(airport),
      label: formatAirport(airport),
      sublabel: airport.name,
    }))
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    // Check if the value matches a known airport and call onAirportSelect
    if (onAirportSelect) {
      const airport = airportMapRef.current.get(newValue)
      if (airport) {
        onAirportSelect(airport)
      }
    }
  }

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      allowCustom={true}
      emptyMessage="No airports found"
      icon={<span className="text-xs">✈️</span>}
    />
  )
}

/**
 * Hotel Autocomplete
 * Searches hotels/lodging using Google Places API
 */
export interface HotelAutocompleteProps {
  value: string
  onChange: (value: string) => void
  /** Called when user selects a hotel from the list (provides full hotel data including city) */
  onHotelSelect?: (hotel: HotelResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function HotelAutocomplete({
  value,
  onChange,
  onHotelSelect,
  placeholder = 'Search hotels...',
  className,
  disabled,
  required,
}: HotelAutocompleteProps) {
  // Store hotel data keyed by name for lookup when selected
  const hotelMapRef = React.useRef<Map<string, HotelResult>>(new Map())

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    const hotels = await searchHotels(query)
    // Store hotel data for lookup when selected
    hotels.forEach(hotel => {
      hotelMapRef.current.set(hotel.name, hotel)
    })
    return hotels.map((hotel) => ({
      value: hotel.name,
      label: hotel.name,
      sublabel: hotel.address,
    }))
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    // Check if the value matches a known hotel and call onHotelSelect
    if (onHotelSelect) {
      const hotel = hotelMapRef.current.get(newValue)
      if (hotel) {
        onHotelSelect(hotel)
      }
    }
  }

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      allowCustom={true}
      emptyMessage="No hotels found"
      icon={<span className="text-xs">🏨</span>}
    />
  )
}

/**
 * City Autocomplete
 * Searches cities using Google Places API
 */
export interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Search cities...',
  className,
  disabled,
  required,
}: CityAutocompleteProps) {
  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    const cities = await searchCities(query)
    return cities.map((city) => ({
      value: city.city,
      label: city.city,
      sublabel: city.country,
    }))
  }

  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      allowCustom={true}
      emptyMessage="No cities found"
      icon={<span className="text-xs">🌍</span>}
    />
  )
}

/**
 * Place Autocomplete
 * Searches any place (restaurants, museums, attractions, etc.)
 */
export interface PlaceAutocompleteProps {
  value: string
  onChange: (value: string) => void
  /** Called when user selects a place from the list (provides full place data including coordinates) */
  onPlaceSelect?: (place: PlaceResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function PlaceAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search places...',
  className,
  disabled,
  required,
}: PlaceAutocompleteProps) {
  // Store place data keyed by name for lookup when selected
  const placeMapRef = React.useRef<Map<string, PlaceResult>>(new Map())

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    const places = await searchEstablishments(query)
    // Store place data for lookup when selected
    places.forEach(place => {
      placeMapRef.current.set(place.name, place)
    })
    return places.map((place) => ({
      value: place.name,
      label: place.name,
      sublabel: place.address,
    }))
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    // Check if the value matches a known place and call onPlaceSelect
    if (onPlaceSelect) {
      const place = placeMapRef.current.get(newValue)
      if (place) {
        onPlaceSelect(place)
      }
    }
  }

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      allowCustom={true}
      emptyMessage="No places found"
      icon={<span className="text-xs">📍</span>}
    />
  )
}
