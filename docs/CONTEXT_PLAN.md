# TripContext State Architecture Refactoring Plan

## Problem Statement

The current `TripContext` manages the side panel state using multiple interdependent state variables that must be coordinated in a specific order:

```typescript
// Current problematic state variables
selectedActivity: Activity | null
isCreatingActivity: boolean
creatingActivityDay: number | null
selectedSuggestion: Suggestion | null
```

This leads to:
1. **Coordination bugs** - Functions must be called in the right order (e.g., clear `selectedActivity` before setting `isCreatingActivity`)
2. **Invalid states possible** - Nothing prevents `selectedActivity` and `isCreatingActivity` from both being "active"
3. **Scattered clearing logic** - Each handler must remember to clear other states:
   ```typescript
   // Example: When selecting an activity, must also clear suggestion and creating mode
   const handleActivitySelectWithSuggestionClear = (activity: Activity | null) => {
     handleActivitySelect(activity)
     if (activity) {
       setSelectedSuggestionState(null)
       setIsCreatingActivity(false)
     }
   }
   ```
4. **Difficult to reason about** - Requires understanding all state combinations
5. **Bug-prone** - Easy to forget clearing one state when setting another

---

## Proposed Solution: Discriminated Union State

Replace multiple boolean/nullable states with a **single discriminated union** that makes invalid states impossible.

### New Type Definition

```typescript
// types/simple.ts - Add this type

/**
 * Represents the current state of the side panel.
 * Uses a discriminated union to ensure only one mode is active at a time.
 */
export type SidePanelState =
  | { mode: 'empty' }
  | { mode: 'viewing'; activity: Activity }
  | { mode: 'editing'; activity: Activity }
  | { mode: 'creating'; context?: ActivityContext }
  | { mode: 'suggestion'; suggestion: Suggestion }
```

### Benefits

1. **Impossible invalid states** - TypeScript enforces that only one mode is active
2. **Single source of truth** - One state variable instead of four
3. **Clear transitions** - Simple functions to move between states
4. **Type-safe access** - TypeScript narrows the type based on mode check
5. **Self-documenting** - The union type documents all possible states

---

## Implementation Plan

### Phase 1: Add New State Type

**File: `frontend/src/types/simple.ts`**

```typescript
// Add to existing types
export type SidePanelMode = 'empty' | 'viewing' | 'editing' | 'creating' | 'suggestion'

export type SidePanelState =
  | { mode: 'empty' }
  | { mode: 'viewing'; activity: Activity }
  | { mode: 'editing'; activity: Activity }
  | { mode: 'creating'; context?: ActivityContext }
  | { mode: 'suggestion'; suggestion: Suggestion }
```

### Phase 2: Update TripContext

**File: `frontend/src/contexts/TripContext.tsx`**

Replace the fragmented state:
```typescript
// REMOVE these
const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
const [isCreatingActivity, setIsCreatingActivity] = useState(false)
const [creatingActivityDay, setCreatingActivityDay] = useState<number | null>(null)
const [selectedSuggestion, setSelectedSuggestionState] = useState<Suggestion | null>(null)

// ADD this single state
const [sidePanelState, setSidePanelState] = useState<SidePanelState>({ mode: 'empty' })
```

Add transition functions:
```typescript
// Clean transition functions
const viewActivity = useCallback((activity: Activity) => {
  updateUrlWithActivity(activity.id)
  setSidePanelState({ mode: 'viewing', activity })
}, [])

const editActivity = useCallback((activity: Activity) => {
  updateUrlWithActivity(activity.id)
  setSidePanelState({ mode: 'editing', activity })
}, [])

const createActivity = useCallback((context?: ActivityContext) => {
  clearActivityFromUrl()
  setSidePanelState({ mode: 'creating', context })
}, [])

const viewSuggestion = useCallback((suggestion: Suggestion) => {
  clearActivityFromUrl()
  setSidePanelState({ mode: 'suggestion', suggestion })
}, [])

const clearPanel = useCallback(() => {
  clearActivityFromUrl()
  setSidePanelState({ mode: 'empty' })
}, [])
```

Updated context type:
```typescript
interface TripContextType {
  // Side panel state - single source of truth
  sidePanelState: SidePanelState
  
  // Transition functions (replaces all the setters)
  viewActivity: (activity: Activity) => void
  editActivity: (activity: Activity) => void
  createActivity: (context?: ActivityContext) => void
  viewSuggestion: (suggestion: Suggestion) => void
  clearPanel: () => void
  
  // Convenience getters (optional, for backward compatibility)
  selectedActivity: Activity | null  // Derived from sidePanelState
  isCreatingActivity: boolean        // Derived from sidePanelState
  
  // ... other trip/activity CRUD operations remain unchanged
}
```

### Phase 3: Update TripSidePanel

**File: `frontend/src/components/features/TripSidePanel.tsx`**

The component becomes much simpler with pattern matching on `sidePanelState.mode`:

```typescript
export function TripSidePanel({ defaultViewMode = false }: TripSidePanelProps) {
  const { 
    sidePanelState,
    viewActivity,
    editActivity,
    createActivity,
    clearPanel,
    trip
  } = useTripContext()
  
  const [activeTab, setActiveTab] = useState<TabType>('details')

  // Render based on mode - clean switch/pattern matching
  const renderContent = () => {
    switch (sidePanelState.mode) {
      case 'empty':
        return <EmptyDetailsState onAddClick={() => createActivity()} />
      
      case 'creating':
        return (
          <CreateActivityView
            context={sidePanelState.context}
            onSave={clearPanel}
            onCancel={clearPanel}
          />
        )
      
      case 'suggestion':
        return (
          <SuggestionView
            suggestion={sidePanelState.suggestion}
            trip={trip}
            onCreateActivity={createActivity}
            onClose={clearPanel}
          />
        )
      
      case 'viewing':
        return (
          <ActivityViewMode
            activity={sidePanelState.activity}
            onEdit={() => editActivity(sidePanelState.activity)}
            onClose={clearPanel}
          />
        )
      
      case 'editing':
        return (
          <ActivityEditMode
            activity={sidePanelState.activity}
            onSave={() => defaultViewMode ? viewActivity(sidePanelState.activity) : clearPanel()}
            onCancel={() => defaultViewMode ? viewActivity(sidePanelState.activity) : clearPanel()}
          />
        )
    }
  }

  return (
    <div className="...">
      {/* Tab navigation */}
      {/* ... */}
      
      {/* Content - clean delegation */}
      {activeTab === 'details' && renderContent()}
      {activeTab === 'config' && <TripConfigTab />}
    </div>
  )
}
```

### Phase 4: Update Consumers

Update all places that currently call the old setters:

| Old Pattern | New Pattern |
|-------------|-------------|
| `setSelectedActivity(activity)` | `viewActivity(activity)` |
| `setIsCreatingActivity(true)` | `createActivity()` |
| `startCreatingActivity(day)` | `createActivity({ day })` |
| `setSelectedSuggestion(suggestion)` | `viewSuggestion(suggestion)` |
| `setSelectedActivity(null)` + `setIsCreatingActivity(false)` | `clearPanel()` |

**Files to update:**
- `frontend/src/components/features/TimelineDay.tsx` - "Add" button
- `frontend/src/components/features/TimelineGrid.tsx` - Activity click
- `frontend/src/components/features/ActivityCard.tsx` - Activity click
- `frontend/src/components/features/SuggestionCard.tsx` - Suggestion click
- `frontend/src/components/features/RecommendationsSection.tsx` - Suggestion click
- `frontend/src/app/trip/[id]/timeline/page.tsx` - Any direct context usage
- `frontend/src/app/trip/[id]/map/page.tsx` - Map marker clicks

---

## Example: Before vs After

### Before (Current - Error Prone)

```typescript
// Creating from a suggestion - must coordinate multiple states
const handleCreateFromSuggestion = (context: ActivityContext) => {
  setActivityContext(context)                    // Local state
  setCreatingActivityType(context.preselectedType || null) // Local state
  setSelectedSuggestion(null)                    // Context state
  setIsCreatingActivity(true)                    // Context state
  // Bug risk: What if we forget one of these?
}

// Clicking "Add" on Day 3 - must coordinate
const handleAddOnDay = (day: number) => {
  setSelectedActivity(null)      // Must clear first!
  setSelectedSuggestion(null)    // Must clear this too!
  setCreatingActivityDay(day)    // Set the day
  setIsCreatingActivity(true)    // Enable create mode
}
```

### After (Proposed - Clean)

```typescript
// Creating from a suggestion - single call
const handleCreateFromSuggestion = (context: ActivityContext) => {
  createActivity(context)  // That's it! All states handled internally
}

// Clicking "Add" on Day 3 - single call
const handleAddOnDay = (day: number) => {
  createActivity({ day })  // That's it! Previous state automatically cleared
}
```

---

## Migration Strategy

1. **Add new types** - Non-breaking, just adds types
2. **Add new state alongside old** - Both coexist temporarily
3. **Add transition functions** - Wrap around both old and new state
4. **Update consumers one by one** - Switch to new API gradually
5. **Remove old state** - Once all consumers updated
6. **Cleanup** - Remove compatibility shims

This allows incremental migration without breaking existing functionality.

---

## Derived State (Optional Backward Compatibility)

During migration, or for convenience, we can provide derived getters:

```typescript
// In TripContext - derived from sidePanelState
const selectedActivity = useMemo(() => {
  if (sidePanelState.mode === 'viewing' || sidePanelState.mode === 'editing') {
    return sidePanelState.activity
  }
  return null
}, [sidePanelState])

const isCreatingActivity = sidePanelState.mode === 'creating'

const selectedSuggestion = useMemo(() => {
  if (sidePanelState.mode === 'suggestion') {
    return sidePanelState.suggestion
  }
  return null
}, [sidePanelState])
```

---

## Summary

| Aspect | Current | Proposed |
|--------|---------|----------|
| State variables | 4+ interdependent | 1 discriminated union |
| Invalid states | Possible | Impossible |
| Transition logic | Scattered in handlers | Centralized functions |
| Type safety | Weak (null checks) | Strong (mode narrowing) |
| Bug potential | High | Low |
| Code clarity | Confusing | Self-documenting |

---

## Next Steps

1. ☐ Review and approve this plan
2. ☐ Add `SidePanelState` type to `types/simple.ts`
3. ☐ Implement new state and transition functions in `TripContext`
4. ☐ Update `TripSidePanel` to use new state
5. ☐ Update all consumer components
6. ☐ Remove deprecated state variables
7. ☐ Test thoroughly
8. ☐ Update `PROJECT_STATUS.md`
