import { 
  UtensilsCrossed, 
  Landmark, 
  Mountain, 
  Moon, 
  ShoppingBag, 
  Flower2, 
  Camera, 
  TreePine,
  Scale,
  Rocket,
  type LucideIcon 
} from 'lucide-react'
import type { TripInterest, TripPacing } from '@/types/simple'

// ==================== INTERESTS CONFIG ====================

export interface InterestConfig {
  id: TripInterest
  name: string
  icon: LucideIcon
}

/**
 * All available trip interest categories.
 * Used in TripWizard (creation) and TripConfigTab (editing).
 * 
 * TODO: Backend should use these interests to determine what event suggestions
 * will be made. For example:
 * - 'food' → suggest restaurants, food tours, markets
 * - 'culture' → suggest museums, historical sites, temples
 * - 'adventure' → suggest hiking, water sports, outdoor activities
 * - 'nightlife' → suggest bars, clubs, evening events
 * - 'shopping' → suggest malls, markets, shopping districts
 * - 'relaxation' → suggest spas, beaches, parks
 * - 'photos' → suggest viewpoints, iconic landmarks
 * - 'nature' → suggest national parks, gardens, nature trails
 */
export const INTERESTS: InterestConfig[] = [
  { id: 'food', name: 'Food & Dining', icon: UtensilsCrossed },
  { id: 'culture', name: 'History & Culture', icon: Landmark },
  { id: 'adventure', name: 'Adventure', icon: Mountain },
  { id: 'nightlife', name: 'Nightlife', icon: Moon },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
  { id: 'relaxation', name: 'Relaxation', icon: Flower2 },
  { id: 'photos', name: 'Photo Spots', icon: Camera },
  { id: 'nature', name: 'Nature', icon: TreePine },
]

// Helper to get all interest IDs
export const ALL_INTEREST_IDS: TripInterest[] = INTERESTS.map(i => i.id)

// Helper to get interest by ID
export function getInterest(id: TripInterest): InterestConfig | undefined {
  return INTERESTS.find(i => i.id === id)
}

// ==================== PACING CONFIG ====================

export interface PacingConfig {
  id: TripPacing
  name: string
  description: string
  icon: LucideIcon
}

/**
 * Trip pacing options that control suggestion density.
 * 
 * TODO: Backend should use pacing to control suggestion frequency:
 * - 'relaxed': Max 4-hour gaps between activities are acceptable, 1-2 activities per day
 * - 'moderate': Max 2-hour gaps between activities, 2-3 activities per day
 * - 'packed': Minimal gaps, back-to-back activities suggested, 4+ activities per day
 */
export const PACING_OPTIONS: PacingConfig[] = [
  { id: 'relaxed', name: 'Relaxed', description: 'Plenty of free time, 1-2 activities per day', icon: Flower2 },
  { id: 'moderate', name: 'Moderate', description: 'Balanced mix of activities and downtime', icon: Scale },
  { id: 'packed', name: 'Packed', description: 'Action-packed, maximize every moment', icon: Rocket },
]

// Helper to get pacing by ID
export function getPacing(id: TripPacing): PacingConfig | undefined {
  return PACING_OPTIONS.find(p => p.id === id)
}
