# Trip Suggestions Feature

This document describes the Trip Suggestions feature which provides intelligent, contextual suggestions to help users complete their trip planning.

## Overview

Suggestions are system-generated prompts that appear inline in the timeline view, helping users identify gaps in their trip planning (missing hotels, flights, etc.). When clicked, suggestions open a detail view with relevant booking links and the ability to create an activity.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ TripContext │───▶│ suggestion-  │───▶│ TimelineDay       │  │
│  │             │    │ service.ts   │    │ (renders cards)   │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
│         │                  │                                     │
│         │                  │ (future: replace with API call)    │
│         ▼                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Suggestion[]                                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Future:
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
│  GET /api/trips/:tripId/suggestions                              │
│  POST /api/trips/:tripId/suggestions/:id/dismiss                 │
└─────────────────────────────────────────────────────────────────┘
```

The suggestion generation is isolated in `suggestion-service.ts` to make it easy to replace with an API call in the future.

## Data Model

### Suggestion Type

```typescript
type SuggestionType = 'flight' | 'stay'

interface Suggestion {
  id: string
  tripId: string
  type: SuggestionType
  title: string              // "Add accommodation" or "Add a flight"
  description?: string       // "No hotel for nights 3-4" or "Travel from Paris to Tokyo"
  day: number                // Where to show in timeline (1-based)
  dismissed: boolean         // User chose to hide this
  
  // Type-specific context for booking links
  context: FlightSuggestionContext | StaySuggestionContext
}
```

### Stay Suggestion Context

For hotel/accommodation suggestions:

```typescript
interface StaySuggestionContext {
  type: 'stay'
  city: string           // "Tokyo", "Paris" - for booking site URLs
  checkInDay: number     // Day number (1-based)
  checkOutDay: number    // Day number (1-based)
}
```

**URL generation example:**
```
Booking.com: https://www.booking.com/searchresults.html?ss=Tokyo&checkin=2024-01-15&checkout=2024-01-17
Airbnb: https://www.airbnb.com/s/Tokyo/homes?checkin=2024-01-15&checkout=2024-01-17
```

### Flight Suggestion Context

For flight suggestions:

```typescript
interface FlightSuggestionContext {
  type: 'flight'
  originCity: string         // "Paris"
  destinationCity: string    // "Tokyo"
  departureDay: number       // Day number (1-based)
  // Optional airport codes (backend can enrich these)
  originAirport?: string     // "CDG"
  destinationAirport?: string // "NRT"
}
```

**URL generation example:**
```
Google Flights: https://www.google.com/travel/flights?q=flights%20from%20Paris%20to%20Tokyo%20on%20Jan%2015
Skyscanner: https://www.skyscanner.com/transport/flights/pari/tyoa/240115/
```

## Suggestion Generation Logic

### Missing Stay Suggestions

**Detection:**
For each night of the trip (night N = between Day N and Day N+1):
1. Check if any 'stay' activity spans that night
2. A stay spans night N if: `activity.day <= N && (activity.endDay || activity.day) > N`
3. If no stay found, generate a suggestion

**Grouping:**
Consecutive missing nights are grouped into one suggestion:
- Missing nights 3, 4, 5 → Single suggestion: "Add accommodation for nights 3-5"

**Context:**
- `city`: Derived from activities on or near those days (or "your destination")
- `checkInDay`: First missing night
- `checkOutDay`: Last missing night + 1

### Missing Flight Suggestions

**Detection:**
1. Group activities by city (using `activity.city` field)
2. Find transitions: activities in City A followed by activities in City B
3. Check if there's a 'flight' or 'transport' activity between them
4. If no transport found, generate a flight suggestion

**Context:**
- `originCity`: City of previous activities
- `destinationCity`: City of next activities  
- `departureDay`: Day before first activity in destination city

## Suggestion Service API

```typescript
// lib/suggestion-service.ts

interface SuggestionService {
  /**
   * Get suggestions for a trip.
   * Currently computed locally, will be replaced with API call.
   */
  getSuggestions(tripId: string, trip: Trip, activities: Activity[]): Promise<Suggestion[]>
  
  /**
   * Dismiss a suggestion (hide it from the user).
   */
  dismissSuggestion(suggestionId: string): Promise<void>
}
```

### Current Implementation (Frontend)

```typescript
// Generates suggestions locally from activities
async function getSuggestions(tripId: string, trip: Trip, activities: Activity[]): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = []
  
  // Generate missing stay suggestions
  suggestions.push(...generateMissingStaySuggestions(trip, activities))
  
  // Generate missing flight suggestions
  suggestions.push(...generateMissingFlightSuggestions(trip, activities))
  
  // Filter out dismissed suggestions
  return suggestions.filter(s => !dismissedIds.has(s.id))
}
```

### Future Implementation (Backend API)

```typescript
async function getSuggestions(tripId: string): Promise<Suggestion[]> {
  const response = await fetch(`/api/trips/${tripId}/suggestions`)
  return response.json()
}

async function dismissSuggestion(suggestionId: string): Promise<void> {
  await fetch(`/api/suggestions/${suggestionId}/dismiss`, { method: 'POST' })
}
```

## UI Components

### SuggestionCard

Renders in the timeline with distinct styling:

```typescript
interface SuggestionCardProps {
  suggestion: Suggestion
  isSelected?: boolean
  onClick?: () => void
  onDismiss?: () => void
}
```

**Visual Design:**
- Dashed border (vs solid for activities)
- Lightbulb icon prefix
- Amber/yellow tint background
- "Dismiss" button (X icon)
- Hover state shows "Add" action

### Suggestion Detail View

When a suggestion is selected, the side panel shows:

1. **Header**: Icon, title, description
2. **Booking Links**: External links based on suggestion context
   - Stay: Booking.com, Airbnb
   - Flight: Google Flights, Skyscanner
3. **Create Activity Button**: Opens activity form pre-filled with:
   - `type`: From suggestion
   - `day`: From suggestion
   - For stays: `endDay` set to checkOutDay

### URL Generation

```typescript
function generateBookingUrl(suggestion: Suggestion, trip: Trip): string[] {
  if (suggestion.context.type === 'stay') {
    const { city, checkInDay, checkOutDay } = suggestion.context
    const checkIn = resolveDayToDate(trip, checkInDay)
    const checkOut = resolveDayToDate(trip, checkOutDay)
    
    return [
      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkIn}&checkout=${checkOut}`,
      `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?checkin=${checkIn}&checkout=${checkOut}`
    ]
  }
  
  if (suggestion.context.type === 'flight') {
    const { originCity, destinationCity, departureDay } = suggestion.context
    const date = resolveDayToDate(trip, departureDay)
    
    return [
      `https://www.google.com/travel/flights?q=flights%20from%20${encodeURIComponent(originCity)}%20to%20${encodeURIComponent(destinationCity)}%20on%20${date}`,
      `https://www.skyscanner.com/transport/flights/${encodeURIComponent(originCity)}/${encodeURIComponent(destinationCity)}/${formatSkyscannerDate(date)}/`
    ]
  }
}
```

## Timeline Integration

### TimelineDay Props Update

```typescript
interface TimelineDayProps {
  day: number
  dayHeader: string
  activities: Activity[]
  suggestions: Suggestion[]       // NEW
  selectedActivityId?: string
  selectedSuggestionId?: string   // NEW
  onActivitySelect?: (activity: Activity) => void
  onSuggestionSelect?: (suggestion: Suggestion) => void  // NEW
  onSuggestionDismiss?: (id: string) => void            // NEW
}
```

### Rendering Order

Within each day:
1. Activities (sorted by time)
2. Suggestions (after activities)

## State Management

### TripContext Updates

```typescript
interface TripContextType {
  // Existing...
  selectedActivity: Activity | null
  
  // New suggestion state
  suggestions: Suggestion[]
  selectedSuggestion: Suggestion | null
  setSelectedSuggestion: (suggestion: Suggestion | null) => void
  dismissSuggestion: (id: string) => void
  refreshSuggestions: () => void  // Re-fetch/regenerate suggestions
}
```

### Selection Behavior

- When a suggestion is selected, clear activity selection
- When an activity is selected, clear suggestion selection
- Side panel shows appropriate detail view based on what's selected

## Side Panel Changes

### Tab Updates

- **Remove**: "Recommend" tab (functionality moved to inline suggestions)
- **Keep**: Details, Assistant, Config tabs

### Details Tab Behavior

The Details tab now handles three states:
1. **Activity selected**: Show activity form (existing)
2. **Suggestion selected**: Show suggestion detail with booking links
3. **Nothing selected**: Show empty state with "Add Activity" button

## Dismissal Behavior

### MVP (Frontend-only)

- Dismissed suggestion IDs stored in component state
- Resets on page refresh
- Good enough for MVP since users typically act on suggestions quickly

### Future (Backend)

- `dismissed: boolean` stored in database
- Persists across sessions
- Can be "undone" if needed

## Implementation Checklist

- [ ] Add `Suggestion`, `SuggestionType`, `StaySuggestionContext`, `FlightSuggestionContext` to `simple.ts`
- [ ] Create `lib/suggestion-service.ts` with generation logic
- [ ] Create `SuggestionCard.tsx` component
- [ ] Create `SuggestionDetailView.tsx` component
- [ ] Update `TimelineDay.tsx` to render suggestions
- [ ] Update `TripSidePanel.tsx`:
  - Remove "Recommend" tab
  - Handle suggestion selection in Details tab
- [ ] Update `TripContext.tsx` with suggestion state
- [ ] Add booking URL generation utilities
- [ ] Test missing hotel detection
- [ ] Test missing flight detection
- [ ] Test dismissal flow
- [ ] Test "Add Activity" from suggestion

## Future Enhancements

1. **Backend API**: Move generation to backend for smarter suggestions
2. **Interest-based**: "Visit the Louvre" based on 'museums-history' interest
3. **Time-based**: "Add lunch break" for long gaps
4. **Weather-aware**: Indoor activities on rainy days
5. **Price suggestions**: "Prices are low for flights on Day 3"
6. **AI-powered**: Natural language suggestions from trip context
