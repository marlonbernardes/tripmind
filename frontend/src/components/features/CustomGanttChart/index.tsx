'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { GanttUnifiedHeader } from './GanttUnifiedHeader'
import { GanttLeftPanel } from './GanttLeftPanel'
import { GanttGrid } from './GanttGrid'
import { useGanttDates } from './hooks/useGanttDates'
import { useGroupedActivities } from './hooks/useGroupedActivities'
import { VIEW_MODES } from './utils/viewModeConfig'
import type { CustomGanttChartProps, ViewModeName } from './types'

export function CustomGanttChart({
  activities,
  selectedActivityId,
  onActivitySelect,
  onActivityUpdate,
  leftPanelWidth = 250
}: CustomGanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewModeName>('Day')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flight', 'hotel', 'event', 'transport', 'note', 'task'])
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const [columnWidthMultiplier, setColumnWidthMultiplier] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  
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
  
  // Adjust container width based on zoom to calculate correct number of columns
  // If zoomed out (e.g., 0.5x), we need MORE columns to fill the same space
  const adjustedContainerWidth = containerWidth > 0 
    ? containerWidth / columnWidthMultiplier 
    : 0
  
  const { ganttStart, ganttEnd, columns, firstColumnDate } = useGanttDates(
    activities, 
    baseViewModeConfig,
    adjustedContainerWidth
  )
  
  // Apply column width multiplier to base config
  const viewModeConfig = useMemo(() => {
    const adjustedColumnWidth = Math.round(baseViewModeConfig.columnWidth * columnWidthMultiplier)
    
    if (viewMode === 'Month' && columns.length > 0 && containerWidth > 0) {
      // For month view, use dynamic width based on actual container width
      const minColumnWidth = 100
      const dynamicWidth = Math.max(minColumnWidth, Math.floor(containerWidth / columns.length))
      
      return {
        ...baseViewModeConfig,
        columnWidth: Math.round(dynamicWidth * columnWidthMultiplier)
      }
    }
    
    return {
      ...baseViewModeConfig,
      columnWidth: adjustedColumnWidth
    }
  }, [viewMode, baseViewModeConfig, columns.length, columnWidthMultiplier, containerWidth])
  
  // Zoom controls
  const handleZoomIn = () => {
    setColumnWidthMultiplier(prev => Math.min(prev + 0.25, 3)) // Max 3x
  }
  
  const handleZoomOut = () => {
    setColumnWidthMultiplier(prev => Math.max(prev - 0.25, 0.5)) // Min 0.5x
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
      {/* View Mode Selector and Zoom Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          {(['Day', 'Month'] as ViewModeName[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        
        {/* Zoom Controls */}
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
      <div className="flex-1 overflow-auto relative">
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
          <div className="z-50">
            <GanttUnifiedHeader
              columns={columns}
              viewModeConfig={viewModeConfig}
              leftPanelWidth={0}
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}
