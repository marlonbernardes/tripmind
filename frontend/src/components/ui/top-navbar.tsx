'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  label: string
  href: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'trips',
    label: 'Trips',
    href: '/trips',
  },
  {
    id: 'plan',
    label: 'Plan',
    href: '/plan',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    href: '/trip/1/timeline', // For demo purposes
  },
  {
    id: 'wallet',
    label: 'Wallet',
    href: '/trip/1/wallet', // For demo purposes
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
  }
]

export function TopNavbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tripmind
            </h1>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.id === 'plan' && pathname.includes('/plan')) ||
                (item.id === 'timeline' && pathname.includes('/timeline')) ||
                (item.id === 'wallet' && pathname.includes('/wallet'))
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg px-3 py-2 transition-colors">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">User</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">user@example.com</div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-medium">
            M
          </div>
        </div>
      </div>
    </nav>
  )
}
