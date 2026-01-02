import type { ActivityType } from '@/types/simple'
import { Train, Bus, Car, Ship, type LucideIcon } from 'lucide-react'

// ==================== FIELD TYPES ====================

export type FieldType = 
  | 'text'           // Plain text input
  | 'airport'        // Airport autocomplete
  | 'hotel'          // Hotel autocomplete  
  | 'address'        // Address/place autocomplete
  | 'pills'          // Selectable pill buttons
  | 'confirmation'   // Confirmation code (shown when confirmed)

export interface PropertyMapping {
  target: 'activity' | 'metadata'
  property: string  // Property path (e.g., 'title', 'from')
}

export interface PillOption {
  id: string
  label: string
  icon?: LucideIcon
}

// Base field config
export interface FieldConfig {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  options?: PillOption[]  // For 'pills' type only
  mapTo: PropertyMapping[]
}

// Extended config for location-providing fields
export interface LocationFieldConfig extends FieldConfig {
  locationField: 'start' | 'end'
  derivesCity?: 'city' | 'fromCity' | 'toCity'  // Which form field to populate with city
}

// Union type for all field configs
export type FormFieldConfig = FieldConfig | LocationFieldConfig

// Type guard
export function isLocationField(field: FormFieldConfig): field is LocationFieldConfig {
  return 'locationField' in field
}

// ==================== FIELD CONFIGURATIONS ====================

export const FLIGHT_FIELDS: FormFieldConfig[] = [
  {
    id: 'from',
    type: 'airport',
    label: 'From',
    placeholder: 'City or airport code',
    required: true,
    mapTo: [{ target: 'metadata', property: 'from' }],
    locationField: 'start',
  } as LocationFieldConfig,
  {
    id: 'to',
    type: 'airport',
    label: 'To',
    placeholder: 'City or airport code',
    required: true,
    mapTo: [{ target: 'metadata', property: 'to' }],
    locationField: 'end',
  } as LocationFieldConfig,
  {
    id: 'flightNumber',
    type: 'text',
    label: 'Flight #',
    placeholder: 'Flight #',
    mapTo: [{ target: 'metadata', property: 'flightNumber' }],
  },
  {
    id: 'airline',
    type: 'text',
    label: 'Airline',
    placeholder: 'Airline',
    mapTo: [{ target: 'metadata', property: 'airline' }],
  },
  {
    id: 'confirmationCode',
    type: 'confirmation',
    label: 'Confirmation code',
    placeholder: 'Booking reference',
    mapTo: [{ target: 'metadata', property: 'confirmationCode' }],
  },
]

export const STAY_FIELDS: FormFieldConfig[] = [
  {
    id: 'propertyName',
    type: 'hotel',
    label: 'Property',
    placeholder: 'Hotel or accommodation name',
    required: true,
    mapTo: [
      { target: 'activity', property: 'title' },
      { target: 'metadata', property: 'propertyName' },
    ],
    locationField: 'start',
    derivesCity: 'city',
  } as LocationFieldConfig,
  {
    id: 'address',
    type: 'address',
    label: 'Address',
    placeholder: 'Enter address if property not found',
    mapTo: [{ target: 'activity', property: 'address' }],
    locationField: 'start',
    derivesCity: 'city',
  } as LocationFieldConfig,
  {
    id: 'confirmationCode',
    type: 'confirmation',
    label: 'Confirmation code',
    placeholder: 'Booking reference',
    mapTo: [{ target: 'metadata', property: 'confirmationCode' }],
  },
]

export const EVENT_FIELDS: FormFieldConfig[] = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
    placeholder: 'Event name',
    required: true,
    mapTo: [{ target: 'activity', property: 'title' }],
  },
  {
    id: 'placeName',
    type: 'text',
    label: 'Place name',
    placeholder: 'Restaurant, museum, venue...',
    mapTo: [{ target: 'metadata', property: 'placeName' }],
  },
  {
    id: 'address',
    type: 'address',
    label: 'Address',
    placeholder: 'Search for address or place',
    required: true,
    mapTo: [{ target: 'activity', property: 'address' }],
    locationField: 'start',
    derivesCity: 'city',
  } as LocationFieldConfig,
]

export const TRANSPORT_FIELDS: FormFieldConfig[] = [
  {
    id: 'vehicleType',
    type: 'pills',
    label: 'Vehicle type',
    options: [
      { id: 'train', label: 'Train', icon: Train },
      { id: 'bus', label: 'Bus', icon: Bus },
      { id: 'taxi', label: 'Taxi', icon: Car },
      { id: 'car', label: 'Car', icon: Car },
      { id: 'ferry', label: 'Ferry', icon: Ship },
    ],
    mapTo: [{ target: 'metadata', property: 'vehicleType' }],
  },
  {
    id: 'fromAddress',
    type: 'address',
    label: 'From',
    placeholder: 'Departure address',
    required: true,
    mapTo: [{ target: 'metadata', property: 'fromAddress' }],
    locationField: 'start',
    derivesCity: 'fromCity',
  } as LocationFieldConfig,
  {
    id: 'toAddress',
    type: 'address',
    label: 'To',
    placeholder: 'Arrival address',
    required: true,
    mapTo: [{ target: 'metadata', property: 'toAddress' }],
    locationField: 'end',
    derivesCity: 'toCity',
  } as LocationFieldConfig,
]

export const POI_FIELDS: FormFieldConfig[] = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
    placeholder: 'Point of interest name',
    required: true,
    mapTo: [{ target: 'activity', property: 'title' }],
  },
  {
    id: 'placeName',
    type: 'text',
    label: 'Place name',
    placeholder: 'Specific location or landmark',
    mapTo: [{ target: 'metadata', property: 'placeName' }],
  },
  {
    id: 'address',
    type: 'address',
    label: 'Address',
    placeholder: 'Search for address or place',
    required: true,
    mapTo: [{ target: 'activity', property: 'address' }],
    locationField: 'start',
    derivesCity: 'city',
  } as LocationFieldConfig,
  {
    id: 'category',
    type: 'text',
    label: 'Category',
    placeholder: 'e.g., restaurant, museum, park',
    mapTo: [{ target: 'metadata', property: 'category' }],
  },
]

export const NOTE_FIELDS: FormFieldConfig[] = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
    placeholder: 'Note title',
    required: true,
    mapTo: [{ target: 'activity', property: 'title' }],
  },
  {
    id: 'content',
    type: 'text',
    label: 'Content',
    placeholder: 'Note details',
    mapTo: [{ target: 'metadata', property: 'content' }],
  },
  {
    id: 'category',
    type: 'text',
    label: 'Category',
    placeholder: 'e.g., packing, reminder, idea',
    mapTo: [{ target: 'metadata', property: 'category' }],
  },
]

// Map activity type to field configuration
export const ACTIVITY_FIELD_CONFIGS: Record<ActivityType, FormFieldConfig[]> = {
  flight: FLIGHT_FIELDS,
  stay: STAY_FIELDS,
  event: EVENT_FIELDS,
  transport: TRANSPORT_FIELDS,
  poi: POI_FIELDS,
  note: NOTE_FIELDS,
}

// ==================== TITLE GENERATORS ====================

export interface FormData {
  [key: string]: string | number | undefined
}

export const TITLE_GENERATORS: Record<ActivityType, (data: FormData) => string> = {
  flight: (data) => {
    const from = data.from || 'Origin'
    const to = data.to || 'Destination'
    let title = `Flight from ${from} to ${to}`
    if (data.flightNumber) {
      title += ` - ${data.flightNumber}`
    }
    return title
  },
  stay: (data) => {
    return (data.propertyName as string) || 'Accommodation'
  },
  event: (data) => {
    return (data.title as string) || 'Event'
  },
  transport: (data) => {
    const from = data.fromCity || data.fromAddress
    const to = data.toCity || data.toAddress
    let title = from && to ? `${from} → ${to}` : 'Transport'
    if (data.vehicleType) {
      const vehicleLabel = capitalize(data.vehicleType as string)
      title = `${vehicleLabel}: ${title}`
    }
    return title
  },
  poi: (data) => {
    return (data.title as string) || 'Point of Interest'
  },
  note: (data) => {
    return (data.title as string) || 'Note'
  },
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ==================== DATE/TIME LABELS ====================

export interface DateTimeLabels {
  startLabel: string
  endLabel: string
}

export const DATE_TIME_LABELS: Record<ActivityType, DateTimeLabels> = {
  flight: { startLabel: 'Departure', endLabel: 'Arrival' },
  stay: { startLabel: 'Check-in', endLabel: 'Check-out' },
  event: { startLabel: 'Start', endLabel: 'End' },
  transport: { startLabel: 'Departure', endLabel: 'Arrival' },
  poi: { startLabel: 'Visit', endLabel: 'End' },
  note: { startLabel: 'Start', endLabel: 'End' },
}

// ==================== FIELD GROUPING ====================

// Define how fields should be grouped for layout
export interface FieldGroup {
  id: string
  type: 'row' | 'single'  // 'row' = side-by-side, 'single' = full width
  fieldIds: string[]
}

export const FIELD_LAYOUT: Record<ActivityType, FieldGroup[]> = {
  flight: [
    { id: 'locations', type: 'row', fieldIds: ['from', 'to'] },
    { id: 'details', type: 'row', fieldIds: ['flightNumber', 'airline'] },
    { id: 'confirmation', type: 'single', fieldIds: ['confirmationCode'] },
  ],
  stay: [
    { id: 'property', type: 'single', fieldIds: ['propertyName'] },
    { id: 'address', type: 'single', fieldIds: ['address'] },
    { id: 'confirmation', type: 'single', fieldIds: ['confirmationCode'] },
  ],
  event: [
    { id: 'title', type: 'single', fieldIds: ['title'] },
    { id: 'place', type: 'single', fieldIds: ['placeName'] },
    { id: 'address', type: 'single', fieldIds: ['address'] },
  ],
  transport: [
    { id: 'vehicle', type: 'single', fieldIds: ['vehicleType'] },
    { id: 'locations', type: 'row', fieldIds: ['fromAddress', 'toAddress'] },
  ],
  poi: [
    { id: 'title', type: 'single', fieldIds: ['title'] },
    { id: 'place', type: 'single', fieldIds: ['placeName'] },
    { id: 'address', type: 'single', fieldIds: ['address'] },
    { id: 'category', type: 'single', fieldIds: ['category'] },
  ],
  note: [
    { id: 'title', type: 'single', fieldIds: ['title'] },
    { id: 'content', type: 'single', fieldIds: ['content'] },
    { id: 'category', type: 'single', fieldIds: ['category'] },
  ],
}

// Helper to get field config by id
export function getFieldById(type: ActivityType, fieldId: string): FormFieldConfig | undefined {
  return ACTIVITY_FIELD_CONFIGS[type].find(f => f.id === fieldId)
}
