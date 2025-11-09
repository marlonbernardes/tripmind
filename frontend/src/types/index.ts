// Core data types for Tripmind application

export type ActivityType = 'flight' | 'hotel' | 'event' | 'transport' | 'note' | 'hold' | 'task'

export type ActivityStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'failed'

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  sync_status?: SyncStatus
}

export interface Trip extends BaseEntity {
  name: string
  start_date: string
  end_date: string
  flexible_dates: boolean
  color?: string
  icon?: string
  user_id: string
}

export interface Activity extends BaseEntity {
  trip_id: string
  type: ActivityType
  title: string
  start_ts: string
  end_ts?: string
  status: ActivityStatus
  city?: string
  notes?: string
  meta: Record<string, any> // JSON field for type-specific data
}

export interface WalletItem extends BaseEntity {
  trip_id: string
  title: string
  file_type: 'pdf' | 'image' | 'link' | 'other'
  file_url?: string
  file_path?: string
  file_size?: number
  traveler?: string
  linked_activity_id?: string
  meta: Record<string, any>
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Sync queue types
export type SyncOperation = 'create' | 'update' | 'delete'
export type SyncEntityType = 'trip' | 'activity' | 'wallet_item'

export interface SyncQueueItem {
  id: string
  entity_type: SyncEntityType
  entity_id: string
  operation: SyncOperation
  data: any
  created_at: string
  retry_count: number
  last_error?: string
}

// Store state types
export interface TripsState {
  trips: Trip[]
  currentTrip: Trip | null
  isLoading: boolean
  error: string | null
}

export interface ActivitiesState {
  activities: Activity[]
  isLoading: boolean
  error: string | null
}

export interface WalletState {
  items: WalletItem[]
  isLoading: boolean
  error: string | null
}

export interface SyncState {
  queue: SyncQueueItem[]
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
}

// App state
export interface AppState {
  user: User | null
  isAuthenticated: boolean
  theme: 'light' | 'dark' | 'system'
}

// Database schema interfaces (for Dexie)
export interface DBTrip extends Omit<Trip, 'sync_status'> {
  sync_status: SyncStatus
}

export interface DBActivity extends Omit<Activity, 'sync_status'> {
  sync_status: SyncStatus
}

export interface DBWalletItem extends Omit<WalletItem, 'sync_status'> {
  sync_status: SyncStatus
}

export interface DBSyncQueueItem extends SyncQueueItem {}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}
