/**
 * Trip Service - Data operations for trips and activities
 * 
 * This service abstracts data persistence, making it easy to swap from
 * mock data to a real backend when ready.
 */

import type { Trip, Activity, FixedTrip, FlexibleTrip } from '@/types/simple'
import { mockTrips, mockActivities } from './mock-data'

// ============================================================================
// Types
// ============================================================================

export interface CreateTripInput {
  name: string
  dateMode: 'fixed' | 'flexible'
  // Fixed mode
  startDate?: string
  endDate?: string
  // Flexible mode
  duration?: number
  // Optional
  color?: string
}

export interface UpdateTripInput {
  name?: string
  color?: string
  dateMode?: 'fixed' | 'flexible'
  startDate?: string
  endDate?: string
  duration?: number
}

export interface CreateActivityInput extends Omit<Activity, 'id'> {}

// ============================================================================
// Trip Service Interface
// ============================================================================

export interface ITripService {
  // Trip operations
  getTrips(): Promise<Trip[]>
  getTrip(id: string): Promise<Trip | null>
  createTrip(input: CreateTripInput): Promise<Trip>
  updateTrip(id: string, updates: UpdateTripInput): Promise<Trip>
  deleteTrip(id: string): Promise<void>
  
  // Activity operations (scoped to a trip)
  getActivities(tripId: string): Promise<Activity[]>
  createActivity(input: CreateActivityInput): Promise<Activity>
  updateActivity(id: string, updates: Partial<Activity>): Promise<Activity>
  deleteActivity(id: string): Promise<void>
}

// ============================================================================
// Mock Implementation
// ============================================================================

// In-memory store (starts with mock data)
let trips: Trip[] = [...mockTrips]
let activities: Activity[] = [...mockActivities]

// Default trip colors
const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#14B8A6']

function getRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Mock implementation of the trip service.
 * Uses in-memory storage. Replace with API calls when backend is ready.
 */
class MockTripService implements ITripService {
  // Simulate network delay for realistic testing
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // -------------------------------------------------------------------------
  // Trip Operations
  // -------------------------------------------------------------------------

  async getTrips(): Promise<Trip[]> {
    await this.delay()
    return [...trips]
  }

  async getTrip(id: string): Promise<Trip | null> {
    await this.delay()
    return trips.find(t => t.id === id) ?? null
  }

  async createTrip(input: CreateTripInput): Promise<Trip> {
    await this.delay()

    const id = generateId('trip')
    const color = input.color ?? getRandomColor()

    let newTrip: Trip

    if (input.dateMode === 'fixed') {
      if (!input.startDate || !input.endDate) {
        throw new Error('Fixed trips require startDate and endDate')
      }
      newTrip = {
        id,
        name: input.name,
        color,
        dateMode: 'fixed',
        startDate: input.startDate,
        endDate: input.endDate,
      } as FixedTrip
    } else {
      if (!input.duration) {
        throw new Error('Flexible trips require duration')
      }
      newTrip = {
        id,
        name: input.name,
        color,
        dateMode: 'flexible',
        duration: input.duration,
      } as FlexibleTrip
    }

    trips.push(newTrip)
    return newTrip
  }

  async updateTrip(id: string, updates: UpdateTripInput): Promise<Trip> {
    await this.delay()

    const index = trips.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error(`Trip not found: ${id}`)
    }

    const existingTrip = trips[index]
    let updatedTrip: Trip

    // Handle date mode change
    const newDateMode = updates.dateMode ?? existingTrip.dateMode

    if (newDateMode === 'fixed') {
      const startDate = updates.startDate ?? (existingTrip.dateMode === 'fixed' ? existingTrip.startDate : '')
      const endDate = updates.endDate ?? (existingTrip.dateMode === 'fixed' ? existingTrip.endDate : '')
      
      updatedTrip = {
        id: existingTrip.id,
        name: updates.name ?? existingTrip.name,
        color: updates.color ?? existingTrip.color,
        dateMode: 'fixed',
        startDate,
        endDate,
      } as FixedTrip
    } else {
      const duration = updates.duration ?? (existingTrip.dateMode === 'flexible' ? existingTrip.duration : 7)
      
      updatedTrip = {
        id: existingTrip.id,
        name: updates.name ?? existingTrip.name,
        color: updates.color ?? existingTrip.color,
        dateMode: 'flexible',
        duration,
      } as FlexibleTrip
    }

    trips[index] = updatedTrip
    return updatedTrip
  }

  async deleteTrip(id: string): Promise<void> {
    await this.delay()
    trips = trips.filter(t => t.id !== id)
    // Also delete associated activities
    activities = activities.filter(a => a.tripId !== id)
  }

  // -------------------------------------------------------------------------
  // Activity Operations
  // -------------------------------------------------------------------------

  async getActivities(tripId: string): Promise<Activity[]> {
    await this.delay()
    return activities.filter(a => a.tripId === tripId)
  }

  async createActivity(input: CreateActivityInput): Promise<Activity> {
    await this.delay()

    const newActivity: Activity = {
      ...input,
      id: generateId('activity'),
    }

    activities.push(newActivity)
    return newActivity
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    await this.delay()

    const index = activities.findIndex(a => a.id === id)
    if (index === -1) {
      throw new Error(`Activity not found: ${id}`)
    }

    const updatedActivity = {
      ...activities[index],
      ...updates,
      id, // Ensure ID doesn't change
    }

    activities[index] = updatedActivity
    return updatedActivity
  }

  async deleteActivity(id: string): Promise<void> {
    await this.delay()
    activities = activities.filter(a => a.id !== id)
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const tripService: ITripService = new MockTripService()
