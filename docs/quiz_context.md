# Trip Wizard Context

## Current State
The TripWizard (`frontend/src/components/features/TripWizard.tsx`) is a 5-step wizard for creating trips at `/plan`.

## Steps
1. **Destinations** - Multi-select grid with Unsplash photos + custom input
2. **Dates** - Toggle between "Specific dates" (date pickers) or "Flexible" (season selection)
3. **Duration** - Duration presets (Weekend, 1 Week, etc.) + custom input
4. **Style** - Multi-select interests (Food, Culture, Adventure, etc.) + custom
5. **Review** - Summary of all selections + "Create My Trip" button

## Known Issues to Fix
- **Duration step shown even when specific dates selected** - If user picks exact start/end dates, duration is already known and shouldn't be asked
- Duration field shows empty on review when specific dates are used

## Architecture Notes
- Uses `tripService` for persistence (not `mock-data.ts`)
- `tripService.createTrip()` and `tripService.createActivity()` add to in-memory store
- `generateMockTrip()` in `trip-generator.ts` creates template trip/activities (ignores wizard input currently)
- After creation, redirects to `/trip/[id]/timeline`

## Key Files
- `frontend/src/components/features/TripWizard.tsx` - Main wizard component
- `frontend/src/lib/trip-service.ts` - Data persistence (MockTripService)
- `frontend/src/lib/trip-generator.ts` - Mock trip generation
- `frontend/src/app/plan/page.tsx` - Route that renders TripWizard

## Data Flow
```
WizardData → handleGenerate() → generateMockTrip() → tripService.createTrip/Activity → router.push
```

## Wizard Data Shape
```typescript
interface WizardData {
  destinations: string[]        // e.g., ['tokyo', 'custom:Bali']
  customDestination: string
  hasSpecificDates: boolean | null
  startDate: string             // e.g., '2025-01-15'
  endDate: string
  season: string | null         // e.g., 'summer'
  duration: string | null       // e.g., 'week'
  customDuration: string
  styles: string[]              // e.g., ['food', 'culture']
  customStyle: string
}
```

## Refactoring Suggestions
1. Make duration step conditional (skip when specific dates set)
2. Pass wizard data to trip generator instead of ignoring it
3. Calculate duration from dates when applicable
4. Consider combining dates+duration into single smart step
