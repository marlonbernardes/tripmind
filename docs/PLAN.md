# 🧭 Travel Planner MVP Specification

## 1. Overview
A responsive **web application** for planning trips, organizing activities on a timeline, managing bookings, and working offline.  
No AI or collaboration yet — only design provisions for them.  
Built for extensibility toward future mobile apps and AI-assisted features.

---

## 2. Core Objectives
- Central **timeline workspace** with grouped daily activities.  
- **Offline-first**: read & edit without internet, auto-sync on reconnect.  
- **Per-trip wallet** for storing documents and files.  
- **Map view** to visualize activities spatially.  
- Cloud sync + local persistence.  
- Minimal, functional UI with strong foundations for future AI and collaboration.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| Frontend | **Next.js (App Router, React 18, TypeScript)** | Core SPA/PWA framework |
| Styling | **TailwindCSS + shadcn/ui** | Design system + dark/light mode |
| State | **Zustand** | Local store for offline cache and sync queue |
| Local DB | **IndexedDB (Dexie)** | Stores trips, activities, wallet metadata |
| Backend | **Supabase Cloud** | Auth, PostgreSQL, Storage, Realtime |
| Auth | **Supabase Auth (magic link + OAuth)** | Persistent sessions for offline |
| Maps | **Mapbox GL JS** | Read-only map visualization |
| Deployment | **Vercel** | CI/CD, edge functions optional |

---

## 4. Information Architecture

### Primary Sections
1. **Trips**
   - Displays user’s trips.  
   - Create trip form: name, start date, end date, flexible dates toggle, color/icon.  
2. **Timeline**
   - Infinite scroll grouped by day.  
   - Right panel persistent on desktop; slide-up on mobile.  
   - Core activity editing and visualization.  
3. **Wallet**
   - Manual uploads per trip (PDF, image, link).  
   - Optional metadata: title, type, traveler, linked activity.  
4. **Settings/Profile**
   - User preferences and account management.

---

## 5. Core Features

### 5.1 Trip Management
- Create trip via form.  
- Store in Supabase (`trips` table).  
- No destinations field; inferred dynamically.  
- Each trip has local cache mirror.  
- Trip deletion/rename supported locally + synced.

### 5.2 Timeline

#### Structure
- Infinite scroll grouped by **day headers** (`Day, Date — City(s)`).
- Sticky headers when scrolling.
- Auto-detect city via activities (arrival/departure).
- Auto-sort activities by start time.
- Travel-day markers auto-generated for cross-day or timezone-spanning activities.

#### Activity Types
- **flight**, **hotel**, **event**, **transport**, **note**, **hold**, **task**.
- Base fields: `id`, `trip_id`, `type`, `title`, `start_ts`, `end_ts`, `status`, `city`, `meta (JSON)`.
- Type-specific data can later extend into separate tables (flights, hotels, events, etc.).

#### Interactions
- “+ Add activity” opens the **right panel** creation form.  
- Edit activity → same panel loads populated fields.  
- Deleting/editing marks record in offline queue.  
- Reordering of days or city-blocks designed but not implemented yet.  
- No AI or smart suggestions visible in MVP.

#### Display
- Compact activity cards with icons per type.  
- Subtle accent line or badge for type differentiation.  
- Hover/click expands to view details in right panel.  
- Sticky right panel inspector on desktop; collapsible drawer on mobile.

---

## 6. Wallet

### Scope
- Per-trip repository for uploaded files (PDF, image, link).  
- Optional metadata: title, file type, traveler, linked activity.  
- Manual uploads only (no parsing yet).  
- Inline preview for PDFs/images if supported.  
- Files stored in Supabase Storage; metadata in Postgres.

### Future-Ready Design
- Schema supports AI extraction and structured parsing (deferred).  
- Each item can later link directly to an activity.

---

## 7. Offline-First Architecture

### Data Layer
- IndexedDB (via Dexie) stores trips, activities, wallet metadata.
- Cached data persisted between sessions.
- Background sync compares `last_modified` timestamps with Supabase.

### Sync Strategy
- Optimistic local writes.  
- Pending changes stored in `syncQueue`.  
- On reconnect, queued ops are pushed → server updates.  
- Conflict resolution:  
  - Compare `updated_at` timestamps.  
  - Prompt user in right panel if conflict detected.  
  - Allow field-level resolution (local vs server).  
- Visual feedback: unsynced icon (🕓).

### Offline Map
- Static tiles cached for current trip bounds.  
- No live map editing offline.

---

## 8. Error Handling

### Local Errors
- Failed saves queued and marked “unsynced.”  
- Local validation (required fields, time consistency).  
- Alerts use shadcn’s toast system.

### Network/Sync
- Exponential retry with backoff (1s → 1m).  
- “Sync now” manual trigger.  
- Visual state icons:
  - ⚡ Synced
  - 🕓 Pending sync
  - ⚠ Conflict
  - ❌ Failed

### File Uploads
- Upload failures retried on reconnect.  
- Max file size enforced (configurable, default 10MB).  
- Offline uploads stored in temporary queue, retried automatically.

---

## 9. Map View

### MVP Scope
- Toggle between “Timeline ▣ | Map □”.  
- Read-only map showing pins for activities and routes for transports/flights.  
- Clicking pin focuses right panel activity details.  
- Mapbox GL JS with Supabase-hosted GeoJSON endpoint.  
- No manual editing or pin movement.

---

## 10. Authentication & Storage

- Supabase Auth with OAuth (Google/Apple) and optional magic links.  
- Session tokens cached locally for offline mode.  
- Database: PostgreSQL (Supabase)  
  - Tables: `users`, `trips`, `activities`, `wallet_items`.  
  - RLS enforces per-user data security.  
- File uploads to Supabase Storage bucket `/wallet_files/{user_id}/{trip_id}/`.

---

## 11. PWA Behavior

- App installable as PWA.  
- Service worker via `next-pwa`.  
- Caches static assets, IndexedDB data, and recent trips.  
- Supports background sync and offline startup.  
- Update prompt for new versions.

---

## 12. UI/UX Design

### Theme
- Neutral global theme (gray/blue tones).  
- Dark/light mode supported via system preference.

### Components
- shadcn/ui primitives for cards, tabs, accordions, modals, and forms.  
- Timeline: collapsible day sections with sticky headers.  
- Right panel: tabbed layout — Overview, Details, Notes, Files.  
- No AI or sharing elements in MVP.

### Mobile
- Same layout responsively:
  - Timeline full-width.
  - Right panel → slide-up sheet.
  - Navigation via bottom bar or drawer.

---

## 13. Security & Privacy
- All Supabase endpoints secured with RLS policies.  
- File URLs signed, expire after configurable duration.  
- Local cache encrypted at rest (browser’s storage APIs).  
- No AI or data sharing; all data stays user-private.

---

## 14. Deployment
- Deploy via **Vercel** linked to GitHub.  
- Environment variables for Supabase keys, Mapbox tokens.  
- CI pipeline auto-builds on main merges.  
- Optional staging environment.

---

## 15. Future Extensions (Post-MVP)
- AI suggestions & chat assistant.  
- Email/ticket parsing and auto-import.  
- Multi-user collaboration.  
- Structured wallet entries.  
- Trip sharing/export.  
- Reordering city blocks and automated date adjustments.

---

**Deliverables for Developer**
- Next.js repo initialized with Tailwind + shadcn/ui + Dexie + Supabase client.  
- PWA configured with service worker caching.  
- Supabase schema (users, trips, activities, wallet_items).  
- Zustand store with sync queue.  
- Basic routing: `/`, `/trip/[id]/timeline`, `/trip/[id]/wallet`, `/settings`.  
- Map view toggle and right panel logic implemented.  
- Offline edit + sync working E2E.

