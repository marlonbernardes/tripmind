# New Data Model: Flexible Dates Architecture

This document outlines the new data model for Tripmind that supports both fixed-date and flexible-date trips.

## Overview

The core change is moving from absolute dates to **relative day-based positioning** for activities. This enables:
- **Flexible trips**: "1 week in December" without specific dates
- **Trip templates**: Share and reuse trip plans
- **Easier planning**: Focus on "Day 1", "Day 2" structure first, lock in dates later

---

## Type Definitions

### Trips

Trips use a discriminated union based on `dateMode`:

```typescript
interface TripBase {
  id: string
  name: string
  color: string
}

// Fixed trip - has concrete dates
interface FixedTrip extends TripBase {
  dateMode: 'fixed'
  startDate: string  // ISO date: '2026-01-08'
  endDate: string
}

// Flexible trip - duration with optional time hints
interface FlexibleTrip extends TripBase {
  dateMode: 'flexible'
  duration: number   // Number of days
}

type Trip = FixedTrip | FlexibleTrip

// Type guard
function isFixedTrip(trip: Trip): trip is FixedTrip {
  return trip.dateMode === 'fixed'
}
```

**Removed from Trip:**
- `activitiesCount` - now computed from activities array

---

### Locations

Simplified to a single structure with optional end point:

```typescript
interface GeoLocation {
  lat: number
  lng: number
}

interface ActivityLocation {
  start: GeoLocation
  end?: GeoLocation  // Only for flights/transport with different arrival
}
```

**Changes:**
- Merged `location` and `locationRange` into single `location` field
- `end` is optional (only present for activities that travel between locations)

---

### Activities

Activities now use **relative positioning** with day and time:

```typescript
type ActivityType = 'flight' | 'stay' | 'event' | 'transport' | 'note' | 'task'
type ActivityStatus = 'draft' | 'confirmed'

interface Activity {
  id: string
  tripId: string
  type: ActivityType
  title: string
  status: ActivityStatus
  
  // Relative timing (always stored)
  day: number           // 1-based: Day 1, Day 2, etc.
  time?: string         // 'HH:mm' format, e.g., '09:00'
  endDay?: number       // For multi-day activities
  endTime?: string      // 'HH:mm' format
  allDay?: boolean      // If true, time fields are ignored
  
  // Location (optional)
  location?: ActivityLocation
  city?: string
  
  // Content
  notes?: string
  
  // Type-specific metadata
  metadata?: FlightMetadata | StayMetadata | EventMetadata | TransportMetadata | NoteMetadata | TaskMetadata
}
```

**Changes from current model:**
| Current | New |
|---------|-----|
| `start: string` (ISO datetime) | `day: number` + `time?: string` |
| `end?: string` (ISO datetime) | `endDay?: number` + `endTime?: string` |
| `status: 'planned' \| 'booked'` | `status: 'draft' \| 'confirmed'` |
| `location?: GeoLocation` | `location?: ActivityLocation` |
| `locationRange?: { start, end }` | (merged into `location.end`) |
| Type: `'hotel'` | Type: `'stay'` |

**New field:**
- `allDay?: boolean` - For activities without specific times

---

### Metadata Types

```typescript
interface FlightMetadata {
  from?: string
  to?: string
  flightNumber?: string      // Single flight number (was outbound/inbound)
  airline?: string
  confirmationCode?: string
}

interface StayMetadata {
  propertyName?: string      // Was hotelName
  propertyLink?: string      // Was hotelLink
  confirmationCode?: string
  roomType?: string
}

interface EventMetadata {
  venue?: string
  ticketLink?: string
  organizer?: string
}

interface TransportMetadata {
  from?: string
  to?: string
  vehicleType?: string
  confirmationCode?: string
}

interface NoteMetadata {
  category?: string
  priority?: 'low' | 'medium' | 'high'
}

interface TaskMetadata {
  category?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}
```

**Changes:**
- `FlightMetadata`: Removed `flightNumberInbound` (return flight is separate activity)
- `StayMetadata`: Renamed from `HotelMetadata`, uses `propertyName`/`propertyLink`

---

## Date Service

A new `date-service.ts` module will centralize all date-related logic:

```typescript
// frontend/src/lib/date-service.ts

interface DateService {
  // Calculate duration of a trip
  getTripDuration(trip: Trip): number
  
  // Get array of day numbers [1, 2, 3, ...] for a trip
  getTripDays(trip: Trip): number[]
  
  // For FixedTrip: convert Day X @ HH:mm → ISO datetime
  resolveAbsoluteDateTime(trip: FixedTrip, day: number, time?: string): string
  
  // Get display date for a day
  formatDayHeader(trip: Trip, day: number): string
  // Returns: "Mon, Jan 8" for fixed | "Day 1" for flexible
  
  // Get computed start/end for an activity (for display/map)
  getActivityDateRange(trip: Trip, activity: Activity): {
    start: string      // ISO datetime for fixed, "Day X HH:mm" for flexible
    end?: string
    isRelative: boolean
  }
  
  // Sorting: compare two activities by their timing
  compareActivities(a: Activity, b: Activity): number
  
  // Validation
  isValidDay(trip: Trip, day: number): boolean
  getDayFromDate(trip: FixedTrip, date: string): number  // Convert absolute date to day number
}
```

---

## UI Implications

### Timeline View

For **Fixed trips**: Show "Mon, Jan 8", "Tue, Jan 9", etc.
For **Flexible trips**: Show "Day 1", "Day 2", etc.

Both use the same grouping logic - just different header formatting.

### Activity Forms

For **Fixed trips**: Show date picker that maps to `day` number
For **Flexible trips**: Show "Day" dropdown (1 to duration)

Time picker remains the same for both.

### Map View

Map works the same - it only cares about:
- Activity order (sorted by `day` then `time`)
- Locations (`location.start`, `location.end`)
- Current activity display (uses `formatDayHeader`)

### Trip Settings

New trip settings tab/modal to:
- Set date mode (fixed vs flexible)
- For fixed: set start/end dates
- For flexible: set duration
- "Lock Dates" action: convert flexible → fixed

---

## Status Semantics

**`draft`**: Activity is being planned, details may change
- Visual: Slightly faded, dashed border
- User action: Can edit freely

**`confirmed`**: Activity is finalized
- Visual: Solid styling
- May or may not have confirmation code
- User action: Warn before editing

Booking flow:
1. User creates activity (status: `draft`)
2. User fills in details, optionally adds confirmation code
3. User clicks "Confirm" → status becomes `confirmed`

---

## Future: Trip Templates

The relative-date model enables templates:

```typescript
interface TripTemplate {
  id: string
  name: string
  description?: string
  duration: number
  activities: Omit<Activity, 'id' | 'tripId' | 'status'>[]
  tags?: string[]
  isPublic: boolean
  createdBy?: string
}
```

Workflow:
1. User creates flexible trip, adds activities
2. "Save as Template" → creates `TripTemplate`
3. Other users "Use Template" → new `FlexibleTrip` with copied activities

---

## Migration Strategy

### Phase 1: Update Types
1. Create new type definitions in `frontend/src/types/simple.ts`
2. Create `frontend/src/lib/date-service.ts`

### Phase 2: Update Configuration
3. Update `frontend/src/lib/activity-config.ts` (hotel → stay)

### Phase 3: Migrate Data
4. Update `frontend/src/lib/mock-data.ts` with new structure
5. Add backward-compatible computed properties if needed

### Phase 4: Update Context
6. Update `frontend/src/contexts/TripContext.tsx`

### Phase 5: Update Views
7. Update timeline page to use date service
8. Update map page to use new location structure
9. Update activity forms (HotelForm → StayForm)

### Phase 6: Trip Settings
10. Add trip settings UI for date mode
11. Implement "Lock Dates" conversion flow

---

## Implementation Checklist

- [ ] Update type definitions (`frontend/src/types/simple.ts`)
- [ ] Create date service (`frontend/src/lib/date-service.ts`)
- [ ] Update activity config (`frontend/src/lib/activity-config.ts`)
- [ ] Migrate mock data (`frontend/src/lib/mock-data.ts`)
- [ ] Update timeline utilities (`frontend/src/lib/timeline-utils.ts`)
- [ ] Update TripContext (`frontend/src/contexts/TripContext.tsx`)
- [ ] Update timeline page (`frontend/src/app/trip/[id]/timeline/page.tsx`)
- [ ] Update map component (`frontend/src/components/features/TripMap.tsx`)
- [ ] Rename HotelForm → StayForm
- [ ] Update ManageActivityForm for new types
- [ ] Add trip settings for date mode selection
- [ ] Test fixed-date trip workflow
- [ ] Test flexible-date trip workflow
