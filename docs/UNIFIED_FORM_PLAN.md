# Unified Activity Form Architecture

## Overview

Replace 4 separate form components (FlightForm, HotelForm, EventForm, TransportForm) with a single schema-driven `ActivityForm` component.

## Field Schema

```typescript
interface FieldConfig {
  id: string                    // Unique field identifier
  type: FieldType               // Input component type
  label: string                 // Display label
  placeholder?: string          // Input placeholder
  required?: boolean            // Validation requirement
  options?: PillOption[]        // For 'pills' type only
  
  // Property mapping - where to store the value
  mapTo: PropertyMapping[]      // Can map to multiple targets
}

type FieldType = 
  | 'text'           // Plain text input
  | 'airport'        // Airport autocomplete
  | 'hotel'          // Hotel autocomplete  
  | 'address'        // Address/place autocomplete
  | 'pills'          // Selectable pill buttons
  | 'confirmation'   // Confirmation code (shown when confirmed)

interface PropertyMapping {
  target: 'activity' | 'metadata'
  property: string              // Property path (e.g., 'title', 'from')
}

// Fields that provide location data also specify which location slot
interface LocationFieldConfig extends FieldConfig {
  locationField: 'start' | 'end'  // Where to store coordinates
  derivesCity?: string            // Also populate this metadata property with city
}
```

## Field Configuration Per Type

### Flight

| Field ID | Type | Label | Required | mapTo | locationField | derivesCity |
|----------|------|-------|----------|-------|---------------|-------------|
| `from` | airport | From | ✓ | `metadata.from` | start | — |
| `to` | airport | To | ✓ | `metadata.to` | end | — |
| `flightNumber` | text | Flight # | | `metadata.flightNumber` | — | — |
| `airline` | text | Airline | | `metadata.airline` | — | — |
| `confirmationCode` | confirmation | Confirmation | | `metadata.confirmationCode` | — | — |

### Stay

| Field ID | Type | Label | Required | mapTo | locationField | derivesCity |
|----------|------|-------|----------|-------|---------------|-------------|
| `propertyName` | hotel | Property | ✓ | `activity.title`, `metadata.propertyName` | start* | `activity.city` |
| `address` | address | Address | | `activity.address` | start | `activity.city` |
| `confirmationCode` | confirmation | Confirmation | | `metadata.confirmationCode` | — | — |

*Hotel autocomplete sets location.start

### Event

| Field ID | Type | Label | Required | mapTo | locationField | derivesCity |
|----------|------|-------|----------|-------|---------------|-------------|
| `title` | text | Title | ✓ | `activity.title` | — | — |
| `placeName` | text | Place name | | `metadata.placeName` | — | — |
| `address` | address | Address | ✓ | `activity.address` | start | `activity.city` |

### Transport

| Field ID | Type | Label | Required | mapTo | locationField | derivesCity |
|----------|------|-------|----------|-------|---------------|-------------|
| `vehicleType` | pills | Vehicle | | `metadata.vehicleType` | — | — |
| `fromAddress` | address | From | ✓ | `metadata.fromAddress` | start | `metadata.from` |
| `toAddress` | address | To | ✓ | `metadata.toAddress` | end | `metadata.to` |

## Common Fields (All Types)

These are rendered for all activity types:

| Field ID | mapTo | Notes |
|----------|-------|-------|
| `day` | `activity.day` | Day selector |
| `time` | `activity.time` | Time picker |
| `endDay` | `activity.endDay` | End day selector |
| `endTime` | `activity.endTime` | End time picker |
| `status` | `activity.status` | Status toggle (draft/confirmed) |

## Title Generation

Auto-generate `activity.title` based on type:

```typescript
const TITLE_GENERATORS = {
  flight: (data) => {
    const from = data.from || 'Origin'
    const to = data.to || 'Destination'
    return `${from} → ${to}`
  },
  stay: (data) => {
    return data.propertyName || 'Accommodation'
  },
  event: (data) => {
    return data.title || 'Event'
  },
  transport: (data) => {
    const from = data.fromCity || data.fromAddress
    const to = data.toCity || data.toAddress
    let title = from && to ? `${from} → ${to}` : 'Transport'
    if (data.vehicleType) {
      title = `${capitalize(data.vehicleType)}: ${title}`
    }
    return title
  },
}
```

## Component Architecture

```
ActivityForm
├── Type-specific fields (from config)
│   ├── TextInput
│   ├── AirportAutocomplete
│   ├── HotelAutocomplete
│   ├── AddressAutocomplete
│   └── PillSelector
├── DateTimeSection (common)
│   ├── DaySelect (start)
│   ├── TimePicker (start)
│   ├── DaySelect (end)
│   └── TimePicker (end)
├── StatusSection (common)
│   └── StatusToggle
├── ConfirmationCode (shown when confirmed)
├── RecommendationsSection (shown when draft)
└── FormActions
```

## Data Flow

1. **Load**: Parse activity into form state using field config
2. **Edit**: User modifies fields
3. **Location**: Address/airport fields trigger autocomplete → set coordinates
4. **Derive**: City extracted from place selection → populate mapped fields
5. **Submit**: Build activity object from form state using property mappings

## Implementation Plan

1. Create `lib/activity-form-config.ts` with field definitions
2. Create `components/features/ActivityForm.tsx` unified component
3. Update `ManageActivityForm.tsx` to use new component
4. Remove old form files (FlightForm, HotelForm, EventForm, TransportForm)

## Files to Create

- `frontend/src/lib/activity-form-config.ts` - Field configurations
- `frontend/src/components/features/ActivityForm.tsx` - Unified form component

## Files to Delete (after migration)

- `frontend/src/components/features/FlightForm.tsx`
- `frontend/src/components/features/HotelForm.tsx`
- `frontend/src/components/features/EventForm.tsx`
- `frontend/src/components/features/TransportForm.tsx`
