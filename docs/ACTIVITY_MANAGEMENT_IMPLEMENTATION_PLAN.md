# 🎯 Activity Management System - Implementation Plan

## Current Status
- **Project Phase**: Phase 2 Complete (UI Prototype & Core Workflows)
- **Next Task**: Activity Management System (Add/Edit Activities)
- **Date**: January 23, 2025

## Task Overview

### What We're Building
A comprehensive activity management system that allows users to:
- Add new activities to their timeline
- Edit existing activities
- Manage activity status (planned vs booked)
- View booking recommendations for planned activities
- Visual indicators for activity states

### Why This Task
- Transforms static prototype into functional planning tool
- Enables core user workflow: create → plan → book → manage
- Foundation for future AI integration and booking workflows

## Current State Analysis

### ✅ What's Working
- Timeline workspace with day sections
- Activity cards with type-based styling
- Right panel activity details display
- "Add activity" buttons in timeline (non-functional)
- "Edit Activity" button in details panel (non-functional)
- Responsive design and dark/light mode

### 🚧 What's Missing
- Activity creation/editing forms
- Status management (planned vs booked)
- Visual status indicators
- Booking recommendations
- CRUD operations for activities
- State persistence

## Implementation Phases

### Phase 1: Data Structure Updates
**Goal**: Extend activity data model to support status and notes

#### 1.1 Update SimpleActivity Type **[DONE]**
- **File**: `frontend/src/types/simple.ts`
- **Changes**:
  ```typescript
  export interface SimpleActivity {
    id: string
    tripId: string
    type: 'flight' | 'hotel' | 'event' | 'transport' | 'note' | 'task'
    title: string
    start: string
    end?: string
    city?: string
    status: 'planned' | 'booked'  // NEW
    notes?: string               // NEW
  }
  ```

#### 1.2 Update Mock Data **[DONE]**
- **File**: `frontend/src/lib/mock-data.ts`
- **Changes**: Add `status` field to all existing activities
- **Strategy**: Mark some as 'planned', others as 'booked' for testing visual indicators

#### 1.3 Enhance TripContext **[DONE]**
- **File**: `frontend/src/contexts/TripContext.tsx`
- **New Methods**:
  ```typescript
  addActivity: (activity: Omit<SimpleActivity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<SimpleActivity>) => void
  deleteActivity: (id: string) => void
  ```

### Phase 2: Core Form Component
**Goal**: Create comprehensive activity management form

#### 2.1 ManageActivityForm Component **[DONE]**
- **File**: `frontend/src/components/features/ManageActivityForm.tsx`
- **Features**:
  - Form fields: title, type, start/end dates, city, notes, status
  - Mode switching (create vs edit)
  - Validation and error handling
  - Save/cancel actions
  - Integration with shadcn/ui form components

#### 2.2 Form Field Specifications
```typescript
interface ActivityFormData {
  title: string           // Required
  type: ActivityType      // Required, dropdown
  start: string          // Required, datetime-local input
  end?: string           // Optional, datetime-local input
  city?: string          // Optional, text input
  status: 'planned' | 'booked'  // Required, radio buttons
  notes?: string         // Optional, textarea
}
```

#### 2.3 Form Validation Rules
- Title: Required, max 100 characters
- Type: Required, must be valid activity type
- Start: Required, valid datetime
- End: Optional, must be after start if provided
- City: Optional, max 50 characters
- Status: Required
- Notes: Optional, max 500 characters

### Phase 3: Recommendations System
**Goal**: Show relevant booking links for planned activities

#### 3.1 RecommendationsSection Component **[DONE]**
- **File**: `frontend/src/components/features/RecommendationsSection.tsx`
- **Features**:
  - Activity type-based recommendations
  - Pre-populated URLs with dates/destinations
  - Collapsible when status is 'booked'
  - External link icons and new tab opening

#### 3.2 Booking URL Templates
```typescript
const bookingUrls = {
  flight: (city?: string, date?: string) => 
    `https://flights.google.com/search?q=${city}&date=${date}`,
  hotel: (city?: string, startDate?: string, endDate?: string) => 
    `https://booking.com/search?city=${city}&checkin=${startDate}&checkout=${endDate}`,
  transport: (city?: string) => 
    `https://rome2rio.com/search/${city}`,
  event: (city?: string, date?: string) => 
    `https://eventbrite.com/d/${city}/events--${date}`
}
```

#### 3.3 Recommendations UI Structure
- Conditional rendering based on activity status
- Cards with service logos and "Book Now" CTAs
- Smooth collapse/expand animations
- Mobile-optimized layout

### Phase 4: Visual Status Indicators
**Goal**: Make planned vs booked activities visually distinct

#### 4.1 Update ActivityCard Component **[DONE]**
- **File**: `frontend/src/components/features/ActivityCard.tsx`
- **Changes**:
  - Add "PLANNED" badge for planned activities
  - Left border styling for planned activities
  - Subtle opacity/styling differences
  - Status-aware color schemes

#### 4.2 Visual Design Specifications
```css
/* Planned Activity Styling */
.activity-planned {
  border-left: 3px solid #F59E0B;
  opacity: 0.85;
}

.planned-badge {
  background: #FEF3C7;
  color: #92400E;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
```

#### 4.3 Update GanttChart/Overview
- **File**: `frontend/src/components/features/GanttChart.tsx`
- **Changes**:
  - Striped background pattern for planned activities
  - Different opacity levels for status states
  - Legend explaining visual indicators

### Phase 5: Integration & UX
**Goal**: Wire up all components for seamless user experience

#### 5.1 Connect "Add Activity" Buttons **[DONE]**
- **File**: `frontend/src/components/features/TimelineDay.tsx`
- **Changes**:
  - Add click handler to "Add activity" button
  - Pass date context to form
  - Open ManageActivityForm in create mode

#### 5.2 Enhance ActivityDetailsPanel **[DONE]**
- **File**: `frontend/src/components/features/ActivityDetailsPanel.tsx`
- **Changes**:
  - Replace static "Edit Activity" button
  - Toggle between view and edit modes
  - Integrate ManageActivityForm component
  - Add delete activity functionality

#### 5.3 Form State Management
- Modal/drawer behavior for mobile
- Form state persistence during editing
- Optimistic updates for smooth UX
- Error handling and user feedback

#### 5.4 Mobile Responsiveness
- Slide-up sheet for mobile form
- Touch-optimized form controls
- Proper keyboard handling
- Responsive field layouts

### Phase 6: Polish & Integration
**Goal**: Final touches and documentation updates

#### 6.1 Form Validation & Error States
- Real-time validation feedback
- Clear error messaging
- Accessibility compliance
- Loading states during saves

#### 6.2 Optimistic Updates
- Immediate UI updates before persistence
- Rollback on failure
- Success/failure notifications
- Proper loading indicators

#### 6.3 Code Quality
- TypeScript strict compliance
- Component prop interfaces
- Error boundary integration
- Performance optimizations

## Technical Specifications

### Component Architecture
```
ManageActivityForm
├── ActivityFormFields
├── RecommendationsSection
└── FormActions (Save/Cancel)

ActivityDetailsPanel
├── ActivityDetails (view mode)
└── ManageActivityForm (edit mode)

TimelineDay
└── AddActivityButton → ManageActivityForm
```

### State Management Flow
```
User Action → TripContext Method → Local State Update → UI Re-render
           ↓
    Future: Sync Queue → Supabase → Background Sync
```

### New Dependencies Needed
- None (using existing shadcn/ui form components)
- Leverage existing Zustand context pattern
- Use existing date/time utilities

## Acceptance Criteria

### Functional Requirements
- [ ] Users can add new activities via timeline "Add activity" buttons
- [ ] Users can edit existing activities via details panel
- [ ] Activity status can be set to 'planned' or 'booked'
- [ ] Planned activities show booking recommendations
- [ ] Booked activities hide recommendations section
- [ ] Visual indicators differentiate planned vs booked activities
- [ ] Form validation prevents invalid data entry
- [ ] Mobile experience is fully functional

### Technical Requirements
- [ ] TypeScript compliance with no errors
- [ ] Responsive design maintains existing patterns
- [ ] Dark/light mode support
- [ ] Accessibility standards met
- [ ] Component reusability maintained
- [ ] State management follows existing patterns

### UX Requirements
- [ ] Smooth transitions between view/edit modes
- [ ] Clear visual feedback for all actions
- [ ] Intuitive form layout and validation
- [ ] Mobile-optimized interactions
- [ ] Consistent with existing design system

## Immediate Next Steps (Phase 7: Enhanced Activity Types)

### 7.1 Move Add Activity to Side Panel **[NEXT]**
- **Goal**: Centralize activity management in the side panel
- **Changes**: Remove "Add activity" buttons from TimelineDay, add to ActivityDetailsPanel
- **Benefit**: Consistent UX pattern for all activity management

### 7.2 Add Metadata Field to SimpleActivity **[NEXT]**
- **File**: `frontend/src/types/simple.ts`
- **Addition**: `metadata?: Record<string, any>` field
- **Purpose**: Store type-specific data (flight numbers, hotel links, etc.)

### 7.3 Create Type-Specific Metadata Interfaces **[NEXT]**
```typescript
interface FlightMetadata {
  flightNumberOutbound?: string
  flightNumberInbound?: string
  airline?: string
  confirmationCode?: string
}

interface HotelMetadata {
  hotelName: string
  hotelLink?: string
  confirmationCode?: string
  roomType?: string
}

interface EventMetadata {
  venue?: string
  ticketLink?: string
  organizer?: string
}
```

### 7.4 Replace Activity Type Buttons with Icons **[NEXT]**
- **File**: `frontend/src/components/features/ManageActivityForm.tsx`
- **Change**: Replace radio buttons with icon-based selection
- **Icons**: Plane (flight), Building (hotel), Calendar (event), Car (transport), etc.

### 7.5 Create Type-Specific Form Components **[NEXT]**
- **Flight Form**: From/To fields, computed title/location, flight numbers
- **Hotel Form**: Check-in/out dates, hotel name, link fields  
- **Event Form**: Title, start/end, location fields
- **Smart Computation**: Auto-generate titles and infer locations

### 7.6 Enhanced Form Logic **[NEXT]**
- **Title Computation**: "Flight from NYC to LAX", "Hotel stay at Marriott"
- **Location Inference**: Extract city from "From" field for flights
- **Validation**: Type-specific validation rules
- **UI Adaptation**: Show/hide fields based on activity type

## Next Steps After Completion

1. **User Testing**: Validate workflows with real usage
2. **AI Integration**: Connect to AI trip planning features
3. **Persistence Layer**: Implement Supabase integration
4. **Advanced Features**: Drag & drop, bulk operations
5. **Collaboration**: Multi-user activity management

## Files to be Created/Modified

### New Files
- `frontend/src/components/features/ManageActivityForm.tsx`
- `frontend/src/components/features/RecommendationsSection.tsx`

### Modified Files
- `frontend/src/types/simple.ts`
- `frontend/src/lib/mock-data.ts`
- `frontend/src/contexts/TripContext.tsx`
- `frontend/src/components/features/ActivityCard.tsx`
- `frontend/src/components/features/TimelineDay.tsx`
- `frontend/src/components/features/ActivityDetailsPanel.tsx`
- `frontend/src/components/features/GanttChart.tsx`

---

*This plan serves as the definitive guide for implementing the activity management system. Each phase builds upon the previous one, ensuring a logical progression from data structure to user interface.*
