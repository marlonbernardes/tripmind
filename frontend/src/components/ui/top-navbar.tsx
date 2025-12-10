'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navigationItems, isNavItemActive } from '@/lib/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export function TopNavbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between h-14 px-3 md:h-16 md:px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            {/* Hide text on mobile */}
            <h1 className="hidden md:block text-xl font-semibold text-gray-900 dark:text-white">
              Tripmind
            </h1>
          </Link>

          {/* Navigation Items - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = isNavItemActive(item, pathname)
              
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

        {/* Right Section - Theme Toggle & User */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Section - simplified on mobile */}
          <Link
            href="/settings"
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg px-2 md:px-3 py-2 transition-colors"
          >
            {/* Hide text on mobile */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">User</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">user@example.com</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-medium">
              M
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        // Sun icon for light mode
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
