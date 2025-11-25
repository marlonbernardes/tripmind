'use client'

import { useState, useMemo } from 'react'
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
  
  const baseViewModeConfig = VIEW_MODES[viewMode]
  const { ganttStart, ganttEnd, columns, firstColumnDate } = useGanttDates(activities, baseViewModeConfig)
  
  // Calculate dynamic column width for Month view to fill container
  const viewModeConfig = useMemo(() => {
    if (viewMode === 'Month' && columns.length > 0) {
      // Assume minimum viewport width of 950px (total width minus left panel)
      const minViewportWidth = 950
      const minColumnWidth = 100 // Minimum width for month columns
      const dynamicWidth = Math.max(minColumnWidth, Math.floor(minViewportWidth / columns.length))
      
      return {
        ...baseViewModeConfig,
        columnWidth: dynamicWidth
      }
    }
    return baseViewModeConfig
  }, [viewMode, baseViewModeConfig, columns.length])
  
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
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:h-full">
      {/* View Mode Selector */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
