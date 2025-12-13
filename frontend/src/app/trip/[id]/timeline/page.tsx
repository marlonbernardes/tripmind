'use client'

import { useMemo, useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronRight, Calendar, Layers, ChevronsUpDown, Plus } from 'lucide-react'
import { TripLayout } from '@/components/features/TripLayout'
import { TripSidePanel } from '@/components/features/TripSidePanel'
import { useTripContext } from '@/contexts/TripContext'
import type { SimpleActivity, ActivityType } from '@/types/simple'
import { getDateFromDateTime, getTimeFromDateTime } from '@/lib/mock-data'
import { getActivityColor, getActivityLabel, activityTypeConfig, allActivityTypes } from '@/lib/activity-config'

interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

type GroupByMode = 'date' | 'type'

// Condensed Activity Row Component
function CompactActivityRow({ 
  activity, 
  isSelected, 
  onClick,
  showDate = false
}: { 
  activity: SimpleActivity
  isSelected: boolean
  onClick: () => void
  showDate?: boolean
}) {
  const activityColor = getActivityColor(activity.type)
  const startTime = getTimeFromDateTime(activity.start)
  const startDate = getDateFromDateTime(activity.start)
  
  // Format date for type grouping view
  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  // Format day of week (3 letters)
  const formatDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${activity.status === 'planned' ? 'opacity-75' : ''}`}
    >
      {/* Color dot */}
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: activityColor }}
      />
      
      {/* Day of week and Date (only when grouped by type) */}
      {showDate && (
        <>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 w-7 flex-shrink-0">
            {formatDayOfWeek(startDate)}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-12 flex-shrink-0">
            {formatShortDate(startDate)}
          </span>
        </>
      )}
      
      {/* Time */}
      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-10 flex-shrink-0">
        {startTime}
      </span>
      
      {/* Title */}
      <span className="text-xs text-gray-900 dark:text-white truncate flex-1">
        {activity.title}
      </span>
      
      {/* Status badge */}
      {activity.status === 'planned' && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
          PLANNED
        </span>
      )}
      
      {/* City */}
      {activity.city && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-20 flex-shrink-0">
          {activity.city}
        </span>
      )}
    </div>
  )
}

// Collapsible Section Component
function CollapsibleSection({ 
  groupKey,
  title,
  subtitle,
  activities,
  selectedActivityId,
  onActivitySelect,
  isCollapsed,
  onToggleCollapse,
  onAddActivity,
  color,
  showDateInRows = false
}: { 
  groupKey: string
  title: string
  subtitle?: string
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect: (activity: SimpleActivity) => void
  isCollapsed: boolean
  onToggleCollapse: (key: string) => void
  onAddActivity: () => void
  color?: string
  showDateInRows?: boolean
}) {
  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Section Header */}
      <div
        onClick={() => onToggleCollapse(groupKey)}
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 sticky top-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleCollapse(groupKey)
          }
        }}
      >
        {/* Collapse indicator */}
        <div className="text-gray-400 dark:text-gray-500">
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </div>
        
        {/* Color indicator (for type grouping) */}
        {color && (
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        
        {/* Title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              • {subtitle}
            </span>
          )}
        </div>
        
        {/* Add Activity Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAddActivity()
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
      
      {/* Activities */}
      {!isCollapsed && (
        <div className="px-1 py-1">
          {sortedActivities.map((activity) => (
            <CompactActivityRow
              key={activity.id}
              activity={activity}
              isSelected={selectedActivityId === activity.id}
              onClick={() => onActivitySelect(activity)}
              showDate={showDateInRows}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Timeline Toolbar Component
function TimelineToolbar({
  groupBy,
  onGroupByChange,
  allCollapsed,
  onToggleAll
}: {
  groupBy: GroupByMode
  onGroupByChange: (mode: GroupByMode) => void
  allCollapsed: boolean
  onToggleAll: () => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 mr-1">Group:</span>
        <button
          onClick={() => onGroupByChange('date')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            groupBy === 'date'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-3 h-3" />
          Date
        </button>
        <button
          onClick={() => onGroupByChange('type')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            groupBy === 'type'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          Type
        </button>
      </div>
      
      <button
        onClick={onToggleAll}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      >
        <ChevronsUpDown className="w-3 h-3" />
        {allCollapsed ? 'Expand' : 'Collapse'}
      </button>
    </div>
  )
}

function TimelineContent() {
  const { activities, selectedActivity, setSelectedActivity } = useTripContext()
  const [groupBy, setGroupBy] = useState<GroupByMode>('date')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, SimpleActivity[]> = {}
    
    activities.forEach(activity => {
      const startDate = new Date(getDateFromDateTime(activity.start))
      
      if (activity.end) {
        // Multi-day activity: add to all days it spans
        const endDate = new Date(getDateFromDateTime(activity.end))
        const currentDate = new Date(startDate)
        
        while (currentDate <= endDate) {
          const dateKey = currentDate.toISOString().split('T')[0]
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push(activity)
          currentDate.setDate(currentDate.getDate() + 1)
        }
      } else {
        // Single day activity: add only to start date
        const dateKey = getDateFromDateTime(activity.start)
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(activity)
      }
    })
    
    // Sort dates
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => {
        const d = new Date(date)
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
        const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const cities = [...new Set(grouped[date].filter(a => a.city).map(a => a.city))]
        
        return { 
          key: date,
          title: `${dayName} ${monthDay}`,
          subtitle: cities.join(', '),
          activities: grouped[date]
        }
      })
  }, [activities])
  
  // Group activities by type
  const activitiesByType = useMemo(() => {
    const grouped: Record<ActivityType, SimpleActivity[]> = {
      flight: [],
      hotel: [],
      event: [],
      transport: [],
      note: [],
      task: []
    }
    
    activities.forEach(activity => {
      if (grouped[activity.type]) {
        grouped[activity.type].push(activity)
      }
    })
    
    // Only return types that have activities
    return allActivityTypes
      .filter(type => grouped[type].length > 0)
      .map(type => ({
        key: type,
        title: getActivityLabel(type),
        color: getActivityColor(type),
        activities: grouped[type]
      }))
  }, [activities])
  
  // Get current groups based on groupBy mode
  const currentGroups = groupBy === 'date' ? activitiesByDate : activitiesByType
  
  // Check if all groups are collapsed
  const allCollapsed = currentGroups.length > 0 && 
    currentGroups.every(group => collapsedGroups.has(group.key))
  
  // Toggle collapse for a single group
  const handleToggleCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }
  
  // Toggle all groups
  const handleToggleAll = () => {
    if (allCollapsed) {
      // Expand all
      setCollapsedGroups(new Set())
    } else {
      // Collapse all
      setCollapsedGroups(new Set(currentGroups.map(g => g.key)))
    }
  }
  
  // Handle group by change - reset collapsed state
  const handleGroupByChange = (mode: GroupByMode) => {
    setGroupBy(mode)
    setCollapsedGroups(new Set())
  }
  
  // Handle add activity - open create form
  const { setIsCreatingActivity } = useTripContext()
  const handleAddActivity = () => {
    setSelectedActivity(null)
    setIsCreatingActivity(true)
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Panel - Timeline (60% on desktop, full width on mobile) */}
      <div className="w-full md:w-[60%] h-[50%] md:h-full flex flex-col bg-white dark:bg-gray-950 md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-800">
        {/* Toolbar */}
        <TimelineToolbar
          groupBy={groupBy}
          onGroupByChange={handleGroupByChange}
          allCollapsed={allCollapsed}
          onToggleAll={handleToggleAll}
        />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <div className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  No activities yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add your first activity to get started
                </p>
              </div>
            </div>
          ) : (
            <div>
              {groupBy === 'date' ? (
                // Group by Date
                activitiesByDate.map((group) => (
                  <CollapsibleSection
                    key={group.key}
                    groupKey={group.key}
                    title={group.title}
                    subtitle={group.subtitle}
                    activities={group.activities}
                    selectedActivityId={selectedActivity?.id}
                    onActivitySelect={setSelectedActivity}
                    isCollapsed={collapsedGroups.has(group.key)}
                    onToggleCollapse={handleToggleCollapse}
                    onAddActivity={handleAddActivity}
                  />
                ))
              ) : (
                // Group by Type
                activitiesByType.map((group) => (
                  <CollapsibleSection
                    key={group.key}
                    groupKey={group.key}
                    title={group.title}
                    activities={group.activities}
                    selectedActivityId={selectedActivity?.id}
                    onActivitySelect={setSelectedActivity}
                    isCollapsed={collapsedGroups.has(group.key)}
                    onToggleCollapse={handleToggleCollapse}
                    onAddActivity={handleAddActivity}
                    color={group.color}
                    showDateInRows
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Details/Recommendations/AI Chat (40% on desktop, full width on mobile) */}
      <div className="w-full md:w-[40%] h-[50%] md:h-full">
        <TripSidePanel />
      </div>
    </div>
  )
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { id: tripId } = React.use(params)
  
  return (
    <TripLayout tripId={tripId} hideSidePanel>
      <TimelineContent />
    </TripLayout>
  )
}
