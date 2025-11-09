# 🏗️ Tripmind Development Blueprint

## Project Overview
Building a responsive web application for trip planning with offline-first capabilities, timeline workspace, file management, and map visualization.

## Architecture Decisions

### Core Foundation
- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand for client state + sync queue
- **Database**: Supabase (PostgreSQL) + IndexedDB (Dexie) for offline
- **Authentication**: Supabase Auth (OAuth + Magic Links)
- **Maps**: Mapbox GL JS
- **PWA**: next-pwa for service worker and caching
- **Deployment**: Vercel

### Data Flow Architecture
```
User Input → Zustand Store → IndexedDB (immediate) → Sync Queue → Supabase (when online)
                ↓
         React Components ← Real-time Updates ← Supabase Realtime
```

### Database Schema Design

#### Core Tables
```sql
-- Users table (managed by Supabase Auth)
users (id, email, created_at, updated_at)

-- Trips table
trips (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  name: text NOT NULL,
  start_date: date,
  end_date: date,
  flexible_dates: boolean DEFAULT false,
  color: text DEFAULT '#3B82F6',
  icon: text DEFAULT 'map-pin',
  created_at: timestamptz,
  updated_at: timestamptz
)

-- Activities table
activities (
  id: uuid PRIMARY KEY,
  trip_id: uuid REFERENCES trips(id),
  type: activity_type NOT NULL, -- enum: flight, hotel, event, transport, note, hold, task
  title: text NOT NULL,
  start_ts: timestamptz,
  end_ts: timestamptz,
  status: activity_status DEFAULT 'planned', -- enum: planned, confirmed, cancelled
  city: text,
  location: text,
  notes: text,
  meta: jsonb, -- type-specific data
  created_at: timestamptz,
  updated_at: timestamptz
)

-- Wallet Items table
wallet_items (
  id: uuid PRIMARY KEY,
  trip_id: uuid REFERENCES trips(id),
  title: text,
  file_type: file_type, -- enum: pdf, image, link, document
  file_url: text,
  file_size: integer,
  metadata: jsonb,
  linked_activity_id: uuid REFERENCES activities(id),
  traveler: text,
  created_at: timestamptz,
  updated_at: timestamptz
)
```

## Development Phases

### Phase 1: Foundation & Setup
**Goal**: Establish project structure, basic routing, and authentication
- Next.js project setup with TypeScript
- TailwindCSS and shadcn/ui integration
- Basic routing structure
- Supabase setup and authentication
- PWA configuration

### Phase 2: Core Data Layer
**Goal**: Implement offline-first data management
- Zustand store structure
- IndexedDB setup with Dexie
- Supabase client configuration
- Basic CRUD operations
- Sync queue implementation

### Phase 3: Trip Management
**Goal**: Complete trip creation and management
- Trip listing page
- Trip creation form
- Trip editing and deletion
- Local caching and sync
- Navigation between trips

### Phase 4: Timeline Foundation
**Goal**: Basic timeline view and activity management
- Timeline layout with day grouping
- Activity creation forms
- Activity display cards
- Right panel implementation
- Basic activity CRUD

### Phase 5: Activity Types & Enhanced Timeline
**Goal**: Complete activity type system and timeline features
- Activity type icons and styling
- Type-specific forms and validation
- Timeline sorting and grouping
- Activity editing and deletion
- Drag and drop (future-ready)

### Phase 6: Wallet Implementation
**Goal**: File upload and management system
- File upload interface
- Supabase Storage integration
- File preview capabilities
- Metadata management
- Activity linking

### Phase 7: Map Integration
**Goal**: Spatial visualization of activities
- Mapbox setup and configuration
- Activity pin rendering
- Map/Timeline view toggle
- Location-based features
- Offline map caching

### Phase 8: Offline & Sync Polish
**Goal**: Robust offline functionality and sync
- Advanced sync conflict resolution
- Background sync
- Offline indicators
- Network status handling
- Error recovery

### Phase 9: PWA & Performance
**Goal**: Production-ready PWA features
- Service worker optimization
- Offline page handling
- Install prompts
- Performance optimization
- Caching strategies

### Phase 10: UI Polish & Responsive Design
**Goal**: Complete responsive design and UX polish
- Mobile-first responsive design
- Dark/light theme implementation
- Accessibility improvements
- Loading states and animations
- Error boundaries

## Key Implementation Considerations

### Offline-First Strategy
1. **Optimistic Updates**: All user actions immediately update local state
2. **Sync Queue**: Failed operations queued for retry
3. **Conflict Resolution**: Timestamp-based with user resolution UI
4. **Cache Strategy**: Critical data cached locally, non-critical data on-demand

### Performance Optimization
1. **Route-based Code Splitting**: Automatic with Next.js App Router
2. **Lazy Loading**: Components and features loaded on-demand
3. **Image Optimization**: Next.js Image component with responsive images
4. **Database Indexing**: Proper indexes on frequently queried fields

### Security Implementation
1. **Row Level Security (RLS)**: All Supabase tables protected
2. **File Access Control**: Signed URLs with expiration
3. **Input Validation**: Client and server-side validation
4. **Authentication State**: Secure session management

### Scalability Considerations
1. **Modular Architecture**: Feature-based folder structure
2. **API Abstraction**: Centralized API layer for easy backend switching
3. **Component Reusability**: Shared components with proper TypeScript interfaces
4. **State Management**: Scalable Zustand store structure

## Development Standards

### Code Organization
```
src/
├── app/                     # Next.js App Router pages
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── features/           # Feature-specific components
├── lib/                    # Utilities and configurations
│   ├── supabase/          # Supabase client and types
│   ├── db/                # IndexedDB (Dexie) setup
│   ├── stores/            # Zustand stores
│   └── utils/             # Helper functions
├── types/                  # TypeScript type definitions
└── hooks/                  # Custom React hooks
```

### TypeScript Standards
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object definitions
- Proper error handling with Result types

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API operations
- E2E tests for critical user flows
- Offline functionality testing

This blueprint provides the foundation for systematic, incremental development of the Tripmind application with proper architecture, scalability, and maintainability considerations.
