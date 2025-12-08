'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { GanttUnifiedHeader } from './GanttUnifiedHeader'
import { GanttLeftPanel } from './GanttLeftPanel'
import { GanttGrid } from './GanttGrid'
import { useGanttDates } from './hooks/useGanttDates'
import { useGroupedActivities } from './hooks/useGroupedActivities'
import { format } from 'date-fns'
import { VIEW_MODES, ACTIVITY_COLORS } from './utils/viewModeConfig'
import type { CustomGanttChartProps, ViewModeName } from './types'
import type { SimpleActivity } from '@/types/simple'

export function CustomGanttChart({
  activities,
  selectedActivityId,
  onActivitySelect,
  onActivityUpdate,
  leftPanelWidth = 250
}: CustomGanttChartProps) {
  const [viewMode] = useState<ViewModeName>('Day')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['event', 'transport', 'note', 'task']) // flight and hotel collapsed by default
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const [columnWidthMultiplier, setColumnWidthMultiplier] = useState(1) // 100% zoom (base width is already scaled 2.25x)
  const [activeActivity, setActiveActivity] = useState<SimpleActivity | null>(null)
  const [activeEventLocked, setActiveEventLocked] = useState(false)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Get the width and subtract left panel width to get available grid space
        const width = containerRef.current.offsetWidth - leftPanelWidth
        setContainerWidth(width)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [leftPanelWidth])
  
  const baseViewModeConfig = VIEW_MODES[viewMode]
  
  const { ganttStart, ganttEnd, columns, firstColumnDate } = useGanttDates(
    activities, 
    baseViewModeConfig,
    containerWidth
  )
  
  // Calculate dynamic column width based on container and number of columns
  const viewModeConfig = useMemo(() => {
    if (columns.length === 0 || containerWidth === 0) {
      return baseViewModeConfig
    }
    
    // Calculate base width - scaled 2.25x from the original fit-to-container calculation
    const baseWidth = Math.floor((containerWidth / columns.length) * 2.25)
    
    // Apply zoom multiplier
    const adjustedWidth = Math.round(baseWidth * columnWidthMultiplier)
    
    // Set minimum widths based on view mode
    const minWidth = viewMode === 'Month' ? 100 : 30
    const finalWidth = Math.max(minWidth, adjustedWidth)
    
    return {
      ...baseViewModeConfig,
      columnWidth: finalWidth
    }
  }, [viewMode, baseViewModeConfig, columns.length, columnWidthMultiplier, containerWidth])
  
  // Calculate if we need additional columns to fill viewport when zoomed out
  const totalWidth = columns.length * viewModeConfig.columnWidth
  const needsMoreColumns = totalWidth < containerWidth
  
  // Zoom controls
  const handleZoomIn = () => {
    setColumnWidthMultiplier(prev => Math.min(prev + 0.25, 3)) // Max 3x
  }
  
  const handleZoomOut = () => {
    setColumnWidthMultiplier(prev => Math.max(prev - 0.25, 0.5)) // Min 0.5x (50%)
  }
  
  const handleResetZoom = () => {
    setColumnWidthMultiplier(1)
  }
  
  const groupedActivities = useGroupedActivities(activities, expandedCategories)
  
  const toggleCategory = (type: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }
  
  // Handle hover/click for active activity
  const handleActivityHover = (activity: SimpleActivity | null) => {
    if (!activeEventLocked) {
      setActiveActivity(activity)
    }
  }
  
  const handleActivityClick = (activity: SimpleActivity) => {
    if (activeEventLocked && activeActivity?.id === activity.id) {
      // Unlock if clicking the same activity
      setActiveEventLocked(false)
      setActiveActivity(null)
    } else {
      // Lock to new activity
      setActiveEventLocked(true)
      setActiveActivity(activity)
    }
    
    // Also trigger the activity details panel to open
    onActivitySelect?.(activity)
  }
  
  // Handle click outside to clear locked state
  useEffect(() => {
    if (!activeEventLocked) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if click is outside any activity bar
      if (!target.closest('[data-activity-bar]')) {
        setActiveEventLocked(false)
        setActiveActivity(null)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeEventLocked])
  
  // Keyboard navigation: Escape to clear active activity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (activeActivity || activeEventLocked)) {
        setActiveEventLocked(false)
        setActiveActivity(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeActivity, activeEventLocked])
  
  // Track mouse position for vertical line
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const scrollLeft = scrollContainerRef.current.scrollLeft
    // Calculate X position relative to the grid (accounting for left panel and scroll)
    const relativeX = e.clientX - rect.left + scrollLeft - leftPanelWidth
    if (relativeX >= 0) {
      setMouseX(relativeX)
    } else {
      setMouseX(null)
    }
  }
  
  const handleMouseLeave = () => {
    setMouseX(null)
  }
  
  // Calculate the exact time at mouse position
  const getTimeAtMousePosition = (): Date | null => {
    if (mouseX === null || !firstColumnDate || columns.length === 0) return null
    
    // Calculate which column and position within the column
    const columnIndex = Math.floor(mouseX / viewModeConfig.columnWidth)
    const positionInColumn = (mouseX % viewModeConfig.columnWidth) / viewModeConfig.columnWidth
    
    if (columnIndex < 0 || columnIndex >= columns.length) return null
    
    const columnStart = columns[columnIndex]
    const columnEnd = columnIndex + 1 < columns.length 
      ? columns[columnIndex + 1] 
      : new Date(columnStart.getTime() + viewModeConfig.step)
    
    // Interpolate the exact time
    const timeMs = columnStart.getTime() + (columnEnd.getTime() - columnStart.getTime()) * positionInColumn
    return new Date(timeMs)
  }
  
  const hoveredTime = getTimeAtMousePosition()
  
  // Configurable: Show activities that start within this window (in milliseconds)
  const TOOLTIP_TIME_WINDOW = 30 * 60 * 1000 // 30 minutes
  
  // Sort activities by priority for tooltip display
  const sortActivitiesByPriority = (activitiesToSort: SimpleActivity[], hoveredMs: number): SimpleActivity[] => {
    const typePriority: Record<string, number> = {
      'event': 1,     // Events show first
      'transport': 2,
      'flight': 3,
      'hotel': 4,     // Hotels typically span longer, show later
      'task': 5,
      'note': 6
    }
    
    return [...activitiesToSort].sort((a, b) => {
      // First sort by type priority
      const priorityA = typePriority[a.type] ?? 99
      const priorityB = typePriority[b.type] ?? 99
      if (priorityA !== priorityB) return priorityA - priorityB
      
      // Then by how close the start time is to the hovered time
      const startA = new Date(a.start).getTime()
      const startB = new Date(b.start).getTime()
      const distA = Math.abs(startA - hoveredMs)
      const distB = Math.abs(startB - hoveredMs)
      return distA - distB
    })
  }
  
  // Find activities that overlap with the hovered time OR start within the time window
  const getActivitiesAtTime = (): SimpleActivity[] => {
    if (!hoveredTime) return []
    
    const hoveredMs = hoveredTime.getTime()
    const windowStart = hoveredMs - TOOLTIP_TIME_WINDOW
    const windowEnd = hoveredMs + TOOLTIP_TIME_WINDOW
    
    const overlapping = activities.filter(activity => {
      const start = new Date(activity.start).getTime()
      const end = activity.end ? new Date(activity.end).getTime() : start
      
      // Activity is relevant if:
      // 1. It overlaps with the hovered time (start <= hovered < end), OR
      // 2. It starts within the time window (for point events or nearby starts)
      const overlapsHovered = end > start ? (start <= hoveredMs && hoveredMs < end) : false
      const startsNearby = start >= windowStart && start <= windowEnd
      
      return overlapsHovered || startsNearby
    })
    
    return sortActivitiesByPriority(overlapping, hoveredMs)
  }
  
  const activitiesAtCursor = getActivitiesAtTime()
  
  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No activities to display
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:h-full"
    >
      {/* Zoom Controls */}
      <div className="flex items-center justify-end px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom:</span>
          <button
            onClick={handleZoomOut}
            disabled={columnWidthMultiplier <= 0.5}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs rounded transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Reset zoom"
          >
            {Math.round(columnWidthMultiplier * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={columnWidthMultiplier >= 3}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Content Area - scrollable with sticky context */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Vertical mouse-follow line with tooltip */}
        {mouseX !== null && hoveredTime && (
          <>
            {/* The vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-blue-500/60 pointer-events-none z-40"
              style={{ left: leftPanelWidth + mouseX }}
            />
            {/* Tooltip following the line */}
            <div
              className="absolute top-28 z-[9999] pointer-events-none"
              style={{ left: leftPanelWidth + mouseX }}
            >
              <div className="relative -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[220px] max-w-[320px] overflow-hidden">
                {/* Time header - always shown */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                    {format(hoveredTime, 'EEE, MMM d · h:mm a')}
                  </div>
                </div>
                
                {activitiesAtCursor.length === 0 ? (
                  // No events
                  <div className="px-3 py-2 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      No activities at this time
                    </div>
                  </div>
                ) : (
                  // Show activities
                  <div className="p-3 space-y-3">
                    {activitiesAtCursor.map((activity, idx) => (
                      <div key={activity.id} className={idx > 0 ? 'pt-3 border-t border-gray-200 dark:border-gray-700' : ''}>
                        {/* Title */}
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {activity.title}
                        </h4>
                        
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: ACTIVITY_COLORS[activity.type] || '#6B7280' }}
                          >
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </span>
                        </div>
                        
                        {/* Date range */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 pt-2">
                          <div className="flex gap-2">
                            <span className="font-medium w-10">From:</span>
                            <span>{format(new Date(activity.start), 'MMM dd, h:mm a')}</span>
                          </div>
                          {activity.end && (
                            <div className="flex gap-2">
                              <span className="font-medium w-10">To:</span>
                              <span>{format(new Date(activity.end), 'MMM dd, h:mm a')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {/* Header Row - Left Panel Spacer + Date Headers */}
        <div className="sticky top-0 z-50 flex bg-white dark:bg-gray-900">
          {/* Left Panel Header Spacer - Sticky to left */}
          <div 
            className="sticky left-0 z-50 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 border-r border-gray-200 dark:border-gray-700"
            style={{ width: leftPanelWidth }}
          >
            <div className="h-11 border-b border-gray-200 dark:border-gray-700" />
            <div className="h-8 border-b border-gray-200 dark:border-gray-700" />
            <div className="h-6" />
          </div>
          
          {/* Date Headers */}
          <div className="z-50 relative">
            <GanttUnifiedHeader
              columns={columns}
              viewModeConfig={viewModeConfig}
              leftPanelWidth={0}
              activeActivity={activeActivity}
              ganttStart={firstColumnDate}
            />
          </div>
        </div>
        
        {/* Content Area - Left Panel + Grid */}
        <div className="flex">
          {/* Sticky Left Panel */}
          <div 
            className="sticky left-0 z-20 bg-white dark:bg-gray-900 flex-shrink-0"
            style={{ width: leftPanelWidth }}
          >
            <GanttLeftPanel
              groupedActivities={groupedActivities}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              selectedActivityId={selectedActivityId}
              onActivitySelect={onActivitySelect}
            />
          </div>
          
          {/* Grid Area */}
          <div 
            className="flex-1"
            style={{ minWidth: columns.length * viewModeConfig.columnWidth }}
          >
            <GanttGrid
              columns={columns}
              groupedActivities={groupedActivities}
              viewModeConfig={viewModeConfig}
              ganttStart={firstColumnDate}
              selectedActivityId={selectedActivityId}
              onActivityUpdate={onActivityUpdate}
              onActivityHover={handleActivityHover}
              onActivityClick={handleActivityClick}
              activeActivity={activeActivity}
              containerRef={containerRef.current}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
