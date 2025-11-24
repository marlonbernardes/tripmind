# Custom Gantt Chart Implementation Plan

## Overview
This document details the implementation plan for a custom Gantt chart component to replace the `gantt-task-react` library. The implementation is inspired by **frappe-gantt** architecture but built with React, TypeScript, and Tailwind CSS for our TripMind application.

## Goals
1. Remove dependency on `gantt-task-react` library
2. Full control over styling and behavior
3. Native dark mode support (no CSS filter hacks)
4. Better mobile responsiveness
5. Smaller bundle size
6. Easier customization and maintenance

## Requirements Analysis

### Must-Have Features
- ✅ Fixed left panel showing activity list
- ✅ Collapsible categories/subcategories
- ✅ Horizontal scrollable timeline
- ✅ Support for dragging bars to change dates
- ✅ Alternating row colors
- ✅ View modes: Hour, Day, Month
- ✅ Sticky date headers with hierarchical structure
- ✅ Mobile-friendly with touch support
- ✅ First day starts one day before earliest event

### Key Learnings from frappe-gantt

#### 1. **Architecture Pattern**
frappe-gantt uses a class-based architecture with:
- Main `Gantt` class orchestrating everything
- Separate `Bar` class for each task bar
- `Arrow` class for dependencies
- `Popup` class for tooltips
- Utility modules: `date_utils`, `svg_utils`

**Our Approach**: Use React component hierarchy with hooks for state management.

#### 2. **Date Calculations**
frappe-gantt has robust date utilities:
```javascript
// Key functions we need to replicate:
- parse(): Parse date strings to Date objects
- diff(): Calculate difference between dates in various units
- add(): Add time to dates
- start_of(): Get start of period (day/month/year)
- format(): Format dates for display
```

**Our Approach**: Use `date-fns` library which provides similar functionality.

#### 3. **View Mode System**
frappe-gantt defines view modes with:
```javascript
{
  name: 'Day',
  padding: '7d',           // Extra space before/after
  step: '1d',              // Column interval
  column_width: 40,        // Pixels per column
  lower_text: 'D',         // Day number
  upper_text: 'MMMM',      // Month name
  snap_at: '1d'            // Drag snap interval
}
```

**Our Implementation**: Create similar view mode configurations for Hour, Day, Month.

#### 4. **Position Calculation**
frappe-gantt calculates bar positions:
```javascript
compute_x() {
  const diff = date_utils.diff(task_start, gantt_start, unit) / step;
  const x = diff * column_width;
  return x;
}
```

**Our Approach**: Calculate positions using similar logic in React.

#### 5. **Drag and Resize**
frappe-gantt uses:
- Mouse/touch event listeners on SVG elements
- Calculate delta from drag start
- Snap to grid based on `snap_at` setting
- Update task dates on drag end

**Our Approach**: Use React event handlers with similar delta calculation logic.

## Technical Architecture

### Component Structure
```
CustomGanttChart/
├── index.tsx                 # Main component & orchestration
├── GanttHeader.tsx          # Sticky date headers (upper & lower)
├── GanttGrid.tsx            # Timeline grid with vertical lines
├── GanttLeftPanel.tsx       # Fixed left panel with activity list
├── GanttBar.tsx             # Individual draggable bar
├── GanttRow.tsx             # Row container for each activity
├── hooks/
│   ├── useGanttDates.ts     # Date range calculation
│   ├── useGanttDrag.ts      # Drag & drop logic
│   └── useViewMode.ts       # View mode state & config
├── utils/
│   ├── dateUtils.ts         # Date manipulation (using date-fns)
│   ├── positionUtils.ts     # Calculate bar positions
│   └── viewModeConfig.ts    # View mode definitions
└── types.ts                 # TypeScript interfaces
```

### Data Flow
```
CustomGanttChart (state: viewMode, dateRange, expandedCategories)
    ├── GanttHeader (displays dates, sticky)
    │   ├── Upper row (month/year)
    │   └── Lower row (day/hour)
    ├── Main Content (flex container)
    │   ├── GanttLeftPanel (fixed width, scrolls with content)
    │   │   └── Categories & Activities (collapsible)
    │   └── GanttGrid (scrollable horizontally)
    │       └── GanttRow for each activity
    │           └── GanttBar (draggable)
```

## Implementation Phases

### Phase 1: Core Structure & Layout (2-3 hours)
**Goal**: Basic grid and panel layout without interactions

#### 1.1 View Mode Configuration
Create `viewModeConfig.ts`:
```typescript
export interface ViewModeConfig {
  name: 'Hour' | 'Day' | 'Month'
  step: number              // milliseconds per column
  columnWidth: number       // pixels
  padding: number           // days to pad before/after
  lowerFormat: string       // date-fns format for lower header
  upperFormat: string       // date-fns format for upper header
  snapInterval: number      // milliseconds to snap to when dragging
  showUpperWhen: (current: Date, previous?: Date) => boolean
}

export const VIEW_MODES: Record<string, ViewModeConfig> = {
  Hour: {
    name: 'Hour',
    step: 3600000,           // 1 hour in ms
    columnWidth: 60,
    padding: 1,              // 1 day padding
    lowerFormat: 'HH',       // 00-23
    upperFormat: 'd MMM',    // 1 Jan
    snapInterval: 3600000,
    showUpperWhen: (curr, prev) => 
      !prev || curr.getDate() !== prev.getDate()
  },
  Day: {
    name: 'Day',
    step: 86400000,          // 1 day in ms
    columnWidth: 40,
    padding: 7,
    lowerFormat: 'd',        // 1-31
    upperFormat: 'MMMM',     // January
    snapInterval: 86400000,
    showUpperWhen: (curr, prev) => 
      !prev || curr.getMonth() !== prev.getMonth()
  },
  Month: {
    name: 'Month',
    step: 2592000000,        // ~30 days in ms (approx)
    columnWidth: 100,
    padding: 60,
    lowerFormat: 'MMM',      // Jan
    upperFormat: 'yyyy',     // 2024
    snapInterval: 86400000,  // snap to days
    showUpperWhen: (curr, prev) => 
      !prev || curr.getFullYear() !== prev.getFullYear()
  }
}
```

#### 1.2 Date Range Calculator
Create `useGanttDates.ts`:
```typescript
export function useGanttDates(
  activities: SimpleActivity[],
  viewMode: ViewModeConfig
) {
  return useMemo(() => {
    // Find earliest and latest dates
    const dates = activities.flatMap(a => [
      new Date(a.start),
      a.end ? new Date(a.end) : new Date(a.start)
    ])
    
    const earliest = min(dates)
    const latest = max(dates)
    
    // Start 1 day before earliest (requirement)
    const ganttStart = subDays(startOfDay(earliest), 1)
    
    // Add padding based on view mode
    const paddedStart = subDays(ganttStart, viewMode.padding)
    const paddedEnd = addDays(latest, viewMode.padding)
    
    // Generate column dates
    const columns: Date[] = []
    let current = paddedStart
    while (current <= paddedEnd) {
      columns.push(current)
      current = new Date(current.getTime() + viewMode.step)
    }
    
    return { ganttStart, ganttEnd: paddedEnd, columns }
  }, [activities, viewMode])
}
```

#### 1.3 Main Component Structure
Create `CustomGanttChart/index.tsx`:
```typescript
export function CustomGanttChart({
  activities,
  selectedActivityId,
  onActivitySelect,
  onActivityUpdate
}: CustomGanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewModeName>('Day')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flight', 'hotel', 'event', 'transport', 'note', 'task'])
  )
  
  const viewModeConfig = VIEW_MODES[viewMode]
  const { ganttStart, ganttEnd, columns } = useGanttDates(activities, viewModeConfig)
  const groupedActivities = useGroupedActivities(activities, expandedCategories)
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* View Mode Selector */}
      <ViewModeSelector value={viewMode} onChange={setViewMode} />
      
      {/* Sticky Header */}
      <GanttHeader 
        columns={columns}
        viewModeConfig={viewModeConfig}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Left Panel */}
        <GanttLeftPanel
          groupedActivities={groupedActivities}
          expandedCategories={expandedCategories}
          onToggleCategory={/* ... */}
          selectedActivityId={selectedActivityId}
          onActivitySelect={onActivitySelect}
        />
        
        {/* Scrollable Grid Area */}
        <div className="flex-1 overflow-auto">
          <GanttGrid
            columns={columns}
            groupedActivities={groupedActivities}
            viewModeConfig={viewModeConfig}
            ganttStart={ganttStart}
            onActivityUpdate={onActivityUpdate}
          />
        </div>
      </div>
    </div>
  )
}
```

#### 1.4 Header Component
Create `GanttHeader.tsx`:
```typescript
export function GanttHeader({ 
  columns, 
  viewModeConfig 
}: GanttHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-800 border-b">
      {/* Upper Header Row (Month/Year) */}
      <div className="flex h-11 border-b border-gray-200 dark:border-gray-700">
        <div className="w-[250px] flex-shrink-0" /> {/* Left panel spacer */}
        <div className="flex">
          {columns.map((col, idx) => {
            const prev = idx > 0 ? columns[idx - 1] : undefined
            const showText = viewModeConfig.showUpperWhen(col, prev)
            
            return (
              <div
                key={idx}
                className="border-r border-gray-200 dark:border-gray-700 px-2 flex items-center"
                style={{ width: viewModeConfig.columnWidth }}
              >
                {showText && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {format(col, viewModeConfig.upperFormat)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Lower Header Row (Day/Hour) */}
      <div className="flex h-8">
        <div className="w-[250px] flex-shrink-0" />
        <div className="flex">
          {columns.map((col, idx) => (
            <div
              key={idx}
              className="border-r border-gray-200 dark:border-gray-700 px-2 flex items-center justify-center"
              style={{ width: viewModeConfig.columnWidth }}
            >
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {format(col, viewModeConfig.lowerFormat)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 1.5 Left Panel Component
Create `GanttLeftPanel.tsx`:
```typescript
export function GanttLeftPanel({
  groupedActivities,
  expandedCategories,
  onToggleCategory,
  selectedActivityId,
  onActivitySelect
}: GanttLeftPanelProps) {
  return (
    <div className="w-[250px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {groupedActivities.map((group, groupIdx) => (
        <React.Fragment key={group.type}>
          {/* Category Header */}
          <div 
            className={cn(
              "flex items-center h-12 px-4 cursor-pointer border-b",
              groupIdx % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"
            )}
            onClick={() => onToggleCategory(group.type)}
          >
            <button className="w-4 h-4 mr-2">
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                expandedCategories.has(group.type) ? "" : "-rotate-90"
              )} />
            </button>
            <div 
              className="w-3 h-3 rounded mr-2"
              style={{ backgroundColor: ACTIVITY_COLORS[group.type] }}
            />
            <span className="font-semibold text-sm">
              {group.type}s ({group.activities.length})
            </span>
          </div>
          
          {/* Activity Rows */}
          {expandedCategories.has(group.type) && group.activities.map((activity, actIdx) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-center h-12 px-6 cursor-pointer border-b",
                "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                selectedActivityId === activity.id && "bg-blue-50 dark:bg-blue-900/20",
                (groupIdx * 100 + actIdx) % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/20" : "bg-white dark:bg-gray-900"
              )}
              onClick={() => onActivitySelect(activity)}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: ACTIVITY_COLORS[activity.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{activity.title}</div>
                <div className="text-xs text-gray-500 truncate">
                  {activity.city && `${activity.city} • `}
                  {format(new Date(activity.start), 'MMM d')}
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}
```

#### 1.6 Grid Component (Basic)
Create `GanttGrid.tsx`:
```typescript
export function GanttGrid({
  columns,
  groupedActivities,
  viewModeConfig,
  ganttStart
}: GanttGridProps) {
  return (
    <div className="relative">
      {/* Vertical Grid Lines */}
      <div className="absolute inset-0 flex pointer-events-none">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="border-r border-gray-200 dark:border-gray-700"
            style={{ width: viewModeConfig.columnWidth }}
          />
        ))}
      </div>
      
      {/* Activity Rows with Bars */}
      {groupedActivities.map((group, groupIdx) => (
        <React.Fragment key={group.type}>
          {/* Category Row (empty, just for spacing) */}
          <div className="h-12 border-b border-gray-200 dark:border-gray-700" />
          
          {/* Activity Rows */}
          {group.activities.map((activity, actIdx) => (
            <GanttRow
              key={activity.id}
              activity={activity}
              ganttStart={ganttStart}
              viewModeConfig={viewModeConfig}
              rowIndex={groupIdx * 100 + actIdx}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}
```

### Phase 2: Bar Rendering & Positioning (2 hours)

#### 2.1 Position Calculation Utility
Create `positionUtils.ts`:
```typescript
export function calculateBarPosition(
  activityStart: Date,
  activityEnd: Date,
  ganttStart: Date,
  viewModeConfig: ViewModeConfig
): { x: number; width: number } {
  // Calculate milliseconds from gantt start
  const startOffset = activityStart.getTime() - ganttStart.getTime()
  const duration = activityEnd.getTime() - activityStart.getTime()
  
  // Convert to column units
  const startColumn = startOffset / viewModeConfig.step
  const durationColumns = Math.max(0.5, duration / viewModeConfig.step)
  
  // Convert to pixels
  const x = startColumn * viewModeConfig.columnWidth
  const width = durationColumns * viewModeConfig.columnWidth
  
  return { x, width }
}
```

#### 2.2 Row Component with Bar
Create `GanttRow.tsx`:
```typescript
export function GanttRow({
  activity,
  ganttStart,
  viewModeConfig,
  rowIndex
}: GanttRowProps) {
  const activityStart = new Date(activity.start)
  const activityEnd = activity.end ? new Date(activity.end) : addHours(activityStart, 1)
  
  const { x, width } = calculateBarPosition(
    activityStart,
    activityEnd,
    ganttStart,
    viewModeConfig
  )
  
  return (
    <div className={cn(
      "relative h-12 border-b border-gray-200 dark:border-gray-700",
      rowIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/20" : "bg-white dark:bg-gray-900"
    )}>
      <GanttBar
        activity={activity}
        x={x}
        width={width}
      />
    </div>
  )
}
```

#### 2.3 Bar Component (Static)
Create `GanttBar.tsx`:
```typescript
export function GanttBar({
  activity,
  x,
  width
}: GanttBarProps) {
  return (
    <div
      className="absolute top-2 h-8 rounded px-2 flex items-center cursor-move"
      style={{
        left: x,
        width,
        backgroundColor: ACTIVITY_COLORS[activity.type],
        minWidth: '60px'
      }}
    >
      <span className="text-xs text-white font-medium truncate">
        {activity.title}
      </span>
    </div>
  )
}
```

### Phase 3: Drag & Drop Functionality (3 hours)

#### 3.1 Drag Hook
Create `useGanttDrag.ts`:
```typescript
export function useGanttDrag(
  activity: SimpleActivity,
  viewModeConfig: ViewModeConfig,
  ganttStart: Date,
  onUpdate: (activityId: string, newDates: { start: string; end?: string }) => void
) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(null)
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      date: new Date(activity.start)
    })
  }, [activity.start])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return
    
    // Calculate delta in pixels
    const deltaX = e.clientX - dragStart.x
    
    // Convert to time delta
    const deltaCols = deltaX / viewModeConfig.columnWidth
    const deltaMs = deltaCols * viewModeConfig.step
    
    // Snap to grid
    const snappedDelta = Math.round(deltaMs / viewModeConfig.snapInterval) * viewModeConfig.snapInterval
    
    // Calculate new dates
    const newStart = new Date(dragStart.date.getTime() + snappedDelta)
    const duration = activity.end 
      ? new Date(activity.end).getTime() - new Date(activity.start).getTime()
      : 3600000 // 1 hour default
    const newEnd = new Date(newStart.getTime() + duration)
    
    // Update activity
    onUpdate(activity.id, {
      start: newStart.toISOString(),
      end: newEnd.toISOString()
    })
  }, [isDragging, dragStart, activity, viewModeConfig, onUpdate])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])
  
  return {
    isDragging,
    handleMouseDown
  }
}
```

#### 3.2 Update Bar Component with Drag
Update `GanttBar.tsx`:
```typescript
export function GanttBar({
  activity,
  x,
  width,
  viewModeConfig,
  ganttStart,
  onUpdate
}: GanttBarProps) {
  const { isDragging, handleMouseDown } = useGanttDrag(
    activity,
    viewModeConfig,
    ganttStart,
    onUpdate
  )
  
  return (
    <div
      className={cn(
        "absolute top-2 h-8 rounded px-2 flex items-center cursor-move transition-opacity",
        isDragging && "opacity-70 shadow-lg"
      )}
      style={{
        left: x,
        width,
        backgroundColor: ACTIVITY_COLORS[activity.type],
        minWidth: '60px'
      }}
      onMouseDown={handleMouseDown}
    >
      <span className="text-xs text-white font-medium truncate">
        {activity.title}
      </span>
    </div>
  )
}
```

### Phase 4: Mobile Responsiveness (2 hours)

#### 4.1 Touch Support
Add touch event handlers to `useGanttDrag.ts`:
```typescript
// Add to useGanttDrag hook
const handleTouchStart = useCallback((e: React.TouchEvent) => {
  e.preventDefault()
  setIsDragging(true)
  setDragStart({
    x: e.touches[0].clientX,
    date: new Date(activity.start)
  })
}, [activity.start])

const handleTouchMove = useCallback((e: TouchEvent) => {
  if (!isDragging || !dragStart) return
  const deltaX = e.touches[0].clientX - dragStart.x
  // ... same logic as handleMouseMove
}, [isDragging, dragStart, activity, viewModeConfig, onUpdate])

return {
  isDragging,
  handleMouseDown,
  handleTouchStart
}
```

#### 4.2 Responsive Layout
Update main component with responsive classes:
```typescript
<div className="flex flex-col h-full">
  {/* Left panel: full width on mobile, fixed on desktop */}
  <GanttLeftPanel
    className={cn(
      "md:w-[250px] md:flex-shrink-0",
      "w-full" // Full width on mobile
    )}
    // ... rest
  />
  
  {/* Grid: Hidden on mobile by default, add toggle button */}
</div>
```

#### 4.3 Mobile Hamburger Toggle
Add state to show/hide left panel on mobile:
```typescript
const [showLeftPanel, setShowLeftPanel] = useState(true)

// Add toggle button for mobile
<button 
  className="md:hidden fixed bottom-4 right-4 z-50"
  onClick={() => setShowLeftPanel(!showLeftPanel)}
>
  <Menu className="w-6 h-6" />
</button>
```

### Phase 5: Testing & Polish (2 hours)

#### 5.1 Create Test Page
Create `frontend/src/app/trip/[id]/overview2/page.tsx`:
```typescript
'use client'

import { useTripContext } from '@/contexts/TripContext'
import { TripLayout } from '@/components/features/TripLayout'
import { CustomGanttChart } from '@/components/features/CustomGanttChart'
import React from 'react'

export default function Overview2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = React.use(params)
  const { activities, selectedActivity, setSelectedActivity, updateActivity } = useTripContext()
  
  return (
    <TripLayout tripId={tripId}>
      <div className="px-6 py-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Custom Gantt Chart (Beta)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Testing new Gantt implementation
          </p>
        </div>
        <CustomGanttChart
          activities={activities}
          selectedActivityId={selectedActivity?.id}
          onActivitySelect={setSelectedActivity}
          onActivityUpdate={updateActivity}
        />
      </div>
    </TripLayout>
  )
}
```

#### 5.2 Dark Mode Testing
Ensure all components work in dark mode:
- Test background colors
- Test text contrast
- Test border colors
- Test hover states

#### 5.3 Performance Testing
- Test with 50+ activities
- Check smooth scrolling
- Verify drag performance
- Test on mobile devices

#### 5.4 Edge Cases
- Activities without end dates
- Same-day activities
- Activities spanning months
- Empty state
- Single activity

## TypeScript Interfaces

```typescript
// types.ts
export interface ViewModeConfig {
  name: 'Hour' | 'Day' | 'Month'
  step: number
  columnWidth: number
  padding: number
  lowerFormat: string
  upperFormat: string
  snapInterval: number
  showUpperWhen: (current: Date, previous?: Date) => boolean
}

export interface CustomGanttChartProps {
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
  onActivityUpdate?: (activityId: string, newDates: { start: string; end?: string }) => void
}

export interface GroupedActivities {
  type: string
  activities: SimpleActivity[]
}

export interface GanttDates {
  ganttStart: Date
  ganttEnd: Date
  columns: Date[]
}
```

## Styling Guidelines

### Color Scheme
```typescript
export const ACTIVITY_COLORS = {
  flight: '#3B82F6',    // blue-500
  hotel: '#10B981',     // green-500
  event: '#8B5CF6',     // purple-500
  transport: '#F59E0B', // amber-500
  note: '#6B7280',      // gray-500
  task: '#F97316'       // orange-500
}
```

### Tailwind Classes Pattern
- Light backgrounds: `bg-white`, `bg-gray-50`
- Dark backgrounds: `dark:bg-gray-900`, `dark:bg-gray-800`
- Borders: `border-gray-200 dark:border-gray-700`
- Text: `text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-400`
- Hover: `hover:bg-gray-100 dark:hover:bg-gray-700/50`

## Migration Strategy

1. **Phase 1**: Implement new component alongside old one
2. **Phase 2**: Test extensively on `/overview2` route
3. **Phase 3**: Add feature flag to switch between implementations
4. **Phase 4**: Roll out to users gradually
5. **Phase 5**: Remove old `gantt-task-react` dependency

## Dependencies to Add

```json
{
  "date-fns": "^3.0.0"  // Only new dependency needed
}
```

## Dependencies to Remove (After Migration)

```json
{
  "gantt-task-react": "^0.3.9"  // Can be removed
}
```

## Estimated Timeline

- **Phase 1**: Core Structure - 3 hours
- **Phase 2**: Bar Rendering - 2 hours
- **Phase 3**: Drag & Drop - 3 hours
- **Phase 4**: Mobile - 2 hours
- **Phase 5**: Testing - 2 hours

**Total**: ~12 hours of development time

## Success Criteria

- ✅ All current features work (collapsible categories, selection, etc.)
- ✅ Dragging updates activity dates correctly
- ✅ Works smoothly on mobile and desktop
- ✅ Dark mode fully supported
- ✅ Performance is equal or better than old implementation
- ✅ Bundle size reduced (no gantt-task-react dependency)
- ✅ Code is maintainable and well-documented

## Future Enhancements (Post-MVP)

1. **Resize handles** on bars to change duration
2. **Dependency arrows** between activities
3. **Progress bars** within activity bars
4. **Today indicator line**
5. **Zoom controls** (adjust column width)
6. **Week view mode**
7. **Keyboard navigation**
8. **Accessibility improvements** (ARIA labels, focus management)
9. **Virtual scrolling** for large datasets
10. **Export to image/PDF**

## Critical Analysis & Future-Proofing

### 🚨 Current Plan Weaknesses

#### 1. **Tight Coupling to Activity Types**
**Problem**: Hard-coded activity types ('flight', 'hotel', 'event', etc.) throughout the codebase makes it impossible to add new types without code changes.

**Impact**: 
- Cannot support custom activity types
- Adding new types requires modifying multiple files
- Not extensible for future business needs

**Better Approach**:
```typescript
// Instead of: expandedCategories: Set<string>
// Use a category registry pattern:

interface CategoryConfig {
  id: string
  label: string
  color: string
  icon?: React.ComponentType
  sortOrder: number
}

// Define in config, not hardcoded
const CATEGORY_REGISTRY: Record<string, CategoryConfig> = {
  flight: { id: 'flight', label: 'Flights', color: '#3B82F6', sortOrder: 1 },
  // ... etc
}

// Make it extensible
function registerCategory(config: CategoryConfig) { /* ... */ }
```

#### 2. **View Mode Configuration is Brittle**
**Problem**: Fixed view modes with hardcoded millisecond calculations are error-prone and difficult to extend.

**Issues**:
- Month calculation uses `2592000000ms` (30 days) - doesn't handle variable month lengths
- No support for custom view modes (e.g., "Week", "Quarter")
- Changing column widths requires touching multiple places

**Better Approach**:
```typescript
// Use a factory pattern with validation
class ViewModeFactory {
  static create(config: ViewModeDefinition): ViewMode {
    // Validate config
    // Calculate derived values consistently
    // Handle edge cases (leap years, DST, etc.)
  }
  
  static registerCustomMode(name: string, config: ViewModeDefinition) {
    // Allow runtime registration of new modes
  }
}

// Support dynamic column width calculation
interface ViewMode {
  calculateColumnDate(index: number, startDate: Date): Date
  calculateColumnsInRange(start: Date, end: Date): number
  // ... etc
}
```


#### 4. **Drag Implementation Has Race Conditions**
**Problem**: `useGanttDrag` hook updates activity directly in `handleMouseMove`, causing potential issues:
- Rapid re-renders during drag
- State updates might be lost
- No debouncing or throttling

**Better Approach**:
```typescript
// Separate visual feedback from state updates
function useGanttDrag() {
  const [visualOffset, setVisualOffset] = useState(0) // Local visual state
  const debouncedUpdate = useDebouncedCallback(onUpdate, 100) // Throttle updates
  
  // Use transform for smooth visual feedback
  // Only update actual state on throttled intervals
  // Commit final position only on mouseup
}
```

#### 5. **No Data Layer Abstraction**
**Problem**: Components directly manipulate `SimpleActivity` objects, making it hard to:
- Add computed properties
- Cache expensive calculations
- Switch data sources
- Add data validation

**Better Approach**:
```typescript
// Domain model layer
class GanttActivity {
  constructor(private data: SimpleActivity) {}
  
  get displayTitle(): string { /* ... */ }
  get computedDuration(): number { /* ... */ }
  get isOverdue(): boolean { /* ... */ }
  
  // Encapsulate business logic
  canMoveTo(newDate: Date): boolean { /* ... */ }
  overlaps(other: GanttActivity): boolean { /* ... */ }
}

// Repository pattern for data access
interface ActivityRepository {
  findById(id: string): GanttActivity
  findByDateRange(start: Date, end: Date): GanttActivity[]
  save(activity: GanttActivity): Promise<void>
}
```


#### 7. **No Accessibility Strategy**
**Problem**: Plan mentions accessibility as "future enhancement" but it should be foundational.

**Missing**:
- Keyboard navigation (arrow keys to move selection)
- Screen reader support (ARIA labels)
- Focus management
- High contrast mode support

**Better Approach**: Build accessibility in from day 1, not as afterthought.


#### 9. **Error Boundaries Not Mentioned**
**Problem**: No graceful degradation strategy if something fails.

**Better Approach**:
```typescript
// Wrap Gantt in error boundary
<ErrorBoundary fallback={<GanttFallback />}>
  <CustomGanttChart />
</ErrorBoundary>

// Add error states for common failures
// - Invalid date ranges
// - Missing required data
// - Calculation errors
```

#### 10. **Localization Not Considered**
**Problem**: Date formats are hardcoded, no i18n strategy.

**Issues**:
- Date format strings are English-centric
- No support for RTL languages
- No timezone handling mentioned

**Better Approach**:
```typescript
// Use Intl APIs
const dateFormatter = new Intl.DateTimeFormat(locale, options)

// Support timezone-aware dates
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Make all text translatable
import { useTranslation } from 'react-i18next'
```

### 🎯 Recommendations for Future-Proofing

#### Immediate Changes to Plan

1. **Introduce Abstraction Layers**
   - Separate presentation from business logic
   - Use repository pattern for data access
   - Create domain models for activities

2. **Make Configuration Dynamic**
   - Remove hardcoded activity types
   - Allow view mode registration at runtime
   - Externalize colors, labels, and other UI constants

3. **Design System Integration**
   - Create reusable Gantt primitives
   - Make it composable (allow custom renderers)
   - Support theming beyond just dark mode

6. **Developer Experience**
   - Strong TypeScript types
   - Comprehensive prop validation
   - Good error messages
   - Debug mode for development

#### Architecture Patterns to Consider

```typescript
// Plugin architecture for extensibility
interface GanttPlugin {
  name: string
  onInit?(gantt: Gantt): void
  onBeforeDrag?(activity: Activity): boolean
  onAfterDrag?(activity: Activity): void
  // ... etc
}

// Render prop pattern for customization
<CustomGanttChart
  renderBar={(activity, props) => <CustomBar {...props} />}
  renderHeader={(date, props) => <CustomHeader {...props} />}
  renderLeftPanel={(activities) => <CustomPanel />}
/>

// Composition pattern
<GanttChart>
  <GanttHeader />
  <GanttContent>
    <GanttSidebar />
    <GanttTimeline />
  </GanttContent>
</GanttChart>
```

#### Long-term Extensibility

1. **Multiple Visualization Modes**
   - Traditional Gantt
   - Resource allocation view
   - Critical path view
   - Swimlane view by city/person

2. **Advanced Features Foundation**
   - Dependency management system
   - Resource allocation
   - Baseline comparison

### Conclusion

The current plan is a **good MVP** but needs significant architectural improvements to be truly maintainable and extensible. The biggest risks are:

1. **Tight coupling** to current activity types
2. **Lack of abstraction** between UI and business logic

**Recommendation**: Before implementing, spend 1-2 hours refactoring the architecture to address these concerns. The code will be 2x easier to maintain and 10x easier to extend.

## Notes

- This implementation is inspired by frappe-gantt's architecture but adapted for React
- We're using Tailwind CSS instead of vanilla CSS for consistency
- Date-fns replaces frappe-gantt's custom date utilities
- React hooks replace class-based state management
- Touch events are first-class citizens for mobile support
