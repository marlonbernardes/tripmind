export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
  /** Pattern to check for active state (e.g., '/timeline' will match any path containing '/timeline') */
  activePattern?: string
}

export const navigationItems: Omit<NavigationItem, 'icon'>[] = [
  {
    id: 'trips',
    label: 'Trips',
    href: '/trips',
  },
  {
    id: 'plan',
    label: 'Plan',
    href: '/plan',
    activePattern: '/plan',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    href: '/trip/1/timeline', // For demo purposes
    activePattern: '/timeline',
  }
]

/**
 * Check if a navigation item is active based on the current pathname
 */
export function isNavItemActive(item: Omit<NavigationItem, 'icon'>, pathname: string): boolean {
  if (pathname === item.href) return true
  if (item.activePattern && pathname.includes(item.activePattern)) return true
  return false
}
