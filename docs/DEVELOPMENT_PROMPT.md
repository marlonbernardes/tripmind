# Tripmind Development Prompt


<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- Read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and completion
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->


## Task: Continue Tripmind Development

You are working on **Tripmind**, a responsive web application for planning trips, organizing activities on a timeline, managing bookings, and working offline.

### Required Steps (Execute in Order):

#### 1. **Read Project Documentation**
First, read all documentation files to understand current state:
- Read `docs/PROJECT_STATUS.md` for current status and next recommended task (if exists)
- Read `docs/PLAN.md` for complete project specification and MVP requirements
- [IGNORE] Read `docs/CODING.md` for coding standards and practices to follow (if exists)
- Review current codebase structure

#### 2. **Confirm Task with User**
Use the `ask_followup_question` tool to confirm the development direction. Don't suggest a lot of options: only if they want to work on the next task or work on something else (which they will have to specify via chat).
- Ask if the user wants to implement the next recommended task from `PROJECT_STATUS.md`
- Provide a brief description of what that task involves
- Offer the option for the user to specify a different task or area of focus
- Wait for user confirmation before proceeding

#### 3. **Implement → Test → Commit Workflow (CRITICAL)**
For each individual task/fix:

**Step A: Implement**
- Make the code changes for ONE task at a time
- Ensure code quality and TypeScript compliance
- Keep changes small and focused

**Step B: Request Testing**
- After implementing, ask the user to test the change
- Provide clear testing instructions (what to check, where to look)
- **DO NOT run the dev server** unless explicitly asked
- Wait for user confirmation that it works

**Step C: Request Commit**
- After user confirms the change works, ask if they want to: commit, have already commited or if there's an issue.
- Wait for user to confirm the commit is done

**Step D: Repeat**
- Only after the prev confirmation, move to the next task
- If user reports issues, debug and fix before continuing

#### 4. **Update Project Status**
After completing a batch of tasks or at the end of a session:
- Update `docs/PROJECT_STATUS.md` with:
  - What was completed in this session
  - Current working state
  - Next recommended task/priority
  - Any important notes or decisions made

### Development Context:
- **Current Directory:** `/Users/marlon/dev/tripmind`
- **Package Manager:** pnpm
- **Development Command:** `pnpm dev`
- **Architecture:** Next.js (App Router) + React 18 + TypeScript + TailwindCSS + Supabase
- **Repository:** `git@github.com:marlonbernardes/tripmind.git`

### Key Principles:
- **One Task at a Time:** Complete implement → test → commit cycle before moving on
- **User Testing Required:** Always verify functionality with user before proceeding
- **Atomic Commits:** Each fix/feature should be its own commit
- **Documentation First:** Read docs to understand current state
- **Status Updates:** Keep PROJECT_STATUS.md current and accurate
- **Quality Focus:** Ensure TypeScript compliance and code quality
- **Offline-First:** Prioritize offline functionality with sync capabilities
- **PWA Ready:** Build with Progressive Web App capabilities

### Tripmind-Specific Context:
- **Primary Focus:** Timeline workspace with grouped daily activities
- **Core Features:** Trip management, activity timeline, wallet (file storage), map view
- **Tech Stack:** Next.js + Zustand + IndexedDB (Dexie) + Supabase + Mapbox
- **UI Framework:** shadcn/ui + TailwindCSS with dark/light mode support
- **Data Strategy:** Offline-first with optimistic updates and background sync
- **Authentication:** Supabase Auth with OAuth and magic links
- **File Storage:** Supabase Storage for trip documents and files

**Start by reading the documentation files to understand what needs to be done next.**

---

## Timeline Utilities

The timeline uses shared utility functions in `frontend/src/lib/timeline-utils.ts`:

- **`expandActivitiesToDays(activities)`** - Expands multi-day activities into individual day entries for flat list display
- **`groupActivitiesByDate(activities)`** - Groups activities by date, with multi-day activities appearing in each spanned day
- **`formatShortDate(dateStr)`** / **`formatDayOfWeek(dateStr)`** - Date formatting helpers

Used by the Timeline page (`/trip/[id]/timeline`) for All/Date/Type grouping modes.

---

## Map View Architecture

The Map view (`/trip/[id]/map`) displays trip activities as sequential map points with navigation controls.

### MapPoint Interface

```typescript
interface MapPoint {
  index: number           // 1-based sequential number
  activityId: string      // Activity ID for URL sync
  activity: SimpleActivity
  coord: [number, number] // [lng, lat]
  time: string            // Specific time for this point
  flags: number           // Bit flags for features
  pairedIndex?: number    // Index of paired point (for ranges)
  rangeTotal?: number     // Total points in range (1 or 2)
  rangePosition?: number  // Position in range (1 or 2)
}
```

### MapPoint Flags (Bit Flags)

```typescript
const MapPointFlags = {
  DEPARTURE: 1,      // Departure point of a range (flight/transport)
  ARRIVAL: 2,        // Arrival point of a range
  OVERNIGHT: 4,      // Overnight stay
  TRANSFER: 8,       // Transfer point
  BOOKED: 16,        // Activity is booked
  HIGHLIGHT: 32,     // Special highlight
}
```

Flags are combined using bitwise OR and checked using bitwise AND:
```typescript
// Setting flags
flags = baseFlags | MapPointFlags.DEPARTURE

// Checking flags
const isDeparture = (point.flags & MapPointFlags.DEPARTURE) !== 0
```

### Activity → MapPoint Conversion

**Single Location Activities** (hotels, events, etc.):
- Create 1 MapPoint
- `time` = `activity.start`
- `flags` = base flags only (e.g., `BOOKED` if applicable)

**Range Activities** (flights, transport):
- Create 2 MapPoints (Departure + Arrival)
- Point 1: `time` = `activity.start`, `flags` = `DEPARTURE`
- Point 2: `time` = `activity.end`, `flags` = `ARRIVAL`
- Both points reference each other via `pairedIndex`

### Marker Visibility Rules

1. **Current marker** - Always visible
2. **Nearby markers (50km)** - Shown ONLY if current point is NOT a DEPARTURE
3. **Paired markers** - Never shown (used for zoom calculation only)

Logic:
```typescript
// For DEPARTURE points: only show current marker
if (currentPoint.flags & MapPointFlags.DEPARTURE) {
  return Set([currentPoint.index])
}

// For other points: show current + nearby (within 50km)
```

### Zoom Behavior

**Single location points**: Zoom to level 14

**Range activities**: Calculate zoom based on distance between departure/arrival:
- `>5000km`: zoom 3 (Intercontinental)
- `2000-5000km`: zoom 4 (Continental)
- `1000-2000km`: zoom 5 (Large country)
- `500-1000km`: zoom 6 (Medium distance)
- `200-500km`: zoom 7 (Regional)
- `100-200km`: zoom 8
- `50-100km`: zoom 9
- `20-50km`: zoom 10
- `<20km`: zoom 12

Always center on current point, not midpoint between points.

### Route Lines

**Current Route** (for range activities):
- Color: Activity type color
- Style: Dashed `[2, 2]`
- Width: 3px, Opacity: 70%
- Drawn between departure and arrival coordinates

**Next Route Preview**:
- Color: Gray (`#9ca3af`)
- Style: Dashed `[4, 4]` (more spaced)
- Width: 2px, Opacity: 50%
- Drawn from current point to next sequential point

### Controls Bar

Located at bottom of map view:
- **Prev/Next buttons**: Navigate through map points sequentially
- **Point info**: Title, flag pills, activity type, date, time, city
- **Quick action buttons**: Add Hotel, Event, Transport

### Flag Pills Display

Flag pills appear in the controls bar info section:
- `DEPARTURE`: Blue pill (#0284c7)
- `ARRIVAL`: Green pill (#059669)
- `BOOKED`: Green pill (#16a34a)
- Multiple flags can be shown simultaneously

### URL Sync (Deep Linking)

The map supports deep linking via URL parameters:

**URL Format:**
```
/trip/[id]/map?a=<activityId>&d=1
```

**Parameters:**
- `a` = Activity ID (required for deep link)
- `d` = Departure flag (`1` if point is DEPARTURE, omitted otherwise)

**On Page Load:**
1. Read `a` (activityId) and `d` (departure) from URL
2. Find matching MapPoint where:
   - `point.activityId === urlActivityId`
   - AND if `d=1`, point has `DEPARTURE` flag
3. Set `currentIndex` to that point's array index

**On Navigation:**
- URL is updated (shallow) when user navigates to different points
- This allows sharing/bookmarking specific map locations

### Controls Bar Layout

The info bar shows (left to right):
1. **Sequential number badge** - Colored circle with point index
2. **Activity icon** - Emoji based on activity type
3. **Point details** - Title, flag pills, type badge, date, time, city
4. **Quick action buttons** - Add Hotel, Event, Transport
